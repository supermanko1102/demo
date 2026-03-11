# Agent Backend (Genkit + Function Calling)

這個資料夾是一個獨立的 Agent 後端入口，使用：

- `genkit`
- `@genkit-ai/google-genai`
- `zod`（透過 Genkit 的 `z` schema）

支援能力：

- 查詢後台使用者總數 / active / inactive（讀取真實 `/api/users`）
- 搜尋特定使用者
- prompt injection 防護（常見越權/洩密/注入語句會拒絕）
- 回傳圖表資料（`pie` / `line`）給前端 ECharts 渲染

## API

- `GET /health`
- `POST /chat`

### `POST /chat` body

```json
{
  "message": "現在台北時間幾點？",
  "timezone": "Asia/Taipei"
}
```

## 啟動

先安裝這個資料夾自己的依賴：

```bash
cd /Users/alex/demo/agent-backend
pnpm install
cp .env.example .env
```

編輯 `.env`，至少填入 `GEMINI_API_KEY`，再啟動：

```bash
pnpm dev
```

可選參數：

- `UPSTREAM_API_BASE_URL`：後台 API base URL（預設已填 interview server）
- `AGENT_BACKEND_PORT`：agent backend 監聽埠（預設 `3400`）

如果你習慣用 shell 變數，也可以直接：

```bash
export GEMINI_API_KEY=你的_key
pnpm dev
```

## 測試

```bash
curl -sS http://localhost:3400/health
```

```bash
curl -sS -X POST http://localhost:3400/chat \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{"message":"後台總共幾個人？active 幾個？"}'
```

`Authorization` 可省略，但查詢後台使用者資料時會需要登入 token。

圖表範例：

```bash
curl -sS -X POST http://localhost:3400/chat \
  -H 'Authorization: Bearer <access_token>' \
  -H 'Content-Type: application/json' \
  -d '{"message":"請用 pie chart 畫後台 active/inactive 比例"}'
```
