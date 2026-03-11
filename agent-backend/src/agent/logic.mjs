import { chartPayloadSchema, upstreamUsersResponseSchema } from "./schemas.mjs";

class UpstreamApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = "UpstreamApiError";
    this.status = status;
    this.code = code;
  }
}

export function createAgentLogic({ upstreamApiBaseUrl }) {
  function getBearerToken(authorizationHeader) {
    if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authorizationHeader.slice("Bearer ".length).trim();
    return token.length > 0 ? token : null;
  }

  function normalizeUserStatus(status) {
    const normalized = String(status ?? "").trim().toLowerCase();
    if (normalized === "active") {
      return "active";
    }
    if (normalized === "inactive") {
      return "inactive";
    }
    return "unknown";
  }

  function needsUserData(message) {
    return /(使用者|users?|active|inactive|人數|幾個人|多少人|後台)/i.test(message);
  }

  function findPromptInjectionReason(message) {
    const patterns = [
      {
        re: /(ignore|bypass).*(instruction|rule|policy|system|developer)/i,
        reason: "疑似要求忽略系統規則",
      },
      {
        re: /(reveal|show|print).*(system prompt|developer message|secret|token|api key)/i,
        reason: "疑似要求洩漏敏感資訊",
      },
      {
        re: /(sql\s*injection|union\s+select|drop\s+table|or\s+1=1)/i,
        reason: "疑似注入攻擊內容",
      },
      {
        re: /(jailbreak|dan mode|prompt injection|越獄)/i,
        reason: "疑似越獄指令",
      },
    ];

    for (const item of patterns) {
      if (item.re.test(message)) {
        return item.reason;
      }
    }

    return null;
  }

  function detectRequestedChartType(message) {
    if (/(line\s*chart|折線圖?|趨勢圖?)/i.test(message)) {
      return "line";
    }
    if (/(pie\s*chart|piechart|圓餅圖?|比例圖?|占比)/i.test(message)) {
      return "pie";
    }
    if (/(\bline\b|折線|趨勢)/i.test(message)) {
      return "line";
    }
    if (/(\bpie\b|圓餅|比例|占比)/i.test(message)) {
      return "pie";
    }
    if (/(圖表|畫圖|畫.*圖|圖|\bchart\b|echart)/i.test(message)) {
      return "pie";
    }
    return null;
  }

  function extractSearchKeyword(message) {
    const emailMatch = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (emailMatch?.[0]) {
      return emailMatch[0].trim();
    }

    const patterns = [
      /(?:search|搜尋|找|查詢|查找)\s*(?:user|使用者)?\s*[:：]?\s*([^\n,，。.!?？]{2,80})/i,
      /(?:有沒有|是否有)\s*([^\n,，。.!?？]{2,80})/i,
    ];

    for (const pattern of patterns) {
      const matched = message.match(pattern);
      const keyword = matched?.[1]?.trim();
      if (keyword) {
        return keyword;
      }
    }

    return null;
  }

  function readAccessTokenFromContext(context) {
    const token = typeof context?.accessToken === "string" ? context.accessToken.trim() : "";
    return token || null;
  }

  function requireAccessToken(context) {
    const token = readAccessTokenFromContext(context);
    if (!token) {
      throw new Error("需要登入後才能查詢後台使用者資料。");
    }
    return token;
  }

  function formatPercent(value, total) {
    if (total <= 0) {
      return "0.0";
    }
    return ((value / total) * 100).toFixed(1);
  }

  function buildStatsSummary(stats) {
    return (
      `總人數：${stats.total}\n` +
      `Active：${stats.active}（${formatPercent(stats.active, stats.total)}%）\n` +
      `Inactive：${stats.inactive}（${formatPercent(stats.inactive, stats.total)}%）\n` +
      `Unknown：${stats.unknown}（${formatPercent(stats.unknown, stats.total)}%）`
    );
  }

  function buildSearchSummary(searchResult, keyword) {
    if (searchResult.totalMatched === 0) {
      return `找不到符合「${keyword}」的使用者。`;
    }

    const lines = searchResult.matched
      .map((user) => `- ${user.name} <${user.email}> (${user.status})`)
      .join("\n");

    return `找到 ${searchResult.totalMatched} 位符合「${keyword}」的使用者：\n${lines}`;
  }

  function buildChartPayload(chartType, stats) {
    if (chartType === "line") {
      return {
        type: "line",
        title: "Users Summary",
        labels: ["Total", "Active", "Inactive", "Unknown"],
        values: [stats.total, stats.active, stats.inactive, stats.unknown],
      };
    }

    return {
      type: "pie",
      title: "Users Status Distribution",
      labels: ["Active", "Inactive", "Unknown"],
      values: [stats.active, stats.inactive, stats.unknown],
    };
  }

  function extractToolArtifacts(messages) {
    let chart = null;
    let chartSummary = null;
    let stats = null;
    let searchResult = null;

    for (const message of messages ?? []) {
      if (message?.role !== "tool" || !Array.isArray(message.content)) {
        continue;
      }

      for (const item of message.content) {
        const toolResponse = item?.toolResponse;
        if (!toolResponse?.name) {
          continue;
        }

        if (toolResponse.name === "buildUsersStatusChart") {
          const output = toolResponse.output;
          const parsedChart = chartPayloadSchema.safeParse(output?.chart);
          if (parsedChart.success) {
            chart = parsedChart.data;
          }
          if (typeof output?.summary === "string" && output.summary.trim()) {
            chartSummary = output.summary.trim();
          }
          if (output?.stats) {
            stats = output.stats;
          }
        }

        if (toolResponse.name === "getUserStats") {
          const output = toolResponse.output;
          if (
            output &&
            typeof output.total === "number" &&
            typeof output.active === "number" &&
            typeof output.inactive === "number" &&
            typeof output.unknown === "number"
          ) {
            stats = output;
          }
        }

        if (toolResponse.name === "searchUsers") {
          const output = toolResponse.output;
          if (output && Array.isArray(output.matched) && typeof output.totalMatched === "number") {
            searchResult = output;
          }
        }
      }
    }

    return { chart, chartSummary, stats, searchResult };
  }

  async function fetchUsersPage(accessToken, page, limit) {
    const url = new URL("/api/users", upstreamApiBaseUrl);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        payload && typeof payload.message === "string"
          ? payload.message
          : payload && typeof payload.error === "string"
            ? payload.error
            : `後台 API 錯誤 (${response.status})`;
      const code = payload && typeof payload.code === "string" ? payload.code : undefined;
      throw new UpstreamApiError(response.status, code, message);
    }

    const parsed = upstreamUsersResponseSchema.safeParse(payload);
    if (!parsed.success) {
      throw new Error("後台回傳格式不符合預期");
    }

    return parsed.data;
  }

  async function fetchAllUsers(accessToken) {
    const limit = 50;
    const maxPages = 20;
    const users = [];
    let totalPages = 1;

    for (let page = 1; page <= Math.min(totalPages, maxPages); page += 1) {
      const result = await fetchUsersPage(accessToken, page, limit);
      users.push(...result.data);

      const reportedTotalPages = result.pagination?.total_pages;
      if (typeof reportedTotalPages === "number" && reportedTotalPages > 0) {
        totalPages = reportedTotalPages;
      } else if (result.data.length < limit) {
        break;
      } else {
        totalPages = page + 1;
      }
    }

    const deduped = new Map();
    for (const user of users) {
      deduped.set(user.id, user);
    }
    return Array.from(deduped.values());
  }

  async function computeUserStats(accessToken) {
    const users = await fetchAllUsers(accessToken);

    let active = 0;
    let inactive = 0;
    let unknown = 0;

    for (const user of users) {
      const status = normalizeUserStatus(user.status);
      if (status === "active") {
        active += 1;
      } else if (status === "inactive") {
        inactive += 1;
      } else {
        unknown += 1;
      }
    }

    return {
      total: users.length,
      active,
      inactive,
      unknown,
    };
  }

  async function searchBackendUsers(accessToken, keyword, status = "all", limit = 10) {
    const users = await fetchAllUsers(accessToken);
    const normalizedKeyword = keyword.trim().toLowerCase();

    const matched = users.filter((user) => {
      const haystack = `${user.name} ${user.email}`.toLowerCase();
      const statusValue = normalizeUserStatus(user.status);
      const keywordMatched = normalizedKeyword ? haystack.includes(normalizedKeyword) : true;
      const statusMatched = status === "all" ? true : statusValue === status;
      return keywordMatched && statusMatched;
    });

    return {
      matched: matched.slice(0, limit).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        status: normalizeUserStatus(user.status),
      })),
      totalMatched: matched.length,
    };
  }

  return {
    buildChartPayload,
    buildSearchSummary,
    buildStatsSummary,
    computeUserStats,
    detectRequestedChartType,
    extractSearchKeyword,
    extractToolArtifacts,
    findPromptInjectionReason,
    getBearerToken,
    needsUserData,
    readAccessTokenFromContext,
    requireAccessToken,
    searchBackendUsers,
  };
}
