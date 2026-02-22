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
| `index.html` | トップページ（料理ジャンル一覧 + Discovery） |
| `detail.html` | 詳細ページ（店舗一覧・地図） |
| `app.js` | トップページのロジック |
| `detail.js` | 詳細ページのロジック（Places API連携・キャッシュ） |
| `discovery.js` | Discovery セクションのロジック |
| `styles.css` | 全ページ共通スタイル |
| `config.js` | **APIキー設定（Gitignore済み・要作成）** |
| `update-counts.js` | 店舗数を更新する Node.js スクリプト（GitHub Actions 用） |
| `update-discoveries.js` | Discovery データを更新する Node.js スクリプト（GitHub Actions 用） |
| `discoveries.json` | Discovery データ（GitHub Actions が週次更新） |

---

## Discovery機能

週1回、首都圏で **1〜10店舗程度しかない珍しい料理** を自動検出し、トップページに表示します。

| 項目 | 内容 |
|------|------|
| **データソース** | Google Places API (New) |
| **更新頻度** | 毎週月曜 0時（UTC）= 日本時間 月曜 9時 |
| **表示** | 選択中のエリアに該当する珍しい料理のみ |
| **判定基準** | そのエリアで 1〜10 件の検索結果が出る料理 |

**対象料理（15ジャンル）**:
エチオピア、ジョージア、イラン、モロッコ、ウクライナ、
ポーランド、フィリピン、インドネシア、マレーシア、スリランカ、
アルゼンチン、ポルトガル、ドイツ、ロシア、ネパール

### API呼び出しコスト（月間試算）

| 処理 | 呼び出し回数 | 費用目安 |
|------|------------|---------|
| メインジャンル（18×4エリア×週1回）| 72回/週 = 288回/月 | 約$9.22/月 |
| Discovery（15×4エリア×週1回）| 60回/週 = 240回/月 | 約$7.68/月 |
| **合計** | **528回/月** | **約$16.90/月** |

無料枠 $200 の範囲内で十分収まります。

---

## 店舗数の自動更新

店舗数は GitHub Actions によって **毎週月曜 9:00（日本時間）** に自動更新されます。

### GitHub Secrets の設定手順

1. GitHubリポジトリの **Settings > Secrets and variables > Actions** を開く
2. **"New repository secret"** をクリック
3. **Name**: `GOOGLE_MAPS_API_KEY`
4. **Value**: （あなたのGoogle Places API Key）
5. **"Add secret"** をクリック

設定後、次の月曜から自動更新が始まります。手動で今すぐ実行する場合は
**Actions タブ > "Update Restaurant Counts" > "Run workflow"** から実行できます。

### ローカルでのテスト実行

```bash
GOOGLE_MAPS_API_KEY=your_api_key npm run update-counts
```

### 更新スクリプトの動作

**update-counts.js**
- 各ジャンル（18種）× 各エリア（4箇所）でPlaces API Text Searchを呼び出す（最大3ページ = 60件）
- 60件以上なら `'60+'`、未満は実数を記録
- API呼び出しに失敗した場合は既存の値を維持し、警告をログに出力
- `app.js` の `counts`・`lastUpdated`・`LAST_UPDATED` を書き換える

**update-discoveries.js**
- 珍しい料理（15種）× 各エリア（4箇所）でPlaces API Text Searchを実行
- 1〜10件のエリアのみ「Discovery」として記録
- 店舗名・住所・placeId を取得し `discoveries.json` に保存
- 変更がある場合のみ `chore: update counts and discoveries [YYYY-MM-DD] [skip ci]` でコミット・プッシュ

---

## 将来のAPI連携について

- **メニュー情報**: Places API (New) にはメニューデータが含まれないため、現在はダミーメニューを表示しています。将来的にはレビューテキストからの頻出単語抽出や、手動キュレーションを検討しています。
- **地図**: 現在はGoogle Maps Legacy Embedを使用しています（APIキー不要）。Places APIキー設定後、店舗ピンの表示に切り替え可能です。
