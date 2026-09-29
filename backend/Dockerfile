FROM node:22-alpine AS base

WORKDIR /app

RUN corepack enable

FROM base AS deps

COPY package.json yarn.lock .yarnrc.yml ./

COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

RUN yarn install --immutable

FROM deps AS build

COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/src ./backend/src

RUN yarn workspace backend build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./dist
COPY backend/package.json ./package.json

EXPOSE 4000

CMD ["node", "--env-file-if-exists=.env", "dist/index.js"]