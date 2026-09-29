import { useToast } from "./ToastContext.js";

export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-100 flex max-w-85 flex-col gap-2"
      aria-live="assertive"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-2.5 rounded-sm border border-border border-l-4 bg-surface px-3.5 py-3 text-[12.5px] shadow-card animate-slide-in ${
            toast.variant === "urgent" ? "border-l-urgent" : "border-l-accent"
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            className="ml-auto cursor-pointer border-0 bg-transparent text-sm text-faint"
            onClick={() => dismissToast(toast.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
