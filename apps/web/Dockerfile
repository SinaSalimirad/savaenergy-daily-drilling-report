FROM oven/bun:1.4.4-slim AS dependencies

WORKDIR /repo

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/schema/package.json packages/schema

RUN bun install --frozen-lockfile

FROM dependencies AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY tsconfig.base.json ./
COPY packages packages
COPY apps/api apps/api
COPY apps/web apps/web

# Run the build script from the apps/web directory
RUN bun run --cwd apps/web build

FROM node:26.13.1-trixie-slim AS runner

WORKDIR /app

ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 NEXT_TELEMETRY_DISABLED=1

COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static

USER node
EXPOSE 3000

CMD ["node", "apps/web/server.js"]