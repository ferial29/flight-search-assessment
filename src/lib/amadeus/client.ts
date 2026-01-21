type TokenCache = {
    accessToken: string | null;
    expiresAt: number; // epoch ms
  };
  
  const cache: TokenCache = {
    accessToken: null,
    expiresAt: 0,
  };
  
  function getBaseUrl() {
    // Test base URL (Amadeus Self-Service)
    return "https://test.api.amadeus.com";
  }
  
  function requireEnv(name: string) {
    const v = process.env[name];
    if (!v) throw new Error(`Missing env var: ${name}`);
    return v;
  }
  
  export async function getAmadeusAccessToken(): Promise<string> {
    const now = Date.now();
  
    // Reuse cached token if still valid (keep a small safety window)
    if (cache.accessToken && cache.expiresAt - now > 30_000) {
      return cache.accessToken;
    }
  
    const clientId = requireEnv("AMADEUS_CLIENT_ID");
    const clientSecret = requireEnv("AMADEUS_CLIENT_SECRET");
  
    const url = `${getBaseUrl()}/v1/security/oauth2/token`;
  
    const body = new URLSearchParams();
    body.set("grant_type", "client_credentials");
    body.set("client_id", clientId);
    body.set("client_secret", clientSecret);
  
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      // Avoid caching at the fetch level; we manage caching ourselves
      cache: "no-store",
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token request failed: ${res.status} ${text}`);
    }
  
    const json = (await res.json()) as {
      access_token: string;
      expires_in: number;
      token_type: string;
    };
  
    cache.accessToken = json.access_token;
    cache.expiresAt = now + json.expires_in * 1000;
  
    return json.access_token;
  }
  
  export async function amadeusFetch<T>(
    path: string,
    params?: Record<string, string | number | undefined | null>
  ): Promise<T> {
    const token = await getAmadeusAccessToken();
  
    const url = new URL(`${getBaseUrl()}${path}`);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v === undefined || v === null || v === "") continue;
        url.searchParams.set(k, String(v));
      }
    }
  
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
  
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Amadeus request failed: ${res.status} ${text}`);
    }
  
    return (await res.json()) as T;
  }
  