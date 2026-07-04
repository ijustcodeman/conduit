FROM node:20-bookworm-slim AS backend-build

WORKDIR /app

RUN corepack enable
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM node:20-bookworm-slim AS backend

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:./dev.db

RUN corepack enable
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY --from=backend-build /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml ./
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY dev.db ./dev.db

EXPOSE 3000

CMD ["pnpm", "start:prod"]
