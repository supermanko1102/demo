# Ionex Admin Console (Frontend Interview)

一個使用 `Next.js + React + TypeScript` 的後台管理系統範例，完成以下核心需求：

- 使用者登入（保存 Access / Refresh Token）
- 受保護的使用者列表頁
- 分頁與篩選
- Access Token 過期後自動 refresh 並重試原請求
- 重新整理後維持登入狀態
- RWD（桌機 sidebar + 行動裝置抽屜）

## Demo 帳密

- `username`: `admin`
- `password`: `password123`

## 技術棧

- Framework: `Next.js (App Router)` + `React 19`
- Language: `TypeScript`
- UI: `shadcn/ui` + Tailwind CSS
- State: `zustand`（含 persist）
- Server State: `@tanstack/react-query`
- Form: `react-hook-form` + `zod`
- HTTP: `axios`（含攔截器）

## 快速開始

本專案目前使用 `pnpm-lock.yaml`，建議使用 pnpm。

```bash
pnpm install
pnpm dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

其他常用指令：

```bash
pnpm lint
pnpm build
pnpm start
```

## 環境變數

可選，未設定時會使用預設 API URL。

`.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws
```

## 路由

- `/login`: 登入頁
- `/users`: 後台主頁（需登入）
- `/`: 依登入狀態自動導向 `/login` 或 `/users`

## 專案結構（重點）

```txt
app/
  login/page.tsx
  users/page.tsx
  providers.tsx
components/
  users/
    hooks/
    model.ts
    users-page-client.tsx
  auth/login-form.tsx
  ui/* (shadcn components)
hooks/
  use-auth-session.ts
  use-auth-redirect.ts
lib/
  api/
    client.ts
    http.ts
    token-manager.ts
    services.ts
store/
  auth-store.ts
types/
  api.ts
```

## API 封裝設計

- `lib/api/client.ts`
  - 建立 `rawHttp`（不帶 auth）
- `lib/api/http.ts`
  - 建立 `http`（帶 auth）
  - request interceptor：自動加 `Authorization`
  - response interceptor：攔截 `401 + TOKEN_EXPIRED`
- `lib/api/token-manager.ts`
  - 管理 refresh promise（避免多請求同時 refresh）
  - refresh 成功後更新 store 的 access token
- `lib/api/services.ts`
  - 對外暴露 `loginApi`, `getUsersApi` 等 service function
  - 統一 API error message 解析

## Token Refresh 流程

1. 呼叫 `/api/users` 時若 access token 過期，API 回傳 `401` + `TOKEN_EXPIRED`
2. axios interceptor 觸發 `refreshAccessToken()`
3. 以 refresh token 呼叫 `/auth/refresh` 取得新 access token
4. 更新 store 後自動重試原本失敗的請求
5. 若 refresh 失敗，清除登入狀態並導向登入頁

## 狀態管理與登入持久化

- `zustand` + `persist(localStorage)` 儲存：
  - `accessToken`
  - `refreshToken`
  - `user`
- `hydrated` flag 確保 rehydrate 後再做路由判斷，避免閃跳

## UX / RWD 重點

- shadcn dashboard 風格：sidebar + header + cards + table
- table 狀態完整：loading / error / empty / success
- 分頁使用 `keepPreviousData`，翻頁體驗較平順
- 行動裝置 sidebar 自動切為 drawer

## 需求對應

- [x] 登入 + token 儲存
- [x] 未登入不可看列表
- [x] 使用者列表（含頭像、狀態）
- [x] 分頁
- [x] Access token 過期自動 refresh + retry
- [x] 重新整理後維持登入
- [x] TypeScript + React
- [x] shadcn + zustand + TanStack Query

## 可再加強項目

- URL 同步篩選條件（可分享查詢狀態）
- 自動化測試（auth refresh、filters、store hydrate）
- 更完整 RBAC / 權限模型
