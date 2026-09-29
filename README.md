# IoT Monitoring Dashboard — Setup, Run and Project Guide

A real-time dashboard for monitoring a fleet of simulated IoT gateways (fire-alarm panels). The backend simulates the devices and pushes changes over Socket.IO. The frontend shows them in a table, a map, KPI cards and an alert list.

---

## 1. Tech stack

| Area | Technology |
|---|---|
| Runtime | Node.js 22+ |
| Package manager | **Yarn 4.10.3** (Berry) with `nodeLinker: node-modules` |
| Repo layout | Monorepo using Yarn workspaces (`backend` and `frontend`) |
| Backend | TypeScript (strict, ESM / NodeNext) + Express 5 + Socket.IO 4 + helmet + cors + morgan |
| Frontend | React 19 + TypeScript + Vite + axios + socket.io-client + Leaflet (map) + lucide-react (icons) |
| Deployment | Docker Compose: a Node container for the backend, an nginx container for the frontend |
| Database | **None.** All state is in memory and resets on restart |

> Note: the READMEs in this project (root, backend, frontend) still mention `pnpm` and `pnpm-workspace.yaml`. The project actually uses **Yarn** and no such file exists. Use `yarn` wherever the READMEs say `pnpm`.

---

## 2. Folder structure

```
iot-dashboard/
├── package.json            # root: workspaces + shared scripts
├── yarn.lock
├── .yarnrc.yml             # nodeLinker: node-modules
├── docker-compose.yml      # full stack: backend + frontend (nginx)
├── .dockerignore / .gitignore
├── backend/
│   ├── .env.example        # sample env file
│   ├── Dockerfile
│   ├── package.json / tsconfig.json
│   ├── src/
│   │   ├── index.ts            # composition root: wires everything and starts listening
│   │   ├── app.ts              # createApp() — Express app factory (no listen)
│   │   ├── routes/             # devices, dashboard, alerts (thin layer)
│   │   ├── services/           # deviceStore, alertStore, dashboardService
│   │   ├── simulator/          # deviceFactory (initial fleet) + engine (ticks and events)
│   │   ├── socket/socketServer.ts
│   │   ├── types/domain.ts
│   │   └── utils/random.ts
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── vite.config.ts      # dev proxy
    ├── index.html
    ├── src/
    │   ├── api/            # httpClient (the only file importing axios) + services
    │   ├── realtime/       # socketClient (singleton) + reducer + Context
    │   ├── hooks/          # useAsync, useMutation, useDevices, useAlerts, ...
    │   ├── components/     # layout, dashboard, devices, alerts, map, common
    │   ├── pages/DashboardPage.tsx
    │   ├── types/domain.ts # mirrors the backend contract
    │   └── styles/global.css
```

The `backend/dist`, `frontend/dist`, `.yarn/` and `.qodo/` folders in the zip are build output and tooling files. They don't need to be committed (`dist` is already in `.gitignore`).

---

## 3. Prerequisites

- Node.js **22 or newer** (required by `engines`, and the `--env-file-if-exists` flag needs a recent Node)
- Yarn 4 via corepack (no manual install needed)
- Docker and Docker Compose (only if you want to run with Docker)

```bash
corepack enable        # picks the yarn version from "packageManager" in package.json
node -v                # must be >= 22
```

---

## 4. Running locally (dev)

From the project root:

```bash
# 1) Install dependencies for both workspaces from a single lockfile
yarn install

# 2) Create the backend env file
cp backend/.env.example backend/.env

# 3) Run
yarn dev
```

`yarn dev` starts both servers in parallel. If you prefer separate terminals:

```bash
yarn dev:backend     # http://localhost:4000  (tsx watch)
yarn dev:frontend    # http://localhost:5173  (vite)
```

Then open `http://localhost:5173`.

**Why only open port 5173?** The frontend always sends requests to relative paths (`/api/...` and `/socket.io/...`) on its own origin. Vite (`server.proxy`) forwards them to `http://localhost:4000`. As a result, no CORS setup is needed and the backend address is not hardcoded in the frontend code.

---

## 5. Running with Docker

```bash
docker compose up --build
# or
yarn docker:up
yarn docker:down       # stop everything
```

- Frontend (nginx): `http://localhost:5173`, which maps to port 80 inside the container
- Backend directly: `http://localhost:4000` (exposed for debugging, e.g. `http://localhost:4000/health`)

