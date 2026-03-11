import axios from "axios";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://lbbj5pioquwxdexqmcnwaxrpce0lcoqx.lambda-url.ap-southeast-1.on.aws";

export const rawHttp = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

