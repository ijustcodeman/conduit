FROM node:20-bookworm-slim AS base

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS backend-build

RUN corepack enable
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY nest-cli.json tsconfig*.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src
RUN pnpm prisma generate
RUN pnpm build
RUN pnpm prune --prod

FROM base AS backend

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=file:./dev.db

COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/dist ./dist
COPY dev.db ./dev.db

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
