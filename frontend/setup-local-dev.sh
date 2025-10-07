#!/bin/bash

# ローカル開発環境用のセットアップスクリプト
# Dockerコンテナのnode_modulesをローカルから参照できるようにする

echo "🔧 ローカル開発環境のセットアップを開始..."

# Dockerコンテナが起動しているか確認
if ! docker ps | grep -q "tamanomi-admin"; then
    echo "❌ Dockerコンテナが起動していません"
    echo "以下のコマンドでコンテナを起動してください:"
    echo "cd tamanomi-admin/infrastructure/docker && docker-compose up -d admin"
    exit 1
fi

# Dockerコンテナ名を取得
CONTAINER_NAME=$(docker ps --filter "name=tamanomi-admin" --format "{{.Names}}" | head -1)

if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ tamanomi-adminコンテナが見つかりません"
    exit 1
fi

echo "📦 コンテナ名: $CONTAINER_NAME"

# 既存のnode_modulesをバックアップ（存在する場合）
if [ -d "node_modules" ]; then
    echo "📦 既存のnode_modulesをバックアップ..."
    mv node_modules node_modules.backup.$(date +%Y%m%d_%H%M%S)
fi

# Docker volumeからnode_modulesをコピー
echo "📦 Docker volumeからnode_modulesをコピー中..."
docker cp "$CONTAINER_NAME:/app/node_modules" ./node_modules

if [ $? -eq 0 ]; then
    echo "✅ node_modulesのコピーが完了しました"
    echo "🎉 ローカル環境でTypeScriptの型チェックが可能になりました"
else
    echo "❌ node_modulesのコピーに失敗しました"
    exit 1
fi

echo ""
echo "📋 使用方法:"
echo "1. ローカルでTypeScriptの型チェック: pnpm type-check"
echo "2. ローカルでリンター実行: pnpm lint"
echo "3. Dockerコンテナを再起動した場合は、このスクリプトを再実行してください"
