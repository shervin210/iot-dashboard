import type { ChangeEvent } from "react";
import type { DeviceFilters } from "../../hooks/useDevices.js";

const field =
  "rounded-sm border border-border bg-surface px-2.5 py-2 text-[13px] text-ink";

interface DeviceFiltersBarProps {
  filters: DeviceFilters;
  onChange: (filters: DeviceFilters) => void;
  resultCount: number;
}

export function DeviceFiltersBar({
  filters,
  onChange,
  resultCount,
}: DeviceFiltersBarProps) {
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...filters, search: e.target.value });
  const handleStatus = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...filters, status: e.target.value as DeviceFilters["status"] });
  const handlePriority = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange({
      ...filters,
      priority: e.target.value as DeviceFilters["priority"],
    });

  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
      <input
        type="search"
        className={`${field} min-w-50 flex-1`}
        placeholder="Search by name or ID…"
        value={filters.search}
        onChange={handleSearch}
        aria-label="Search devices"
      />
      <select
        className={field}
        value={filters.status}
        onChange={handleStatus}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="online">Online</option>
        <option value="offline">Offline</option>
      </select>
      <select
        className={field}
        value={filters.priority}
        onChange={handlePriority}
        aria-label="Filter by priority"
      >
        <option value="all">All priorities</option>
        <option value="normal">Normal</option>
        <option value="warning">Warning</option>
        <option value="urgent">Urgent</option>
      </select>
      <span className="ml-auto font-mono text-[11px] text-faint">
        {resultCount} devices
      </span>
    </div>
  );
}
