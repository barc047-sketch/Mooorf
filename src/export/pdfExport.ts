import type { ExportOrientation, ExportPageSize } from "./types";
import { fitRect, resolvePageSize } from "./pageLayout";

const MARGIN_PT = 36;
const TITLE_SIZE = 20;
const META_SIZE = 9;
const TITLE_GAP_PT = 28;
const META_GAP_PT = 22;

export interface PdfMetadataLine {
  programmedAreaM2?: number;
  spaceCount?: number;
  renderer?: "organism" | "classic";
  exportDate?: Date;
}

export interface BuildPresentationPdfOptions {
  canvas: HTMLCanvasElement;
  page: ExportPageSize;
  orientation: ExportOrientation;
  title?: string;
  metadata?: PdfMetadataLine;
}

const canvasToPngBytes = (canvas: HTMLCanvasElement): Uint8Array => {
  const dataUrl = canvas.toDataURL("image/png");
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

const formatMetaLine = (meta: PdfMetadataLine): string =>
  [
    typeof meta.programmedAreaM2 === "number"
      ? `${Math.round(meta.programmedAreaM2).toLocaleString()} m² programmed`
      : null,
    typeof meta.spaceCount === "number" ? `${meta.spaceCount} spaces` : null,
    meta.renderer ? (meta.renderer === "organism" ? "Organism" : "Classic") : null,
    meta.exportDate
      ? meta.exportDate.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
      : null,
  ]
    .filter(Boolean)
    .join("  ·  ");

/** Single-page editorial presentation: optional title, the composited
 * canvas image fit within margins preserving aspect ratio, optional
 * metadata footer. Dynamically imports pdf-lib (kept out of the main
 * bundle) — call only from the export service. */
export const buildPresentationPdf = async (options: BuildPresentationPdfOptions): Promise<Uint8Array> => {
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
  const { canvas, page, orientation, title, metadata } = options;
  const pageSize = resolvePageSize(page, orientation);

  const pdfDoc = await PDFDocument.create();
  const pdfPage = pdfDoc.addPage([pageSize.width, pageSize.height]);
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const ink = rgb(0.09, 0.09, 0.1);
  const fog = rgb(0.45, 0.45, 0.46);

  const hasTitle = Boolean(title && title.trim());
  const metaLine = metadata ? formatMetaLine(metadata) : "";
  const hasMeta = metaLine.length > 0;

  const topInset = MARGIN_PT + (hasTitle ? TITLE_GAP_PT : 0);
  const bottomInset = MARGIN_PT + (hasMeta ? META_GAP_PT : 0);
  const boxW = pageSize.width - MARGIN_PT * 2;
  const boxH = pageSize.height - topInset - bottomInset;

  if (hasTitle) {
    pdfPage.drawText(title!.trim(), {
      x: MARGIN_PT,
      y: pageSize.height - MARGIN_PT - TITLE_SIZE * 0.8,
      size: TITLE_SIZE,
      font,
      color: ink,
    });
  }

  if (canvas.width > 0 && canvas.height > 0) {
    const pngBytes = canvasToPngBytes(canvas);
    const pngImage = await pdfDoc.embedPng(pngBytes);
    const fitted = fitRect(canvas.width, canvas.height, boxW, boxH);
    pdfPage.drawImage(pngImage, {
      x: MARGIN_PT + fitted.x,
      y: bottomInset + fitted.y,
      width: fitted.width,
      height: fitted.height,
    });
  }

  if (hasMeta) {
    pdfPage.drawText(metaLine, {
      x: MARGIN_PT,
      y: MARGIN_PT - 4,
      size: META_SIZE,
      font: bodyFont,
      color: fog,
    });
  }

  return pdfDoc.save();
};
