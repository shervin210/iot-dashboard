import { ConnectionStatusBadge } from "./ConnectionStatusBadge.js";

export function Header() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
      <div className="flex items-center gap-3">
          <h1 className="text-[17px] tracking-[-0.01em]">Welcomeeee</h1>
      </div>
      <ConnectionStatusBadge />
    </header>
  );
}
