# GitHub Pages 公開手順書

## 前提条件

- macOS環境
- Homebrew がインストール済み
- GitHubアカウントを持っていること

## 1. GitHub CLI のインストール

```bash
brew install gh
```

## 2. GitHub にログイン

```bash
gh auth login --web --git-protocol https
```

- ブラウザが開き、認証画面が表示される
- ターミナルに表示されるワンタイムコードをブラウザに入力
- 「Authorize GitHub CLI」をクリック

## 3. Git リポジトリの初期化

```bash
cd particle-portfolio
git init
git add -A
git commit -m "Initial commit"
```

## 4. GitHub リポジトリの作成とプッシュ

```bash
gh repo create particle-portfolio --public --source=. --push
```

このコマンドで以下が自動的に行われる:
- GitHub上にパブリックリポジトリが作成される
- リモートが設定される
- コードがプッシュされる

## 5. GitHub Pages の有効化

```bash
gh api repos/<ユーザー名>/particle-portfolio/pages \
  -X POST \
  -f "build_type=workflow" \
  -f "source[branch]=main" \
  -f "source[path]=/"
```

## 6. デプロイ用ワークフローの作成

`.github/workflows/pages.yml` を作成:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: .
      - id: deployment
        uses: actions/deploy-pages@v4
```

作成後にコミット＆プッシュ:

```bash
git add .github/workflows/pages.yml
git commit -m "Add GitHub Pages deploy workflow"
git push
```

## 7. 公開確認

プッシュ後、数分で以下のURLにデプロイされる:

```
https://<ユーザー名>.github.io/particle-portfolio/
```

デプロイ状況はリポジトリの Actions タブで確認可能:

```
https://github.com/<ユーザー名>/particle-portfolio/actions
```

## サイトの更新方法

コードを変更したら以下を実行するだけで自動更新される:

```bash
git add <変更ファイル>
git commit -m "変更内容"
git push
```

## 独自ドメインの設定（任意）

1. ドメインを購入（お名前.com、Google Domains 等）
2. DNS設定で以下のCNAMEレコードを追加:
   ```
   CNAME  <ユーザー名>.github.io
   ```
3. GitHub側でカスタムドメインを設定:
   ```bash
   gh api repos/<ユーザー名>/particle-portfolio/pages -X PUT \
     -f "cname=www.yourdomain.com"
   ```
   または、リポジトリの Settings > Pages > Custom domain から入力
