# cuisine-discovery-app
料理ジャンル発見型レストラン検索アプリ

## セットアップ

### 1. リポジトリをクローン
```bash
git clone <repository-url>
cd cuisine-discovery-app
```

### 2. Google Places API Keyの設定

#### 2-1. APIキーを取得する
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成または選択
3. 「APIとサービス」→「ライブラリ」から **Places API (New)** を有効化
4. 「APIとサービス」→「認証情報」→「認証情報を作成」→「APIキー」でキーを発行

#### 2-2. APIキーの制限を設定する（推奨）
- **アプリケーションの制限**: HTTPリファラーを選択し、ローカル・本番のURLを登録
  - `http://localhost:*/*`
  - `https://your-domain.com/*`
- **APIの制限**: 「キーを制限」→ **Places API (New)** のみ許可

#### 2-3. config.jsを作成する
プロジェクトルートに `config.js` を作成し、取得したAPIキーを設定します:

```javascript
// API設定ファイル — このファイルはGitにコミットしないでください (.gitignore参照)
const CONFIG = {
  GOOGLE_MAPS_API_KEY: 'AIzaSy...',  // ← 発行したAPIキーをここに貼り付け
};
```

> **注意**: `config.js` は `.gitignore` で除外済みです。絶対にGitにコミットしないでください。

### 3. アプリを起動

ローカルサーバーを使って `index.html` を開きます（CORS制約のため `file://` では動作しません）:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (npx)
npx serve .
```

ブラウザで `http://localhost:8000` を開いてください。

---

## APIキーなしでの動作

`config.js` の `GOOGLE_MAPS_API_KEY` が `'YOUR_API_KEY_HERE'` のままか、`config.js` 自体が存在しない場合は、**ダミーデータ**で動作します。APIキーなしで開発・確認ができます。

---

## キャッシュ仕様

Places APIのレスポンスは `localStorage` にキャッシュされます:

| 項目 | 内容 |
|------|------|
| キャッシュキー | `places_<cuisineId>_<region>` |
| 有効期間 | 1時間（3,600,000ms） |
| クリア方法 | DevTools → Application → Local Storage → Clear |

```javascript
// キャッシュのデータ構造
{
  data: [ /* 店舗データの配列 */ ],
  timestamp: 1700000000000  // Date.now()
}
```

---

## ファイル構成

| ファイル | 説明 |
|----------|------|
| `index.html` | トップページ（料理ジャンル一覧） |
| `detail.html` | 詳細ページ（店舗一覧・地図） |
| `app.js` | トップページのロジック |
| `detail.js` | 詳細ページのロジック（Places API連携・キャッシュ） |
| `styles.css` | 全ページ共通スタイル |
| `config.js` | **APIキー設定（Gitignore済み・要作成）** |

---

## 将来のAPI連携について

- **メニュー情報**: Places API (New) にはメニューデータが含まれないため、現在はダミーメニューを表示しています。将来的にはレビューテキストからの頻出単語抽出や、手動キュレーションを検討しています。
- **地図**: 現在はGoogle Maps Legacy Embedを使用しています（APIキー不要）。Places APIキー設定後、店舗ピンの表示に切り替え可能です。