Startup order: the frontend only starts after the backend healthcheck (`GET /health`) is healthy (`depends_on: condition: service_healthy`).

---

## 6. Environment variables

### Backend

Sample file: `backend/.env.example`

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | HTTP and WebSocket port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed origin for REST and Socket.IO |
| `DEVICE_COUNT` | `100` | Number of simulated gateways created on startup |
| `TICK_INTERVAL_MS` | `1500` | Interval between simulator ticks (milliseconds) |

- The `.env` file is loaded by Node's `--env-file-if-exists=.env` flag, so `dotenv` is not needed. If `.env` is missing, nothing breaks and the defaults apply.
- `.env` is listed in both `.gitignore` and `.dockerignore`. Only `.env.example` is committed.
- **In Docker, the `.env` file is not copied into the image.** Values come from the `environment` section of `docker-compose.yml`, written as `${VAR:-default}`. To change them, pass them when you run compose:

```bash
DEVICE_COUNT=500 TICK_INTERVAL_MS=1000 docker compose up --build
```

Or put a `.env` file next to `docker-compose.yml` (in the project root), which compose reads for variable substitution.

### Frontend

**No env file is needed.** The only optional variable is `BACKEND_URL`, read by `vite.config.ts` only. It changes the dev proxy target (default `http://localhost:4000`):

```bash
BACKEND_URL=http://192.168.1.10:4000 yarn dev:frontend
```

---

## 7. Scripts (from the root)

| Command | What it does |
|---|---|
| `yarn install` | Install both workspaces |
| `yarn dev` | Run backend and frontend in parallel |
| `yarn dev:backend` / `yarn dev:frontend` | Run them separately |
| `yarn build` | Build both (backend with `tsc`, frontend with `tsc --noEmit && vite build`) |
| `yarn typecheck` | Type-check both packages with no emit |
| `yarn docker:up` / `yarn docker:down` | Docker Compose up / down |

Running the built app without Docker:

```bash
yarn build
yarn workspace backend start            # node dist/index.js on :4000
yarn workspace frontend preview         # serves the build on :5173 (proxy settings come from vite.config)
```

---

## 8. How the backend works

- **Single source of truth:** `DeviceStore` is the only place device state lives. REST reads from it, the simulator writes to it, and the socket layer only relays changes.
- **Per-device `version`:** it increments on every change. The frontend uses it to detect and drop late, out-of-order events.
- **Simulator (`simulator/engine.ts`):** on every tick, about 15% of devices get a small telemetry drift (battery, temperature, signal), online devices only. There is also a 12% chance per tick that a random scenario runs on a random device.
- **`applyEvent()` is the only path that creates events:** both the random tick and `POST /api/devices/:id/simulate` go through it, so manual scenarios behave exactly like random ones. Event types: `urgent_alarm`, `technical_fault`, `power_failure`, `disconnect`, `reconnect`, `resolve_alarm`.
- **`priority` is derived, not stored independently:** it is computed from `urgentAlarm / hasFaults / acPower`, so it can never contradict those flags.
- **Resync via snapshot:** every time a client connects (or reconnects) to the socket, the server sends a full `sync:snapshot` (devices, active alerts, summary). The client doesn't have to guess what it missed.
- **`app.ts` is separate from `index.ts`:** `createApp()` builds the Express app without listening, and `index.ts` wires the stores, simulator, HTTP server and socket server together and starts listening.

### REST API

| Method | Endpoint | Notes |
|---|---|---|
| GET | `/health` | Liveness check (used by the Docker healthcheck) |
| GET | `/api/devices` | Query: `search`, `status`, `priority`, `page`, `pageSize` (max 200), `sortBy=lastSeen` |
| GET | `/api/devices/:id` | `{ data, history }` |
| POST | `/api/devices/:id/simulate` | Body: `{ "eventType": "urgent_alarm" \| ... }` |
| GET | `/api/dashboard/summary` | KPI counters |
| GET | `/api/alerts` | `?includeResolved=true` to include resolved alerts |
| POST | `/api/alerts/:id/resolve` | Resolve a single alert |

### Socket.IO events (server to client)

`sync:snapshot`, `device:updated`, `device:connected`, `device:disconnected`, `alert:created`, `alert:resolved`, `dashboard:summary`

