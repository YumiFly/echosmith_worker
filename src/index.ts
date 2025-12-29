export interface Env {
  BACKEND_BASE_URL: string
  INTERNAL_API_TOKEN:string
}

function corsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS,HEAD,FETCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Range",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get("Origin") || "*"

    // 1️⃣ 预检请求
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      })
    }

    // 2️⃣ 构造后端 URL
    const url = new URL(request.url)
    const targetURL = env.BACKEND_BASE_URL + url.pathname + url.search

    // 3️⃣ 只转发“安全 header”
    const forwardHeaders = new Headers()

    const contentType = request.headers.get("content-type")
    if (contentType) {
      forwardHeaders.set("content-type", contentType)
    }

    const range = request.headers.get("range")
    if (range) {
      forwardHeaders.set("range", range)
    }

    // forwardHeaders.set("X-Internal-Token",env.INTERNAL_API_TOKEN)
  
    const resp = await fetch(targetURL, {
      method: request.method,
      headers: forwardHeaders,
      body: request.method === "GET" || request.method === "HEAD"
        ? undefined
        : request.body,
    })

    // 4️⃣ 返回时统一加 CORS
    const headers = new Headers(resp.headers)
    Object.entries(corsHeaders(origin)).forEach(([k, v]) =>
      headers.set(k, v)
    )

    return new Response(resp.body, {
      status: resp.status,
      headers,
    })
  },
}