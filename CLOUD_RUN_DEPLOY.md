# Cloud Run デプロイガイド (Cloud Shell 利用版)

このガイドでは、**Google Cloud Shell** を使用して、最も簡単かつ確実に `AI_Vet_STT` アプリケーションを Google Cloud Run にデプロイする手順を説明します。
お客様のPC環境にツールをインストールする必要はありません。

## 手順 1: Google Cloud Shell を開く

1. ブラウザで [Google Cloud Console](https://console.cloud.google.com/) にアクセスし、ログインします。
2. 画面右上のアイコン（ターミナル風のアイコン）をクリックして **Cloud Shell** を起動します。
   - または [こちらのリンク](https://shell.cloud.google.com/?show=ide%2Cterminal) から直接開くこともできます。
3. 画面下部にターミナルが表示されるのを待ちます。

## 手順 2: コードを取得する

Cloud Shell のターミナルで以下のコマンドを実行し、リポジトリをクローンします。
（右クリック「貼り付け」でペーストできます）

```bash
git clone https://github.com/LittleMouseBloodstock/AI_Vet_STT.git
cd AI_Vet_STT
```

> **Note**: もし非公開リポジトリの場合は、ユーザー名とパスワード（Personal Access Token）を聞かれます。
> 面倒な場合は、**このフォルダごと ZIP 圧縮して Cloud Shell にドラッグ＆ドロップ**でアップロードする方法もあります。
> ※ 公開リポジトリであれば上記コマンドだけでOKです。

## 手順 3: バックエンド (API) のデプロイ

まずバックエンドをデプロイします。`[PROJECT_ID]` はご自身のプロジェクトIDに置き換わるか、コマンド実行時に選択肢が出ます。

```bash
# 1. バックエンドディレクトリに移動
cd Backend

# 2. Cloud Run にデプロイ (サービス名: ai-vet-backend)
gcloud run deploy ai-vet-backend \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2
```

- 途中で「APIを有効にしますか？」と聞かれたら `y` を押して Enter。
- 完了すると **Service URL** が表示されます。
  - 例: `https://ai-vet-backend-xxxxx-an.a.run.app`
  - **この URL をコピーして控えてください。**

---

### 環境変数の設定 (Backend)

デプロイ後、環境変数を設定します（APIキーなど）。

```bash
# 例: 必要な変数を設定 (実際の値に書き換えて実行してください)
gcloud run services update ai-vet-backend \
  --region asia-northeast1 \
  --set-env-vars "GOOGLE_GEMINI_API_KEY=あなたのAPIキー,GEMINI_API_KEY=あなたのAPIキー,SUPABASE_URL=あなたのURL,SUPABASE_SERVICE_ROLE_KEY=あなたのキー"
```
※ `service_account.json` や `.env` ファイルの内容を反映させる方法はいくつかありますが、まずは最小構成で動かすならGUI画面（Cloud Consoleの「Cloud Run」→「ai-vet-backend」→「編集とデプロイ」→「変数」タブ）で設定するのが一番わかりやすいです。

---

## 手順 4: フロントエンドのデプロイ

次にフロントエンドをデプロイします。

```bash
# 1. ディレクトリ移動
cd ../Frontend

# 2. 環境変数の設定 (バックエンドのURLを指定)
# ★重要: 下記のURLは必ず「手順3」で取得したURLに書き換えてください
export NEXT_PUBLIC_API_URL="https://ai-vet-backend-xxxxx-an.a.run.app"

# 3. Cloud Run にデプロイ (サービス名: ai-vet-frontend)
# --set-env-vars でビルド時・実行時の変数を渡します
gcloud run deploy ai-vet-frontend \
  --source . \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --min-instances 0 \
  --max-instances 2 \
  --set-env-vars "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"
```

## 手順 5: 動作確認

完了すると表示される Service URL（例: `https://ai-vet-frontend-xxxxx-an.a.run.app`）にアクセスしてください。

### スピード（コールドスタート）について
Cloud Run は一定時間アクセスがないとインスタンスがゼロになり、次のアクセスの起動に数秒かかります（コールドスタート）。
**常に即応させたい（爆速にしたい）場合**は、以下のコマンドで「最小インスタンス数」を 1 に設定してください（※これを行うと、アクセスがなくても月額料金がかかり始めます）。

```bash
# バックエンドを常時起動にする
gcloud run services update ai-vet-backend --region asia-northeast1 --min-instances 1

# フロントエンドを常時起動にする
gcloud run services update ai-vet-frontend --region asia-northeast1 --min-instances 1
```
