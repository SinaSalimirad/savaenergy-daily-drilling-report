FROM oven/bun:1.4.4-slim AS dependencies

WORKDIR /repo

COPY package.json bun.lock ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/schema/package.json packages/schema

RUN bun install --frozen-lockfile

FROM dependencies AS build
COPY tsconfig.base.json ./
COPY packages packages
COPY apps/api apps/api
COPY apps/web apps/web

# Run the build script from the apps/api directory
RUN bun run --cwd apps/api build

FROM oven/bun:1.4.4-slim AS runner

WORKDIR /app

ENV NODE_ENV=production PORT=4000

COPY --from=build --chown=bun:bun /repo/apps/api/dist ./dist

USER bun

EXPOSE 4000

CMD [ "bun", "./dist/index.js" ]