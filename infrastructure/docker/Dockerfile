FROM node:20-alpine AS base

# Install pnpm 
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY tamanomi-admin/frontend/package.json tamanomi-admin/frontend/pnpm-lock.yaml ./
# Copy schemas package
COPY tamanomi-schemas ./tamanomi-schemas
RUN pnpm install

# Development
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tamanomi-admin/frontend/ .

EXPOSE 3000
ENV NODE_ENV=development
ENV PORT=3000
# キャッシュを無効化してホットリロードを確実にする
CMD ["pnpm", "run", "dev:no-cache"]