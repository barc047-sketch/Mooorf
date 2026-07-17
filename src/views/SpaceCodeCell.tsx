import { useEffect, useRef, useState } from "react";
import { normalizeSpaceCode } from "../labels/spaceCode";
import { useLab } from "../state/store";
import type { SpaceCell } from "../types";
import {
  beginContentEdit,
  changeContentEdit,
  resolveContentEditBlur,
  resolveContentEditKey,
  type ContentEditResolution,
} from "../interaction/contentEditSession";
import { Input } from "@/components/ui/input";

export default function SpaceCodeCell({ cell }: { cell: SpaceCell }) {
  const updateSpace = useLab((state) => state.updateSpace);
  const canonical = cell.spaceCode ?? "";
  const [draft, setDraft] = useState(canonical);
  const session = useRef(beginContentEdit(canonical));

  useEffect(() => {
    session.current = beginContentEdit(canonical);
    setDraft(canonical);
  }, [canonical]);

  const commit = (value: string) => {
    const spaceCode = normalizeSpaceCode(value);
    if (spaceCode && spaceCode !== canonical) updateSpace(cell.id, { spaceCode });
  };
  const apply = (result: ContentEditResolution) => {
    session.current = result.session;
    if (result.action.kind === "cancel") setDraft(result.action.value);
    if (result.action.kind === "commit") commit(result.action.value);
  };

  return (
    <Input
      className="h-7 w-16 font-mono tabular-nums"
      value={draft}
      onChange={(event) => {
        session.current = changeContentEdit(session.current, event.target.value);
        setDraft(session.current.draft);
      }}
      onBlur={() => apply(resolveContentEditBlur(session.current))}
      onKeyDown={(event) => {
        const result = resolveContentEditKey(session.current, { key: event.key });
        if (result.action.kind === "commit") event.preventDefault();
        apply(result);
        if (result.blur) event.currentTarget.blur();
      }}
      aria-label={`Space No. of ${cell.name}`}
    />
  );
}
