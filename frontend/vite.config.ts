import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Requests from the browser always go to relative paths (`/api/...`,
// `/socket.io/...`) on this app's own origin — never a cross-origin
// backend URL. Vite's dev-server proxy (and nginx in production, see
// frontend/nginx.conf) forwards those paths to the backend server-side.
// This mirrors how a Next.js app uses rewrites/API routes to make
// backend calls feel "local": no CORS, no hardcoded backend host in
// client code, same request shape in dev and prod.
const BACKEND_TARGET = process.env.BACKEND_URL ?? "http://localhost:4000";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src")
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: BACKEND_TARGET, changeOrigin: true },
      "/socket.io": { target: BACKEND_TARGET, changeOrigin: true, ws: true }
    }
  }
});
