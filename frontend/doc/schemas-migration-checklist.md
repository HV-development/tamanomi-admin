# tamanomi-schemas移行チェックリスト

## 事前準備

### ✅ 1. 現在の状況確認
- [ ] tamanomi-schemasパッケージの構成を確認
- [ ] 現在のtamanomi-admin/frontendでの使用状況を確認
- [ ] コメントアウトされているインポートを特定
- [ ] 一時的な型定義を特定

### ✅ 2. ドキュメント作成
- [x] schemas-setup-plan.md - 設定計画
- [x] schemas-analysis.md - 詳細分析
- [x] schemas-implementation-steps.md - 実装手順
- [x] schemas-migration-checklist.md - 移行チェックリスト

## Phase 1: ローカル環境の設定

### 1.1 pnpm workspace設定
- [ ] pnpm-workspace.yamlを更新
- [ ] tamanomi-schemasをworkspaceに追加

### 1.2 package.json設定
- [ ] @hv-development/schemas依存関係を追加
- [ ] workspace:*を使用してローカル参照を設定

### 1.3 TypeScript設定
- [ ] tsconfig.jsonのpaths設定を更新
- [ ] @hv-development/schemasのパス解決を設定

## Phase 2: スキーマのビルドとインストール

### 2.1 tamanomi-schemasビルド
- [ ] tamanomi-schemasディレクトリに移動
- [ ] pnpm buildを実行
- [ ] ビルドが成功することを確認

### 2.2 依存関係インストール
- [ ] tamanomi-admin/frontendディレクトリに移動
- [ ] pnpm installを実行
- [ ] 依存関係が正しくインストールされることを確認

## Phase 3: 既存コードの移行

### 3.1 認証関連ファイル
- [ ] src/components/contexts/auth-context.tsx
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

- [ ] src/lib/api.ts
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

- [ ] src/components/pages/Login.tsx
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

### 3.2 加盟店関連ファイル
- [ ] src/components/pages/MerchantRegistration.tsx
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

- [ ] src/components/pages/MerchantEdit.tsx
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

### 3.3 店舗関連ファイル
- [ ] src/components/pages/ShopManagement.tsx
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

- [ ] src/components/pages/ShopDetail.tsx
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

- [ ] src/components/pages/ShopConfirm.tsx
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

- [ ] src/components/pages/ShopForm.tsx
  - [ ] 一時的な型定義を削除
  - [ ] @hv-development/schemasからのインポートを有効化
  - [ ] 型の整合性を確認

## Phase 4: 開発スクリプトの追加

### 4.1 package.jsonスクリプト
- [ ] schema:buildスクリプトを追加
- [ ] schema:watchスクリプトを追加
- [ ] schema:updateスクリプトを追加
- [ ] schema:linkスクリプトを追加
- [ ] schema:unlinkスクリプトを追加

## Phase 5: テストと検証

### 5.1 ビルドテスト
- [ ] pnpm run buildを実行
- [ ] ビルドが成功することを確認
- [ ] エラーが発生した場合は修正

### 5.2 型チェック
- [ ] pnpm run type-checkを実行
- [ ] 型エラーがないことを確認
- [ ] エラーが発生した場合は修正

### 5.3 開発サーバーテスト
- [ ] pnpm run devを実行
- [ ] 開発サーバーが正常に起動することを確認
- [ ] エラーが発生した場合は修正

## Phase 6: 開発ワークフローの確立

### 6.1 スキーマ監視モード
- [ ] schema:watchスクリプトをテスト
- [ ] スキーマ変更が即座に反映されることを確認

### 6.2 開発効率の確認
- [ ] 型安全性が向上していることを確認
- [ ] 開発効率が向上していることを確認
- [ ] 保守性が向上していることを確認

## 完了後の確認事項

### ✅ 機能確認
- [ ] 認証機能が正常に動作する
- [ ] 加盟店管理機能が正常に動作する
- [ ] 店舗管理機能が正常に動作する
- [ ] すべてのページが正常に表示される

### ✅ 型安全性確認
- [ ] コンパイル時エラーが検出される
- [ ] 型定義が正しく反映されている
- [ ] インポートエラーが発生しない

### ✅ 開発効率確認
- [ ] スキーマ変更が即座に反映される
- [ ] 型定義の一元管理ができている
- [ ] 開発ワークフローが確立されている

## トラブルシューティング

### よくある問題と対処法
- [ ] 型エラーが発生する場合の対処法を確認
- [ ] ビルドが失敗する場合の対処法を確認
- [ ] 開発サーバーが起動しない場合の対処法を確認

## 完了報告

### 移行完了チェック
- [ ] すべてのチェック項目が完了
- [ ] ビルドが成功
- [ ] 型チェックが成功
- [ ] 開発サーバーが正常に起動
- [ ] 機能が正常に動作

### ドキュメント更新
- [ ] README.mdを更新
- [ ] 開発者向けドキュメントを更新
- [ ] 移行完了報告を作成
