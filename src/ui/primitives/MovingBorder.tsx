import type { CSSProperties, ReactNode } from "react";
import "./movingBorder.css";

type BorderMeasure = number | string;

export interface MovingBorderProps {
  radius?: BorderMeasure;
  borderWidth?: BorderMeasure;
  gradientWidth?: number;
  duration?: number;
  colors?: readonly string[];
  isCircle?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const toCssMeasure = (value: BorderMeasure) =>
  typeof value === "number" ? `${value}px` : value;

export default function MovingBorder({
  radius = 18,
  borderWidth = 1,
  gradientWidth = 58,
  duration = 7.5,
  colors,
  isCircle = false,
  children,
  className = "",
  style,
}: MovingBorderProps) {
  const mergedStyle = {
    "--mb-radius": isCircle ? "999px" : toCssMeasure(radius),
    "--mb-border-width": toCssMeasure(borderWidth),
    "--mb-gradient-width": `${gradientWidth}deg`,
    "--mb-duration": `${duration}s`,
    ...(colors?.[0] ? { "--mb-color-a": colors[0] } : {}),
    ...(colors?.[1] ? { "--mb-color-b": colors[1] } : {}),
    ...(colors?.[2] ? { "--mb-color-c": colors[2] } : {}),
    ...style,
  } as CSSProperties;

  return (
    <span
      className={["moving-border", className].filter(Boolean).join(" ")}
      data-circle={isCircle ? "true" : undefined}
      style={mergedStyle}
      aria-hidden={children ? undefined : "true"}
    >
      <span className="moving-border-track" />
      <span className="moving-border-sweep" />
      {children && <span className="moving-border-content">{children}</span>}
    </span>
  );
}
