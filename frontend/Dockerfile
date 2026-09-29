FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json yarn.lock .yarnrc.yml ./

COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN yarn install --immutable

FROM deps AS build

COPY frontend ./frontend

RUN yarn workspace frontend build

FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]