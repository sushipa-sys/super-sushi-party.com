# super-sushi-party.com

SUPER SUSHI PARTY 公式サイトのソース一式です。

## 自動デプロイ

`main` ブランチに push すると、GitHub Actions (`.github/workflows/ftp-deploy.yml`) が
FTP サーバーへ自動でファイルを同期します。

### 初回セットアップ（必須）

GitHub リポジトリの `Settings > Secrets and variables > Actions` で以下の Secrets を登録してください。

| Secret名 | 内容 |
| --- | --- |
| `FTP_SERVER` | FTPサーバーのホスト名 |
| `FTP_USERNAME` | FTPユーザー名 |
| `FTP_PASSWORD` | FTPパスワード |
| `FTP_SERVER_DIR` | アップロード先ディレクトリ（例: `/` や `/public_html/`） |

サーバーが平文FTPのみ対応の場合は、`.github/workflows/ftp-deploy.yml` 内の
`protocol: ftps` を `protocol: ftp` に変更してください（非推奨・可能な限りFTPS推奨）。
