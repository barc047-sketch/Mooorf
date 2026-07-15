export type ContentEditExit = "active" | "cancelled" | "committed";

export interface ContentEditSession {
  canonical: string;
  draft: string;
  exit: ContentEditExit;
}

export type ContentEditAction =
  | { kind: "none" }
  | { kind: "cancel"; value: string }
  | { kind: "commit"; value: string };

export interface ContentEditResolution {
  session: ContentEditSession;
  action: ContentEditAction;
  blur: boolean;
}

export const beginContentEdit = (canonical: string): ContentEditSession => ({
  canonical,
  draft: canonical,
  exit: "active",
});

export const changeContentEdit = (
  session: ContentEditSession,
  draft: string
): ContentEditSession => ({ ...session, draft, exit: "active" });

export const resolveContentEditKey = (
  session: ContentEditSession,
  input: { key: string; shiftKey?: boolean; multiline?: boolean }
): ContentEditResolution => {
  if (input.key === "Escape") {
    return {
      session: { ...session, draft: session.canonical, exit: "cancelled" },
      action: { kind: "cancel", value: session.canonical },
      blur: true,
    };
  }
  if (input.key === "Enter" && !(input.multiline && input.shiftKey)) {
    return {
      session: { ...session, exit: "committed" },
      action: { kind: "commit", value: session.draft },
      blur: true,
    };
  }
  return { session, action: { kind: "none" }, blur: false };
};

export const resolveContentEditBlur = (
  session: ContentEditSession
): ContentEditResolution => {
  if (session.exit !== "active") {
    return {
      session: beginContentEdit(session.canonical),
      action: { kind: "none" },
      blur: false,
    };
  }
  return {
    session: { ...session, exit: "committed" },
    action: { kind: "commit", value: session.draft },
    blur: false,
  };
};
