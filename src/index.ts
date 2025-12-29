export interface Env {
  BACKEND_BASE_URL: string
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)

    // 只代理 API
    if (!url.pathname.startsWith("/api/")) {
      return new Response("Not Found", { status: 404 })
    }

    const targetURL =
      env.BACKEND_BASE_URL + url.pathname + url.search

    // 原样转发（非常重要）
    return fetch(targetURL, {
      method: req.method,
      headers: req.headers,
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : req.body,
      redirect: "manual",
    })
  },
}