---

## 9. How the frontend works

- **One axios instance:** `api/httpClient.ts` is the only file that imports axios. `baseURL` is the relative path `/api`, and errors are normalized into `ApiError` (10 second timeout).
- **Socket singleton:** `realtime/socketClient.ts` creates only one connection, even with StrictMode or remounts.
- **Version-guarded reducer:** `deviceRealtimeReducer` drops any `device:updated` whose `version` isn't greater than what it already has. This is the most important behavior in the app.
- **Client-side filter / sort / pagination:** these run on the same live store the table renders from, so incoming live events don't reset the search or the current page.
- **Leaflet used directly (no react-leaflet):** markers are diffed imperatively so it stays light with a large number of devices.
- **No chart library:** the sparkline is a hand-written SVG component of about 40 lines.

---

## 10. What Docker actually builds

- **`backend/Dockerfile`** (multi-stage on `node:22-alpine`): `deps` (install with `yarn install --immutable`), then `build` (`tsc`), then `runtime` (only `dist` and `node_modules`, with `NODE_ENV=production`, running `node dist/index.js`).
- **`frontend/Dockerfile`**: `deps`, then `build` (`vite build`), then `nginx:1.27-alpine`, which serves the build output.
- **The build context for both is the project root**, because the workspace and `yarn.lock` live there.
- The root `.dockerignore` keeps `dist`, `node_modules` and `.env` files out of the images.

---

## 11. What is `nginx.conf` for, and is it needed?

**What it does:** in production/Docker it does two jobs:

1. **Serves the static files.** The output of `vite build` is just HTML/CSS/JS with no server of its own. nginx serves it from `/usr/share/nginx/html`. `try_files $uri /index.html` is the SPA fallback, so refreshing on any route returns `index.html`.
2. **Acts as a reverse proxy.** The frontend sends requests to `/api/` and `/socket.io/` on its own origin (not `localhost:4000`), so nginx forwards them to `backend:4000` (the service name on the compose network). This is exactly what the Vite proxy does in dev.

Other parts of the file:

- `location /socket.io/` passes the `Upgrade` and `Connection` headers (needed for the WebSocket handshake) and sets `proxy_read_timeout 3600s`, since the default is 60 seconds and would kill idle sockets.
- `location /health` proxies to the backend health endpoint.
- `/assets/` gets a one-year immutable cache because filenames are hashed. `index.html` is deliberately `no-cache` so a new deploy is picked up immediately.
- `gzip` is enabled for css/js/json/svg.

**Do you need it?**

- **For local `yarn dev`: no.** Vite's proxy does the job and nginx isn't involved.
- **For the Docker setup of this project: yes, effectively.** The frontend code uses relative paths, so something has to serve the static files and forward `/api` and `/socket.io` to the backend.
- **Alternatives if you don't want nginx:**
  - Let Express serve the frontend build itself (`express.static`). That gives you one service and one origin, so no proxy is needed.
  - Or host the frontend separately on a static host. Then you'd have to give the code an absolute backend URL (for example a `VITE_API_URL` variable) and set `CORS_ORIGIN` correctly.

---

## 12. Notes and limitations

- **No database:** devices and alerts are regenerated on every restart.
- **No auth or rate limiting:** especially on `POST /simulate`. You'd need both for anything real.
- **The READMEs are outdated:** they say `pnpm`, `pnpm-workspace.yaml` and `catalog:` everywhere, but the project uses Yarn and each `package.json` pins its own versions. The comments in `docker-compose.yml` and the backend README (which says TypeScript 7) have the same problem, since `package.json` says `^5.9.2`.
- **The backend image is heavier than necessary:** the full `node_modules` (including devDependencies) is copied into the runtime stage. To slim it down, install only production dependencies in the final stage.
- **`backend/dist`, `frontend/dist`, `.yarn/install-state.gz` and the empty `.qodo` folder** should be removed from the zip/repo before delivery or pushing.

---

## 13. Quick summary

```bash
corepack enable
yarn install
cp backend/.env.example backend/.env
yarn dev                     # http://localhost:5173

# or the full stack with Docker
docker compose up --build    # http://localhost:5173
```
### Note

The backend implementation was written with the help of AI. I understand the underlying logic and flow; the main difference for me is the language and framework, since my primary experience is with PHP.

Thanks for your time and review! :)
