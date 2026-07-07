#!/bin/bash
# === 自宅サーバー(Ubuntu)用 自動デプロイ・スクリプト ===
# 60秒ごとにGitHubを確認し、変更があれば自動でpullとDockerの更新を行います。

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "=========================================="
echo "VPM Repository - Auto Deployment Monitor"
echo "Monitoring path: $REPO_DIR"
echo "=========================================="

cd "$REPO_DIR" || exit 1

while true; do
    # リモートの最新状態を取得
    git fetch origin main > /dev/null 2>&1
    
    # ローカルとリモートの差分をチェック
    UPDATES=$(git rev-list HEAD...origin/main --count)
    
    if [ "$UPDATES" -gt 0 ]; then
        echo -e "\n[$(date +'%Y-%m-%d %H:%M:%S')] 変更を検知しました。アップデートを開始します..."
        
        # 変更を取り込む
        git pull origin main
        
        # サーバー(Docker)に変更を反映させる
        echo "Dockerコンテナを再構築・再起動しています..."
        # sudo権限が必要な環境の場合は適宜 "sudo docker compose" に変更してください
        docker compose up -d --build
        
        echo "[$(date +'%Y-%m-%d %H:%M:%S')] アップデートが正常に完了しました！"
    fi
    
    # 60秒待機
    sleep 60
done
