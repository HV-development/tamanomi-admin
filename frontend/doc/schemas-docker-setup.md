# Docker環境でのtamanomi-schemas設定

## 現在のDocker構成

### ディレクトリ構造
```
tamanomi/
├── docker-compose.yml          # メインのdocker-compose
├── tamanomi-api/
│   ├── Dockerfile.local        # API用Dockerfile
│   └── package.json
├── tamanomi-admin/
│   └── frontend/
│       └── package.json
├── tamanomi-web/
│   └── frontend/
│       └── package.json
└── tamanomi-schemas/           # 共有スキーマパッケージ
    ├── src/
    └── dist/
```

## Docker環境での課題

### 1. tamanomi-schemasへのアクセス
Docker環境では、各コンテナから`../../tamanomi-schemas`にアクセスできない可能性がある。

### 2. ビルドコンテキスト
Dockerfileのビルドコンテキスト外のディレクトリは参照できない。

## 解決策

### 方法1: マルチステージビルドでスキーマをコピー

#### Dockerfile.local（tamanomi-api）
```dockerfile
# ビルドステージ
FROM node:18-alpine AS builder

WORKDIR /app

# スキーマをコピー
COPY ../tamanomi-schemas /schemas
WORKDIR /schemas
RUN pnpm install && pnpm build

# アプリケーションステージ
FROM node:18-alpine

WORKDIR /app

# スキーマをコピー
COPY --from=builder /schemas /app/node_modules/@hv-development/schemas

# アプリケーションファイルをコピー
COPY . .

# 依存関係をインストール
RUN pnpm install
```

### 方法2: docker-composeでボリュームマウント

#### docker-compose.yml
```yaml
services:
  api:
    build:
      context: .
      dockerfile: tamanomi-api/Dockerfile.local
    volumes:
      - ./tamanomi-schemas:/app/node_modules/@hv-development/schemas:ro
      - ./tamanomi-api:/app
    ports:
      - "3002:3002"
```

### 方法3: ビルドコンテキストを親ディレクトリに設定

#### docker-compose.yml
```yaml
services:
  api:
    build:
      context: .                    # 親ディレクトリ（tamanomi/）
      dockerfile: tamanomi-api/Dockerfile.local
    volumes:
      - ./tamanomi-api:/app
```

#### Dockerfile.local
```dockerfile
FROM node:18-alpine

WORKDIR /app

# ビルドコンテキストが親ディレクトリなので相対パスが使える
COPY tamanomi-schemas /schemas
COPY tamanomi-api /app

WORKDIR /schemas
RUN pnpm install && pnpm build

WORKDIR /app
RUN pnpm install
```

## 推奨設定（方法3）

### docker-compose.yml
```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: tamanomi
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build:
      context: .                    # 親ディレクトリ
      dockerfile: tamanomi-api/Dockerfile.local
    ports:
      - "3002:3002"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/tamanomi
      JWT_SECRET: your-secret-key
    depends_on:
      - db
    volumes:
      - ./tamanomi-api:/app
      - ./tamanomi-schemas:/schemas

  admin:
    build:
      context: .                    # 親ディレクトリ
      dockerfile: tamanomi-admin/frontend/Dockerfile.local
    ports:
      - "3001:3000"
    environment:
      API_BASE_URL: http://api:3002/api/v1
    depends_on:
      - api
    volumes:
      - ./tamanomi-admin/frontend:/app
      - ./tamanomi-schemas:/schemas

  web:
    build:
      context: .                    # 親ディレクトリ
      dockerfile: tamanomi-web/frontend/Dockerfile.local
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./tamanomi-web/frontend:/app
      - ./tamanomi-schemas:/schemas

volumes:
  postgres_data:
```

### Dockerfile.local（共通パターン）
```dockerfile
FROM node:18-alpine

WORKDIR /app

# スキーマをビルド
COPY tamanomi-schemas /schemas
WORKDIR /schemas
RUN pnpm install && pnpm build

# アプリケーションをセットアップ
WORKDIR /app
COPY <project-path>/package.json .
COPY <project-path>/pnpm-lock.yaml .

# スキーマをシンボリックリンク
RUN ln -s /schemas /app/node_modules/@hv-development/schemas

RUN pnpm install

COPY <project-path> .

CMD ["pnpm", "dev"]
```

## ローカル開発環境（Docker不使用）

### package.json設定
```json
{
  "dependencies": {
    "@hv-development/schemas": "file:../../tamanomi-schemas"
  }
}
```

### セットアップ手順
```bash
# 1. スキーマをビルド
cd /Users/yuta/develop/tamanomi/tamanomi-schemas
pnpm install
pnpm build

# 2. 各プロジェクトで依存関係をインストール
cd /Users/yuta/develop/tamanomi/tamanomi-api
pnpm install

cd /Users/yuta/develop/tamanomi/tamanomi-admin/frontend
pnpm install

cd /Users/yuta/develop/tamanomi/tamanomi-web/frontend
pnpm install
```

## 環境変数の設定

### Docker環境
```yaml
# docker-compose.yml
services:
  admin:
    environment:
      # Docker内部通信用
      API_BASE_URL: http://api:3002/api/v1
```

### ローカル環境
```bash
# .env.local
# ローカルホスト経由
API_BASE_URL=http://localhost:3002/api/v1
```

## 次のステップ

1. Docker環境の設定を更新
2. Dockerfile.localを各プロジェクトで修正
3. docker-compose.ymlのビルドコンテキストを修正
4. スキーマのビルドとインストール
5. Docker環境でのテスト
