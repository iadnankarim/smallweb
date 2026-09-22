import { ApiError, type SmallWebApi } from "./contract";

/**
 * Talks to the NestJS backend. Expected routes:
 *   GET  /people
 *   GET  /sites                 -> SiteSummary[]
 *   GET  /sites/:address        -> Site | 404
 *   GET  /search?q=             -> SearchResult[]
 *   GET  /people/:id/visits     -> Visit[] (newest first)
 *   POST /visits                -> Visit
 *   POST /sites                 -> Site | 409 (address taken) | 400
 */
export function createHttpApi(baseUrl: string): SmallWebApi {
  const root = baseUrl.replace(/\/+$/, "");

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${root}${path}`, {
        ...init,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      });
    } catch {
      throw new ApiError("Could not reach the small web server.", "network");
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string | string[] };
      const message = Array.isArray(body.message) ? body.message.join(", ") : (body.message ?? res.statusText);
      throw new ApiError(message, res.status === 409 ? "taken" : res.status === 400 ? "invalid" : res.status === 404 ? "notfound" : "unknown");
    }
    return (await res.json()) as T;
  }

  return {
    listPeople: () => request("/people"),
    listSites: () => request("/sites"),
    async getSite(address) {
      try {
        return await request(`/sites/${encodeURIComponent(address)}`);
      } catch (error) {
        if (error instanceof ApiError && error.code === "notfound") return null;
        throw error;
      }
    },
    search: (q) => request(`/search?q=${encodeURIComponent(q)}`),
    listVisits: (personId) => request(`/people/${encodeURIComponent(personId)}/visits`),
    recordVisit: (visit) => request("/visits", { method: "POST", body: JSON.stringify(visit) }),
    publish: (site) => request("/sites", { method: "POST", body: JSON.stringify(site) }),
  };
}
