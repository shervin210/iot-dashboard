import { btn } from "../../styles/ui.js";

const stateBase = "flex items-center justify-center gap-2.5 p-6 text-[13px]";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className={`${stateBase} text-muted`} role="status">
      <span
        className="size-3.5 rounded-full border-2 border-border border-t-accent animate-spin"
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className={`${stateBase} text-urgent`} role="alert">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className={btn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className={`${stateBase} text-muted`}>
      <span>{message}</span>
    </div>
  );
}
