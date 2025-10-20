# Next.jsアプリケーション用Dockerfile
FROM node:22-alpine AS base

# Install pnpm and Watchman（ファイル監視の最適化）
RUN apk add --no-cache watchman
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
# ビルド引数としてGitHub tokenを受け取る
ARG GITHUB_TOKEN
WORKDIR /app
RUN node -v && npm -v
COPY tamanomi-admin/frontend/package.json tamanomi-admin/frontend/pnpm-lock.yaml ./
COPY tamanomi-admin/frontend/.npmrc ./

# ビルド時にGitHub tokenを設定（トークンが提供された場合のみ）
RUN if [ -z "$GITHUB_TOKEN" ]; then \
      echo "エラー: GITHUB_TOKENが設定されていません。ビルドを中止します。" >&2; \
      exit 1; \
    else \
      echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc; \
    fi
# Install dependencies from GitHub Packages
RUN pnpm install
# トークンを含む.npmrcを削除（セキュリティのため）
RUN rm -f .npmrc

# Development
FROM base AS dev
WORKDIR /app
COPY tamanomi-admin/frontend/ .
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["pnpm", "run", "dev"]