# VRChat Package Manager (VPM) Repository

このプロジェクトは、Node.js (Nuxt) をバックエンドに採用した動的なVPMリポジトリです。
DockerとCloudflare Tunnelを使用し、固定グローバルIPやポート開放がない自宅サーバー（Ubuntuなど）からでも安全に公開できる設計になっています。

## 主な機能

* **美しいフロントエンド画面**: ダークモード＆グラスモーフィズムを取り入れたリッチなUIでパッケージ一覧を表示します。
* **完全自動のインデックス生成**: `data/packages/` ディレクトリにファイルを追加するだけで、VCCが必要とする `index.json` を動的に自動生成します。
* **自動ダウンロードカウント**: パッケージがダウンロードされるたびに、該当バージョンの `stats.json` が自動更新され、WebUI上でダウンロード数を確認できます。
* **自宅サーバー向け自動デプロイ**: GitHubにPushするだけで、Ubuntuサーバー側が自動で検知して最新の状態を取り込む仕組みを同梱しています。

---

## 1. ディレクトリ構成とパッケージの追加方法

プロジェクトの `data/` フォルダ以下でパッケージを管理します。

```text
data/
├── repo_info.json                <-- リポジトリの基本設定
└── packages/
    └── com.example.sample/       <-- ① パッケージ名 (フォルダ名)
        ├── info.json             <-- ② パッケージの詳細設定 (description等)
        └── Versions/
            └── 1.0.0/            <-- バージョン番号フォルダ
                ├── package.zip   <-- ③ 配布用ファイル本体 (zip内に package.json が必要)
                └── stats.json    <-- ダウンロード回数が記録されるJSON (自動生成)
```

### パッケージ名の決め方 (重要)
パッケージ名は、VRChatの標準ルールである**「リバースドメイン名記法」**で設定します（例: `com.あなたの名前.アセット名`）。

以下の **3箇所** で、設定するパッケージ名が全て一致している必要があります。
1. **フォルダ名**: `data/packages/` 以下のフォルダ名をパッケージ名にします。
2. **`info.json`**: 上記フォルダ内の `info.json` の `"name"` に同じパッケージ名を指定します。
3. **`package.zip` の中身**: 配布するzipファイルの一番上の階層にある `package.json` の `"name"` にも同じパッケージ名を指定します（※vrc-get等でエクスポートすれば自動で設定されます）。

---

## 2. サーバーの起動方法 (Cloudflare Tunnel)

### 1. リポジトリ設定の更新
`data/repo_info.json` を編集し、リポジトリ名や公開するURLなどを自身の環境に合わせて設定します。

### 2. Cloudflare Tunnel の準備
1. [Cloudflare Zero Trust ダッシュボード](https://one.dash.cloudflare.com/) からTunnelを作成します。
2. Tunnelのトークンを取得し、`.env.example` をコピーして `.env` ファイルを作成し、そこにトークンを貼り付けます。
3. TunnelのRouting(Public Hostname)設定で、ServiceのURLを `web:3000` に指定してください。

### 3. コンテナの起動
以下のコマンドでサーバーをビルド＆起動します。

```sh
docker compose up -d --build
```

起動後、設定したドメインにアクセスすると、リッチなパッケージ一覧画面が表示されます。

---

## 3. Ubuntuサーバーでの自動デプロイ (CI/CD) の設定

自宅サーバー（Ubuntu）など、外部から直接アクセスできない環境において、GitHubの `main` ブランチに更新（Push）があった際に、自動でサーバー側に変更を反映させるシステムを同梱しています。

### 設定手順

**1. 実行権限の付与**
Ubuntu上でスクリプトに実行権限を与えます。
```bash
chmod +x autodeploy.sh
```

**2. サービスファイルの書き換え**
`vpm-autodeploy.service` をテキストエディタで開き、以下の箇所を自身の環境に合わせて書き換えます。
- `User=ubuntu` (実行するユーザー名)
- `WorkingDirectory=` (このプロジェクトの絶対パス)
- `ExecStart=` (autodeploy.sh の絶対パス)

**3. サービスの登録と起動**
作成したサービスをsystemdに登録し、常時稼働させます。
```bash
# サービスファイルのコピー
sudo cp vpm-autodeploy.service /etc/systemd/system/

# systemdの再読み込み
sudo systemctl daemon-reload

# サービスの自動起動を有効化＆起動
sudo systemctl enable --now vpm-autodeploy.service
```

**4. ログの確認**
以下のコマンドで、スクリプトが正しく稼働している（1分ごとに監視している）か確認できます。
```bash
sudo journalctl -u vpm-autodeploy.service -f
```

以降は、お手元のPCで新しいパッケージを追加して **GitHubへPushするだけ** で、サーバー側が自動で検知して反映するようになります。
※ ダウンロード数を記録する `stats.json` はGitの監視対象から外しているため（`.gitignore` で設定済み）、自動更新時にコンフリクト（競合エラー）を起こす心配はありません。
