#!/bin/bash

# スキーマ同期スクリプト
# tamanomi-schemasの変更をローカルのnode_modulesに同期

set -e

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# フロントエンドディレクトリを探す
if [ -d "$PROJECT_ROOT/frontend" ]; then
  FRONTEND_DIR="$PROJECT_ROOT/frontend"
else
  FRONTEND_DIR="$PROJECT_ROOT"
fi
SCHEMAS_DIR="$(cd "$PROJECT_ROOT/../tamanomi-schemas" && pwd)"

echo "📋 Syncing schemas to local node_modules..."

# tamanomi-schemasをビルド
cd "$SCHEMAS_DIR"
pnpm run build

# node_modulesにコピー
cd "$FRONTEND_DIR"
rm -rf node_modules/@hv-development/schemas
mkdir -p node_modules/@hv-development
cp -r "$SCHEMAS_DIR" node_modules/@hv-development/schemas
rm -rf node_modules/@hv-development/schemas/node_modules
rm -rf node_modules/@hv-development/schemas/.git

echo "✅ Schemas synced successfully"
