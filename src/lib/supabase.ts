// Supabase shim — routes all calls to the local Express API
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3012';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('placesi_token');
}

function setToken(t: string) {
  localStorage.setItem('placesi_token', t);
}

function clearToken() {
  localStorage.removeItem('placesi_token');
}

function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

async function apiFetch(path: string, opts: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = { ...(opts.headers as any) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (opts.body && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(`${API_BASE}${path}`, { ...opts, headers });
}

// ─── Query Builder ───

type QBMethod = 'get' | 'post' | 'put' | 'delete';

class QueryBuilder {
  private table: string;
  private _method: QBMethod = 'get';
  private _body?: any;
  private _select = '*';
  private _filters: string[] = [];
  private _order?: string;
  private _limit?: number;
  private _offset?: number;
  private _single = false;
  private _maybeSingle = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string) { this._select = columns; return this; }
  
  eq(col: string, val: any) { this._filters.push(`eq.${col}=${encodeURIComponent(val ?? '')}`); return this; }
  neq(col: string, val: any) { this._filters.push(`neq.${col}=${encodeURIComponent(val ?? '')}`); return this; }
  gt(col: string, val: any) { this._filters.push(`gt.${col}=${encodeURIComponent(val)}`); return this; }
  gte(col: string, val: any) { this._filters.push(`gte.${col}=${encodeURIComponent(val)}`); return this; }
  lt(col: string, val: any) { this._filters.push(`lt.${col}=${encodeURIComponent(val)}`); return this; }
  ilike(col: string, pattern: string) { this._filters.push(`ilike.${col}=${encodeURIComponent(pattern)}`); return this; }
  or(condition: string) { this._filters.push(`or=${encodeURIComponent(condition)}`); return this; }
  order(col: string, opts?: { ascending?: boolean }) {
    this._order = `${col}.${opts?.ascending !== false ? 'asc' : 'desc'}`;
    return this;
  }
  limit(n: number) { this._limit = n; return this; }
  offset(n: number) { this._offset = n; return this; }
  range(from: number, to: number) { this._offset = from; this._limit = to - from + 1; return this; }
  
  single() { this._single = true; return this; }
  maybeSingle() { this._maybeSingle = true; return this; }
  
  insert(data: any) { this._method = 'post'; this._body = Array.isArray(data) ? data : data; return this; }
  update(data: any) { this._method = 'put'; this._body = data; return this; }
  delete() { this._method = 'delete'; return this; }

  private buildURL(): string {
    const params: string[] = [`select=${encodeURIComponent(this._select)}`];
    params.push(...this._filters);
    if (this._order) params.push(`order=${this._order}`);
    if (this._limit != null) params.push(`limit=${this._limit}`);
    if (this._offset != null) params.push(`offset=${this._offset}`);
    return `/api/db/${this.table}?${params.join('&')}`;
  }

  private async execute(): Promise<{ data: any; error: any }> {
    try {
      let response: Response;
      if (this._method === 'get') {
        response = await apiFetch(this.buildURL());
      } else if (this._method === 'post') {
        response = await apiFetch(`/api/db/${this.table}`, {
          method: 'POST',
          body: typeof this._body === 'string' ? this._body : JSON.stringify(this._body),
        });
      } else if (this._method === 'put') {
        response = await apiFetch(this.buildURL(), {
          method: 'PUT',
          body: JSON.stringify(this._body),
        });
      } else {
        response = await apiFetch(this.buildURL(), { method: 'DELETE' });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        return { data: null, error: err };
      }

      const json = await response.json();
      let data = json;

      // Generic DB endpoint returns arrays
      if (this._single) {
        if (Array.isArray(data)) {
          data = data[0] ?? null;
        }
        if (!data) return { data: null, error: { message: 'Not found', code: 'PGRST116' } };
      }
      if (this._maybeSingle) {
        if (Array.isArray(data)) data = data[0] ?? null;
      }

      return { data, error: null };
    } catch (e: any) {
      return { data: null, error: { message: e.message } };
    }
  }

  then<R>(onFulfilled: (v: { data: any; error: any }) => R, onRejected?: (e: any) => R): Promise<R> {
    return this.execute().then(onFulfilled, onRejected);
  }
}

// ─── Storage ───

class StorageBucket {
  constructor(private _bucket: string) {}

  async upload(path: string, file: File | Blob, _options?: any) {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiFetch('/api/upload', { method: 'POST', body: formData });
      return { error: null, data: { path } };
    } catch (e: any) {
      return { error: { message: e.message }, data: null };
    }
  }

  getPublicUrl(path: string) {
    return { data: { publicUrl: '/uploads/' + path } };
  }

  async remove(_paths: string[]) {
    return { error: null, data: [] };
  }

  async list(_prefix?: string, _options?: any) {
    return { data: [], error: null };
  }
}

