"use client";

function getRecordString(value: unknown, key: string): string | null {
  if (!value || typeof value !== "object") return null;
  const candidate = (value as Record<string, unknown>)[key];
  return typeof candidate === "string" && candidate.length > 0 ? candidate : null;
}

function getProgressLabel(status: unknown): string | null {
  if (!status || typeof status !== "object") return null;
  const progress = (status as Record<string, unknown>).progress;

  return typeof progress === "number" && Number.isFinite(progress)
    ? `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%`
    : null;
}

export function FileDropPresentationMessages({
  feedback,
  status,
}: {
  feedback: unknown;
  status: unknown;
}): React.JSX.Element | null {
  const feedbackMessage = getRecordString(feedback, "message");
  const feedbackCode = getRecordString(feedback, "code");
  const statusLabel = getRecordString(status, "label");
  const progressLabel = getProgressLabel(status);

  if (!feedbackMessage && !statusLabel) return null;

  return (
    <div className="flex min-w-0 flex-col gap-1 text-xs leading-snug">
      {statusLabel ? (
        <p
          aria-live="polite"
          className="m-0 text-[color:var(--muted-foreground)]"
          data-slot="file-drop-status"
          role="status"
        >
          {statusLabel}
          {progressLabel ? ` ${progressLabel}` : ""}
        </p>
      ) : null}
      {feedbackMessage ? (
        <p
          className="m-0 text-[color:var(--destructive)]"
          data-file-drop-feedback-code={feedbackCode ?? undefined}
          data-slot="file-drop-feedback"
          role="alert"
        >
          {feedbackMessage}
        </p>
      ) : null}
    </div>
  );
}
