# GAME ARCADE - ゲームアーカイブポータル

自身が作成したオリジナルのブラウザゲーム作品をアミューズメント施設（ゲーセン）のようなUIで一覧表示し、すぐに遊べるようにまとめたゲーム専用のポータルサイトです。

## ディレクトリ構成

```text
portfolio/
├── index.html          # 一覧ページ（React + Tailwind CSS・アーケード風デザイン）
├── projects.json       # ゲームデータ（一覧ページが読み込むJSON）
├── images/             # サムネイル画像フォルダ
│   └── *.jpg / *.png
└── projects/           # 各ゲームの個別ランディングページ
    ├── fishing.html
    ├── ggdemon.html
    ├── puzzle-rogue.html
    └── swing-jump.html
```

## GitHub Pagesへの公開手順

1. GitHubリポジトリを作成（例: `[ユーザー名].github.io`）
2. `portfolio/` フォルダの中身をリポジトリのルートに配置
3. リポジトリの Settings > Pages > Source を `main` ブランチに設定
4. `https://[ユーザー名].github.io/` でアクセス可能になります

## 新しいゲームの追加方法

### 1. `projects.json` にデータを追記する

一覧からゲームを探せるようにJSONオブジェクトを追記します。

```json
{
  "id": "my-new-game",
  "title": "新しいゲームのタイトル",
  "category": "game",
  "description_short": "一覧カードに表示するゲームの魅力的な紹介文。",
  "thumbnail": "./images/my-new-game-thumb.jpg",
  "detail_url": "./projects/my-new-game.html",
  "tags": ["ゲーム", "アクション", "JavaScript"],
  "created_at": "2026-05-01"
}
```

### 2. サムネイル画像を `images/` フォルダに配置する

推奨サイズ: **横 600px × 縦 400px**（3:2 比率）

### 3. 詳細ページを `projects/` に作成する

既存のゲームページ（例：`projects/swing-jump.html`）を**コピーして**、以下をゲームのテーマに合わせて変更してください：
- `<title>` タグと OGP metaタグ
- Tailwind テーマカラー（`tailwind.config` 内の `game: { primary: '...', secondary: '...' }` をゲームの雰囲気に合わせて変更）
- バナー背景のグラデーションカラー（`<style>` 内の `.hero-bg` や `.game-button` など）
- タイトルや「熱狂のポイント」「遊び方」などのキャッチコピー
- プレイボタンの `href`（実際のゲームのURL）

## デザイン仕様

ゲームを今すぐ遊びたくなるような、ダークでリッチなデザインパターンを採用しています。

| 項目 | 内容 |
|------|------|
| テーマ | ダークモード標準（ネオン/サイバー・アーケード風スタイル） |
| メインカラー | `#020617`（深く暗いスレート系背景） |
| アクセント | `#8b5cf6`, `#c084fc` などを活用した発光エフェクト |
| フォント | Noto Sans JP + Inter |
| レスポンシブ | スマホ〜PC対応（Tailwind CSS） |
| 動的処理 | Reactによるコンポーネント管理（タグ絞り込み/ソート） |

## 広告枠（Google AdSense）等について

`index.html` や `projects/*.html` に設けられている想定の余白スペースに、適宜AdSenseのコードなどを挿入して利用することが可能です。

## ローカルでの動作確認

`index.html` では `fetch` APIでJSONを読み込むため、ファイルをブラウザで直接開くとCORSエラーになる場合があります。以下の方法等でローカルサーバーを起動してください：

```bash
# Python 3 の場合
cd portfolio
python3 -m http.server 8000
# → http://localhost:8000 でアクセス
```

または VSCode の **Live Server** 拡張機能を利用してください。
