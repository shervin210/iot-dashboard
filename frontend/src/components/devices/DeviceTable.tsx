import { useState } from "react";
import { panel } from "../../styles/ui.js";
import { DeviceFiltersBar } from "./DeviceFiltersBar.js";
import { DeviceTableRow } from "./DeviceTableRow.js";
import { Pagination } from "../common/Pagination.js";
import { EmptyState } from "../common/States.js";
import { useDebouncedValue } from "../../hooks/useDebouncedValue.js";
import { usePagination } from "../../hooks/usePagination.js";
import {
  defaultDeviceFilters,
  useFilteredDevices,
  type DeviceFilters,
} from "../../hooks/useDevices.js";

const PAGE_SIZE = 10;

const th =
  "border-b border-border px-3 py-2 text-left text-[10px] font-normal uppercase tracking-[0.07em] text-faint";

interface DeviceTableProps {
  selectedDeviceId: string | undefined;
  onSelectDevice: (id: string) => void;
}

export function DeviceTable({
  selectedDeviceId,
  onSelectDevice,
}: DeviceTableProps) {
  const [rawFilters, setRawFilters] =
    useState<DeviceFilters>(defaultDeviceFilters);
  const debouncedSearch = useDebouncedValue(rawFilters.search, 250);
  const activeFilters: DeviceFilters = {
    ...rawFilters,
    search: debouncedSearch,
  };
  const devices = useFilteredDevices(activeFilters);
  const { items, page, totalPages, setPage } = usePagination(
    devices,
    PAGE_SIZE,
  );

  return (
    <section className={panel}>
      <DeviceFiltersBar
        filters={rawFilters}
        onChange={setRawFilters}
        resultCount={devices.length}
      />

      {items.length === 0 ? (
        <EmptyState message="No devices match the current filters." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-180 border-collapse">
            <thead>
              <tr>
                <th className={th}>Device</th>
                <th className={th}>Building</th>
                <th className={th}>Status</th>
                <th className={th}>Priority</th>
                <th className={th}>Battery</th>
                <th className={th}>Signal</th>
                <th className={th}>Last seen</th>
                <th className={th} aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {items.map((device) => (
                <DeviceTableRow
                  key={device.id}
                  device={device}
                  isSelected={device.id === selectedDeviceId}
                  onSelect={onSelectDevice}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
