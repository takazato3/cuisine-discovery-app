# cuisine-discovery-app

料理ジャンル発見型レストラン検索アプリ。ビルドツールなしの静的サイト(HTML/CSS/バニラJS)+ Google Places API連携のNode.js更新スクリプト群、という構成。

## 実行方法

ビルド不要。ローカルサーバーで配信するだけ(CORS制約のため `file://` 直開きは不可)。

```bash
python3 -m http.server 8000
# または
npx serve .
```

`config.js`(gitignore対象、要手動作成)が無い/プレースホルダーのままの場合はダミーデータで動作する。実データを使うには `GOOGLE_MAPS_API_KEY` を設定した `config.js` が必要(詳細はREADME参照)。

npm依存パッケージは無し(Node組み込みモジュールのみ使用)。`npm install` は不要。

## ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` / `app.js` | トップページ。料理ジャンル一覧・エリア選択・Discoveryセクション |
| `detail.html` / `detail.js` | 詳細ページ。Places API連携で店舗一覧・地図を表示(結果は`localStorage`に1時間キャッシュ) |
| `discovery.js` | `discoveries.json` を読み込みDiscoveryティッカーを描画 |
| `styles.css` | 全ページ共通スタイル |
| `cuisine-data.json` | 料理ジャンル×エリアの店舗データ(週次自動更新) |
| `discoveries.json` | 「珍しい料理」データ(週次自動更新) |
| `config.js` | APIキー設定。**gitignore対象・要手動作成**(READMEの手順参照) |

### データ更新スクリプト(Node.js、要 `GOOGLE_MAPS_API_KEY`)

- `update-cuisine-data.js` — 全ジャンル×エリアの店舗詳細・件数を取得し `cuisine-data.json` と `app.js` を更新。**現行の主更新スクリプト**(`npm run update-cuisine-data`)。
- `update-discoveries.js` — 「珍しい料理」(1〜10件ヒットするジャンル)を検出し `discoveries.json` を更新(`npm run update-discoveries`)。
- `update-counts.js` — 旧版(件数のみ更新)。`update-cuisine-data.js` に置き換え済みの遺物で、`package.json` からは参照されていない。削除候補。
- `test-queries.js` / `test-filter-purity.js` — Places APIのクエリ挙動を調査するための一回限りの調査スクリプト。自動テストではない。実行結果は `query-test-results.txt` / `filter-purity-results.txt` にコミットされている。

## GitHub Actions

- `.github/workflows/update-counts.yml` — 毎週月曜9:00(JST)に `update-cuisine-data.js` → `update-discoveries.js` を実行し、変更があれば `main` に自動コミット・プッシュ。Secretsに `GOOGLE_MAPS_API_KEY` が必要。
- `.github/workflows/investigate-queries.yml` — 手動実行のみ。`test-filter-purity.js` を実行し結果を実行ブランチにコミット・プッシュする調査用ワークフロー。

## 開発時の注意

- Lintやテストフレームワークは導入されていない。変更後は実際にブラウザで動作確認すること。
- `AREAS`(エリア定義)は `app.js` と `detail.js` の両方に重複定義されている。変更する際は両ファイルを同期させること。
- `CUISINES` の各料理ジャンルの `counts`・`lastUpdated` は自動更新スクリプトが書き換える生成データなので、手動編集は基本的に避ける。
