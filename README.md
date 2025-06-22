# 株価分析アプリ

リアルタイム株価データの可視化と技術分析を提供する日本語対応のWebアプリケーションです。

## 機能

- 銘柄シンボル検索
- リアルタイム株価表示（変動率表示付き）
- Chart.jsを使用したインタラクティブな価格チャート
- 基本統計情報の表示（高値、安値、出来高）
- テクニカル指標（20日移動平均、50日移動平均、RSI）
- 複数のデータソース対応：
  - **Yahoo Finance API**（無料・リアルタイムデータ）
  - Alpha Vantage API（APIキー必要）
  - デモデータ（テスト用）
- 5分間キャッシュ機能（API制限対策）
- データソース選択機能

## ファイル構成

- `index.html` - メインアプリケーションHTMLファイル（日本語インターフェース）
- `styles.css` - CSSスタイル（実装済み）
- `script.js` - JavaScriptアプリケーションロジック（実装済み）

## 使用技術

### フロントエンド
- HTML5（セマンティックマークアップ、ARIA対応）
- TailwindCSS（ガラスモーフィズムデザイン）
- JavaScript ES6+（モジュラークラス設計）
- Chart.js（データ可視化）

### スタイリング & UI
- TailwindCSS CDN（ユーティリティファースト）
- ガラスモーフィズムデザイン
- レスポンシブレイアウト
- アクセシビリティ対応（WCAG準拠）

### データ & API
- Yahoo Finance API（allorigins.winプロキシ経由）
- 5分間キャッシュシステム
- 複数データソース対応

### 開発・デプロイメント
- ESLint（コード品質管理）
- Prettier（コードフォーマット）
- GitHub Actions（CI/CD）
- GitHub Pages（自動デプロイ）

## セットアップ

### 簡単セットアップ（開発なし）
1. リポジトリをクローンまたはダウンロード
2. ブラウザで`index.html`を開く
3. **即座に利用可能！** - Yahoo Finance APIで無料でリアルタイムデータを取得

### 開発環境セットアップ
1. Node.js（16以上）をインストール
2. リポジトリをクローン
   ```bash
   git clone https://github.com/kawamuragen/claude-code-trial.git
   cd claude-code-trial
   ```
3. 依存関係をインストール
   ```bash
   npm install
   ```
4. 開発サーバーを起動
   ```bash
   npm run dev
   ```

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# コードリント
npm run lint

# コードフォーマット
npm run format

# 本番ビルド
npm run build

# テスト実行
npm test

# GitHub Pagesにデプロイ
npm run deploy
```

## 使用方法

1. 株式コード（例：AAPL, GOOGL, TSLA）を入力
2. データソースを選択：
   - **Yahoo Finance（無料）**: リアルタイムデータを取得
   - **デモデータ**: テスト用のサンプルデータ
3. 「株価を取得」ボタンをクリック
4. 株価情報、チャート、テクニカル指標を確認

## 機能詳細

### キャッシュ機能
- 5分間のデータキャッシュでAPI制限を回避
- 同じ銘柄を再検索する際は高速表示

### テクニカル分析
- 20日・50日移動平均線
- RSI（相対力指数）
- 基本統計（高値・安値・出来高）

## 開発状況

- ✅ HTMLファイル完成
- ✅ CSSスタイル実装済み
- ✅ JavaScript機能実装済み
- ✅ Yahoo Finance API統合
- ✅ CORS対応（プロキシ使用）
- ✅ キャッシュ機能
- ✅ エラーハンドリング