import { getConfig, type DnsimpleConfig } from "./config.js";

export interface ApiResponse<T = any> {
  data: T;
  pagination?: {
    current_page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

export class ApiError extends Error {
  status: number;
  body: any;

  constructor(status: number, body: any) {
    const message =
      body?.message || body?.errors?.base?.[0] || `HTTP ${status}`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export class DnsimpleClient {
  private config: DnsimpleConfig;

  constructor(config?: DnsimpleConfig) {
    this.config = config || getConfig();
  }

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.config.accessToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "dnsimple-cli/1.0.0",
    };
  }

  private url(path: string): string {
    return `${this.config.baseUrl}/v2${path}`;
  }

  get accountId(): string {
    return this.config.accountId;
  }

  async request<T = any>(
    method: string,
    path: string,
    body?: any,
    query?: Record<string, string | number | undefined>
  ): Promise<ApiResponse<T>> {
    const url = new URL(this.url(path));
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== "") {
          url.searchParams.set(k, String(v));
        }
      }
    }

    const resp = await fetch(url.toString(), {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (resp.status === 204) {
      return { data: null as any };
    }

    if (resp.status === 401) {
      throw new ApiError(401, {
        message: "Authentication failed. Check your access token.",
      });
    }

    const json = await resp.json();

    if (!resp.ok) {
      throw new ApiError(resp.status, json);
    }

    return json;
  }

  async get<T = any>(
    path: string,
    query?: Record<string, string | number | undefined>
  ) {
    return this.request<T>("GET", path, undefined, query);
  }

  async post<T = any>(path: string, body?: any) {
    return this.request<T>("POST", path, body);
  }

  async put<T = any>(path: string, body?: any) {
    return this.request<T>("PUT", path, body);
  }

  async patch<T = any>(path: string, body?: any) {
    return this.request<T>("PATCH", path, body);
  }

  async delete<T = any>(path: string) {
    return this.request<T>("DELETE", path);
  }

  async paginate<T = any>(
    path: string,
    query?: Record<string, string | number | undefined>
  ): Promise<T[]> {
    const allItems: T[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const resp = await this.get<T[]>(path, { ...query, page, per_page: 100 });
      if (Array.isArray(resp.data)) {
        allItems.push(...resp.data);
      }
      if (resp.pagination) {
        totalPages = resp.pagination.total_pages;
      }
      page++;
    } while (page <= totalPages);

    return allItems;
  }
}
