import { useConnectionStatus } from "../../hooks/useAlerts.js";

const LABELS: Record<string, string> = {
  connected: "Live",
  connecting: "Connecting…",
  disconnected: "Disconnected",
};

const BADGE_TONES: Record<string, string> = {
  connected: "bg-success-soft text-[#0f7a3d]",
  connecting: "bg-warning-soft text-[#a05a05]",
  disconnected: "bg-urgent-soft text-[#a51c1c]",
};

const DOT_TONES: Record<string, string> = {
  connected: "bg-success shadow-[0_0_0_3px_rgba(22,163,74,0.18)]",
  connecting: "bg-warning",
  disconnected: "bg-urgent",
};

export function ConnectionStatusBadge() {
  const { status } = useConnectionStatus();

  return (
    <span
      className={`inline-flex items-center gap-[7px] rounded-full px-2.5 py-1.5 font-mono text-[11px] ${
        BADGE_TONES[status] ?? "bg-offline-soft text-muted"
      }`}
    >
      <span
        className={`size-[7px] rounded-full ${DOT_TONES[status] ?? "bg-offline"}`}
        aria-hidden="true"
      />
      {LABELS[status]}
    </span>
  );
}
