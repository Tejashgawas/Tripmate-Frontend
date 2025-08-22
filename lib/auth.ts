// lib/auth.ts
export const BASE_URL = "https://tripmate-39hm.onrender.com/";
const REFRESH_URL = `${BASE_URL}auth/refresh`;

type UserRole = "general" | "provider" | "admin";
type AuthType  = "local"   | "google";

/* ───────────────── helper: refresh token ───────────────── */
async function refreshToken(): Promise<boolean> {
  try {
    const res = await fetch(REFRESH_URL, {
      method: "POST",
      credentials: "include",
    });
    return res.ok;                       // 200 => new access-token cookie set
  } catch {
    return false;
  }
}

/* ───────────────── helper: fetch with retry + refresh ───────────────── */
export const fetchWithRetry = async (
  url: string,
  options: RequestInit = {},
  {
    retries = 10,
    retryDelay = 500,
    factor = 2,
  } = {}
): Promise<Response> => {
  let attempt = 0;
  let triedRefresh = false;

  while (attempt <= retries) {
    try {
      const res = await fetch(url, {
        ...options,
        credentials: "include",
      });

      // happy path
      if (res.ok) return res;

      // ↻ 401 / 403 → try token refresh once then repeat same attempt
      if ((res.status === 401 || res.status === 403) && !triedRefresh) {
        triedRefresh = true;
        const refreshed = await refreshToken();
        if (refreshed) continue;         // retry original request immediately
        // refresh failed → fall through & throw at end
      }

      // retry on server errors 5xx
      if (res.status >= 500) {
        throw new Error(`HTTP ${res.status}`);
      }

      // client error we don't retry
      return res;
    } catch (err) {
      // network or thrown 5xx
      if (attempt >= retries) throw err;
      await new Promise(r => setTimeout(r, retryDelay * Math.pow(factor, attempt)));
    }
    attempt += 1;
  }
  throw new Error("Exhausted retries");
}

/* ───────────────── typed API wrappers ───────────────── */
export async function fetchMe(): Promise<{
  role: UserRole;
  auth_type: AuthType;
  is_new_user: boolean;
}> {
  const res = await fetchWithRetry(`${BASE_URL}me/`, { credentials: "include" });
  if (!res.ok) throw new Error(`fetchMe: ${res.status}`);
  return res.json();
}

export async function chooseRole(role: Exclude<UserRole, "admin">) {
  const res = await fetchWithRetry(`${BASE_URL}auth/choose-role`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error(`chooseRole: ${res.status}`);
  return res.json() as Promise<{ message: string; ok: boolean }>;
}
