import { useEffect, useRef, useState } from "react";
import type {
  ConnectionAnnotationOverride,
  ResolvedConnectionAnnotation,
} from "../../domain/graph/types";
import {
  beginContentEdit,
  changeContentEdit,
  resolveContentEditBlur,
  resolveContentEditKey,
  type ContentEditResolution,
} from "../../interaction/contentEditSession";
import { SwitchRow } from "./controls";

export function ConnectionAnnotationTextField({
  label,
  value,
  multiline,
  placeholder,
  onCommit,
  enterApplies = false,
}: {
  label: string;
  value: string;
  multiline: boolean;
  placeholder: string;
  onCommit: (value: string) => void;
  enterApplies?: boolean;
}) {
  const [draft, setDraft] = useState(value);
  const session = useRef(beginContentEdit(value));
  useEffect(() => {
    session.current = beginContentEdit(value);
    setDraft(value);
  }, [value]);

  const apply = (result: ContentEditResolution) => {
    session.current = result.session;
    if (result.action.kind === "cancel") setDraft(result.action.value);
    if (result.action.kind === "commit") onCommit(result.action.value);
  };
  const shared = {
    value: draft,
    "aria-label": label,
    placeholder,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      session.current = changeContentEdit(session.current, event.target.value);
      setDraft(session.current.draft);
    },
    onBlur: () => apply(resolveContentEditBlur(session.current)),
  };

  return <label className="m1-field">
    <span>{label}</span>
    {multiline ? <textarea
      {...shared}
      rows={3}
      onKeyDown={(event) => {
        const result = resolveContentEditKey(session.current, {
          key: event.key,
          shiftKey: event.shiftKey,
          multiline: true,
        });
        if (result.action.kind !== "none" && !(enterApplies && event.key === "Enter")) event.preventDefault();
        apply(result);
        if (result.blur) event.currentTarget.blur();
      }}
    /> : <input
      {...shared}
      type="text"
      onKeyDown={(event) => {
        const result = resolveContentEditKey(session.current, {
          key: event.key,
          shiftKey: event.shiftKey,
          multiline: false,
        });
        if (result.action.kind !== "none" && !(enterApplies && event.key === "Enter")) event.preventDefault();
        apply(result);
        if (result.blur) event.currentTarget.blur();
      }}
    />}
  </label>;
}

export function ConnectionAnnotationContentControls({
  annotation,
  relationshipTypeName,
  onChange,
  enterApplies = false,
}: {
  annotation: ResolvedConnectionAnnotation;
  relationshipTypeName: string;
  onChange: (patch: ConnectionAnnotationOverride) => void;
  enterApplies?: boolean;
}) {
  const [bodyOpened, setBodyOpened] = useState(annotation.body.source !== "hidden");
  useEffect(() => setBodyOpened(annotation.body.source !== "hidden"), [annotation.body.source]);
  const titleOn = annotation.title.source !== "hidden";
  const bodyOn = bodyOpened || annotation.body.source !== "hidden";

  return <div className="connection-annotation-content-controls">
    <SwitchRow
      label="Title"
      on={titleOn}
      onToggle={() => onChange({
        title: titleOn ? { source: "hidden" } : { source: "relationship-type" },
      })}
    />
    {titleOn && <>
      <label className="m1-field">
        <span>Source</span>
        <select
          aria-label="Title source"
          value={annotation.title.source === "custom" ? "custom" : "relationship-type"}
          onChange={(event) => onChange({
            title: event.target.value === "custom"
              ? { source: "custom", text: annotation.title.text || relationshipTypeName }
              : { source: "relationship-type" },
          })}
        >
          <option value="relationship-type">Relationship Type</option>
          <option value="custom">Custom</option>
        </select>
      </label>
      {annotation.title.source === "custom" && <ConnectionAnnotationTextField
        label="Custom title"
        value={annotation.title.text}
        multiline={false}
        placeholder="Add a custom title"
        enterApplies={enterApplies}
        onCommit={(text) => onChange({ title: { source: "custom", text } })}
      />}
    </>}
    <SwitchRow
      label="Body"
      on={bodyOn}
      onToggle={() => {
        if (bodyOn) {
          setBodyOpened(false);
          onChange({ body: { source: "hidden" } });
        } else {
          setBodyOpened(true);
        }
      }}
    />
    {bodyOn && <ConnectionAnnotationTextField
      label="Body text"
      value={annotation.body.text}
      multiline
      placeholder="Add relationship details"
      onCommit={(text) => onChange({ body: { source: "custom", text } })}
    />}
  </div>;
}
