#!/bin/bash

# ローカル開発環境セットアップスクリプト
# エディタでの型チェックを有効にするため、ローカルのnode_modulesにtamanomi-schemasをリンク

set -e

echo "🔧 Setting up local development environment for tamanomi-admin..."

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

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Schemas directory: $SCHEMAS_DIR"

# 1. tamanomi-schemasをビルド
echo ""
echo "📦 Building tamanomi-schemas..."
cd "$SCHEMAS_DIR"
pnpm install --prefer-offline
pnpm run build
echo "✅ tamanomi-schemas built successfully"

# 2. tamanomi-adminのnode_modulesにコピー
echo ""
echo "📋 Copying schemas to node_modules..."
cd "$FRONTEND_DIR"

# node_modulesディレクトリが存在しない場合は作成
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  pnpm install --prefer-offline
fi

# @hv-development/schemas ディレクトリを作成
mkdir -p node_modules/@hv-development/schemas

# スキーマをコピー
cp -r "$SCHEMAS_DIR/dist"/* node_modules/@hv-development/schemas/
cp "$SCHEMAS_DIR/package.json" node_modules/@hv-development/schemas/

echo "✅ Schemas copied to node_modules/@hv-development/schemas"

# 3. 型定義の確認
echo ""
echo "🔍 Verifying type definitions..."
if [ -f "node_modules/@hv-development/schemas/index.d.ts" ]; then
  echo "✅ Type definitions found"
  echo "   📄 $(wc -l < node_modules/@hv-development/schemas/index.d.ts) lines in index.d.ts"
else
  echo "❌ Type definitions not found"
  exit 1
fi

# 4. パスワードスキーマの確認
if [ -f "node_modules/@hv-development/schemas/auth/password-schemas.d.ts" ]; then
  echo "✅ Password schemas found"
else
  echo "⚠️  Password schemas not found (might be okay for older versions)"
fi

echo ""
echo "🎉 Local development environment setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your editor (VSCode/Cursor) to pick up new type definitions"
echo "   2. Run 'pnpm dev' to start the development server"
echo ""
echo "💡 Tips:"
echo "   - Run this script again when tamanomi-schemas is updated"
echo "   - Or use 'pnpm schema:sync' for quick sync"
echo ""
