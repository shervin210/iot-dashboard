import { DeviceRealtimeProvider } from "./realtime/DeviceRealtimeContext.js";
import { ToastProvider } from "./components/common/ToastContext.js";
import { ToastViewport } from "./components/common/ToastViewport.js";
import { AlarmNotifier } from "./components/common/AlarmNotifier.js";
import { AppShell } from "./components/layout/AppShell.js";
import { DashboardPage } from "./pages/DashboardPage.js";

export function App() {
  return (
    <DeviceRealtimeProvider>
      <ToastProvider>
        <AlarmNotifier />
        <ToastViewport />
        <AppShell>
          <DashboardPage />
        </AppShell>
      </ToastProvider>
    </DeviceRealtimeProvider>
  );
}
