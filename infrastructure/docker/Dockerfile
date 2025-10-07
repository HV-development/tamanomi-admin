ARG NODE_VERSION=20.17.0
FROM node:${NODE_VERSION}-alpine AS base

# Print Node and npm versions for verification
RUN node -v && npm -v

# Install pnpm 
RUN npm install -g pnpm
RUN pnpm -v

# Dependencies
FROM base AS deps
WORKDIR /app
RUN node -v && npm -v
COPY tamanomi-admin/frontend/package.json tamanomi-admin/frontend/pnpm-lock.yaml ./
COPY tamanomi-admin/frontend/.npmrc ./
# Install dependencies from GitHub Packages
RUN pnpm install

# Development
FROM base AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY tamanomi-admin/frontend/ .

EXPOSE 3000
ENV NODE_ENV=development
ENV PORT=3000
CMD ["pnpm", "run", "dev"]