// ─── RPC ───

async function rpc(fn: string, params?: Record<string, any>): Promise<{ data: any; error: any }> {
  try {
    switch (fn) {
      case 'increment_property_views':
        await apiFetch(`/api/properties/${params?.property_uuid}/views`, { method: 'POST' });
        return { data: null, error: null };
      case 'increment_contact_count':
        await apiFetch('/api/contact', { method: 'POST', body: JSON.stringify(params) });
        return { data: null, error: null };
      case 'increment_contractor_views':
        // no-op / tracked server-side
        return { data: null, error: null };
      case 'track_contractor_click':
        return { data: null, error: null };
      default:
        return { data: null, error: { message: `Unknown RPC: ${fn}` } };
    }
  } catch (e: any) {
    return { data: null, error: { message: e.message } };
  }
}

// ─── Auth ───

const auth = {
  getSession() {
    const token = getToken();
    if (!token) return Promise.resolve({ data: { session: null }, error: null });
    const payload = decodeJWT(token);
    return Promise.resolve({
      data: {
        session: {
          user: { ...payload, id: payload.id || payload.sub, aud: 'authenticated' },
          access_token: token,
        },
      },
      error: null,
    });
  },

  getUser() {
    const token = getToken();
    if (!token) return Promise.resolve({ data: { user: null }, error: null });
    const payload = decodeJWT(token);
    return Promise.resolve({
      data: { user: { ...payload, id: payload.id || payload.sub, aud: 'authenticated' } },
      error: null,
    });
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const handler = (e: StorageEvent) => {
      if (e.key === 'placesi_token') {
        const token = e.newValue || localStorage.getItem('placesi_token');
        if (token) {
          const payload = decodeJWT(token);
          callback('SIGNED_IN', {
            user: { ...payload, id: payload.id || payload.sub, aud: 'authenticated' },
            access_token: token,
          });
        } else {
          callback('SIGNED_OUT', null);
        }
      }
    };
    window.addEventListener('storage', handler);
    return { data: { subscription: { unsubscribe: () => window.removeEventListener('storage', handler) } } };
  },

  async signUp({ email, password, options }: { email: string; password: string; options?: { data?: Record<string, any> } }) {
    try {
      const res = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, ...(options?.data || {}) }),
      });
      const json = await res.json();
      if (!res.ok) return { data: { user: null, session: null }, error: json };

      const token = json.token;
      setToken(token);
      const profile = json.profile || json.user;
      return {
        data: {
          user: { ...profile, id: profile.id, aud: 'authenticated' },
          session: { user: { ...profile, id: profile.id, aud: 'authenticated' }, access_token: token },
        },
        error: null,
      };
    } catch (e: any) {
      return { data: { user: null, session: null }, error: { message: e.message } };
    }
  },

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    try {
      const res = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) return { data: { user: null, session: null }, error: json };

      const token = json.token;
      setToken(token);
      const user = json.user || json.profile;
      return {
        data: {
          user: { ...user, id: user.id, aud: 'authenticated' },
          session: { user: { ...user, id: user.id, aud: 'authenticated' }, access_token: token },
        },
        error: null,
      };
    } catch (e: any) {
      return { data: { user: null, session: null }, error: { message: e.message } };
    }
  },

  async signOut() {
    clearToken();
    return { error: null };
  },

  async updateUser(attrs: { password?: string; current_password?: string; new_password?: string }) {
    try {
      const res = await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          current_password: attrs.current_password || attrs.password,
          new_password: attrs.new_password || attrs.password,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        return { data: { user: null }, error: err };
      }
      return { data: { user: null }, error: null };
    } catch (e: any) {
      return { data: { user: null }, error: { message: e.message } };
    }
  },

  admin: {
    async updateUserById(userId: string, data: any) {
      try {
        // Used for agent management — update agent password via agents endpoint
        if (data.password) {
          const res = await apiFetch(`/api/agents/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ password: data.password }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ message: res.statusText }));
            return { data: { user: null }, error: err };
          }
        }
        return { data: { user: { id: userId } }, error: null };
      } catch (e: any) {
        return { data: { user: null }, error: { message: e.message } };
      }
    },
  },
};

export const supabase = {
  auth,
  from(table: string) {
    return new QueryBuilder(table);
  },
  storage: {
    from(bucket: string) {
      return new StorageBucket(bucket);
    },
  },
  rpc,
};
