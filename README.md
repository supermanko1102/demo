# Ionex Admin Console

一個用 `Next.js + TypeScript` 做的後台 demo，重點是：

- 登入後進入受保護的 `/users`
- Access token 過期時自動 refresh 並重試請求
- 重新整理後維持登入狀態
- 使用者列表支援分頁、篩選、autocomplete
- 右下角有可選的 AI Assistant（需要額外啟動 agent backend）

## Demo 帳密

- `username`: `admin`
- `password`: `password123`

## 快速開始

安裝並啟動前端：

```bash
pnpm install
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## 可選：啟動 AI Assistant Backend

只有 `/users` 頁右下角的 AI Assistant 需要這個服務；前端主流程不需要。

```bash
cd /Users/alex/demo/agent-backend
pnpm install
cp .env.sample .env
pnpm dev
```

或直接在 root：

```bash
pnpm dev:agent
```

詳細設定看 [`agent-backend/README.md`](/Users/alex/demo/agent-backend/README.md)。

## 環境變數

`.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws
NEXT_PUBLIC_AGENT_BACKEND_URL=http://localhost:3400
```

## 路由

- `/login`: 登入頁
- `/users`: 後台主頁
- `/`: 依登入狀態自動導向

## 架構重點

- `app/`: App Router 頁面與 providers
- `components/users/`: users 頁面的 UI、filters、query hooks
- `lib/api/`: axios client、auth header、token refresh、API services
- `lib/auth/`: 前端登出與 session 結束流程
- `store/auth-store.ts`: auth 狀態與 localStorage persist
- `agent-backend/`: 獨立的 AI assistant backend

## Token 流程

1. 登入後把 access token / refresh token 存進 zustand persist store
2. API 請求自動帶 `Authorization`
3. 若回傳 `401 + TOKEN_EXPIRED`，前端會自動 refresh token
4. refresh 成功後重試原請求
5. refresh 失敗則清空 session 並導回 `/login`

## 常用指令

```bash
pnpm dev
pnpm dev:agent
pnpm lint
pnpm build
pnpm start
```
