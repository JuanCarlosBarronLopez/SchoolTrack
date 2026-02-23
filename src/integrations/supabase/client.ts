/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-function-type */
// Lightweight adapter that mimics the Supabase client surface and proxies
// all requests to the local Node.js / Express + MongoDB backend.

const API_BASE = import.meta.env.VITE_API_URL || '';

function handleResponse(res: Response) {
  return res.json().then((body) => {
    if (!res.ok) {
      return { data: null, error: { message: body?.message || res.statusText } };
    }
    return { data: body, error: null };
  }).catch(() => ({ data: null, error: { message: 'Invalid JSON response' } }));
}

function buildQuery(params: Record<string, any>) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&');
}

// ─────────────────────────────────────────────────────────
// Auth module
// ─────────────────────────────────────────────────────────
const auth = {
  _session: null as any,
  _listeners: [] as Array<Function>,

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/api/auth/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const { data, error } = await handleResponse(res);
    if (!error && data) {
      this._session = data.session;
      localStorage.setItem('stoken', data.session?.token || '');
      this._listeners.forEach((l) => l('SIGNED_IN', data.session));
    }
    return { data, error };
  },

  async signUp({ email, password, options }: any) {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, metadata: options?.data }),
    });

    const { data, error } = await handleResponse(res);
    if (!error && data) {
      this._session = data.session;
      localStorage.setItem('stoken', data.session?.token || '');
      this._listeners.forEach((l) => l('SIGNED_UP', data.session));
    }
    return { data, error };
  },

  async signOut() {
    const token = localStorage.getItem('stoken');
    await fetch(`${API_BASE}/api/auth/signout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
    });
    this._session = null;
    localStorage.removeItem('stoken');
    this._listeners.forEach((l) => l('SIGNED_OUT', null));
    return { data: null, error: null };
  },

  onAuthStateChange(cb: (event: string, session: any) => void) {
    this._listeners.push(cb);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this._listeners = this._listeners.filter(l => l !== cb);
          }
        }
      }
    };
  },

  async getSession() {
    const token = localStorage.getItem('stoken');
    if (!token) return { data: { session: null }, error: null };
    const res = await fetch(`${API_BASE}/api/auth/session`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data, error } = await handleResponse(res);
    if (!error && data) {
      this._session = data.session;
      return { data: { session: data.session }, error: null };
    }
    // Token invalid or expired — clear it
    localStorage.removeItem('stoken');
    this._session = null;
    return { data: { session: null }, error: null };
  },
};

// ─────────────────────────────────────────────────────────
// QueryBuilder: mimics supabase.from('table').select().eq().in()...
// ─────────────────────────────────────────────────────────
class QueryBuilder implements PromiseLike<{ data: any; error: any }> {
  table: string;
  _select: string | null = null;
  _filters: Record<string, any> = {};
  _order: { column: string; ascending: boolean } | null = null;
  _limit: number | null = null;
  _single: boolean = false;
  _deleteId: string | null = null;

  constructor(table: string) { this.table = table; }

  select(cols = '*') { this._select = cols; return this; }

  eq(col: string, val: any) {
    this._filters[col] = val;
    return this;
  }

  /** Emulates .in(col, values) → sends as { col: { $in: values } } to the server */
  in(col: string, values: any[]) {
    this._filters[col] = { $in: values };
    return this;
  }

  order(column: string, opts: { ascending: boolean }) {
    this._order = { column, ascending: opts.ascending };
    return this;
  }

  limit(n: number) { this._limit = n; return this; }
  single() { this._single = true; return this; }
  maybeSingle() { this._single = true; return this; }

  _method: string = 'GET';
  _payload: any = null;

  insert(rows: any) {
    this._method = 'POST';
    this._payload = rows;
    return this;
  }

  update(payload: any) {
    this._method = 'PUT';
    this._payload = payload;
    return this;
  }

  delete() {
    this._method = 'DELETE';
    return this;
  }

  // Implements PromiseLike so the builder can be `await`ed directly
  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): PromiseLike<TResult1 | TResult2> {
    if (this._method === 'PUT' && this._filters.id) {
      this._payload = { ...this._payload, id: this._filters.id };
    }
    return this._request(this._method, this._payload).then(onfulfilled, onrejected) as any;
  }

  async _request(method: string, body?: any) {
    const token = localStorage.getItem('stoken');
    const params: Record<string, any> = {};
    if (this._select) params.select = this._select;
    if (Object.keys(this._filters).length) params.filters = JSON.stringify(this._filters);
    if (this._order) params.order = JSON.stringify(this._order);
    if (this._limit) params.limit = this._limit;

    // For DELETE pass id as explicit query param
    if (method === 'DELETE' && this._filters.id) {
      params.id = this._filters.id;
      delete params.filters;
    }

    const qs = Object.keys(params).length ? `?${buildQuery(params)}` : '';
    const url = `${API_BASE}/api/${this.table}${qs}`;

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const { data, error } = await handleResponse(res);
    if (this._single) {
      return { data: Array.isArray(data) && data.length ? data[0] : (data ?? null), error };
    }
    return { data, error };
  }
}

// ─────────────────────────────────────────────────────────
// Storage module
// ─────────────────────────────────────────────────────────
const storage = {
  from(bucket: string) {
    return {
      async upload(filePath: string, file: File | Blob, _opts?: any) {
        const token = localStorage.getItem('stoken');
        const form = new FormData();
        form.append('file', file);
        form.append('path', filePath);
        form.append('bucket', bucket);

        const res = await fetch(`${API_BASE}/api/storage/upload`, {
          method: 'POST',
          headers: { Authorization: token ? `Bearer ${token}` : '' },
          body: form,
        });
        return handleResponse(res);
      },

      getPublicUrl(filePath: string) {
        const publicUrl = `${API_BASE}/uploads/${bucket}/${filePath.split('/').slice(-1)[0]}`;
        return { data: { publicUrl } };
      },

      async remove(paths: string[]) {
        const token = localStorage.getItem('stoken');
        const res = await fetch(`${API_BASE}/api/storage/delete`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ bucket, paths }),
        });
        return handleResponse(res);
      },
    };
  },
};

// ─────────────────────────────────────────────────────────
// Realtime stub — no-op to prevent runtime crashes
// The custom backend doesn't support WebSocket / realtime.
// Components calling .channel() will get a silent no-op.
// ─────────────────────────────────────────────────────────
function createChannelStub() {
  const stub: any = {
    on: (_event: any, _opts: any, _cb: any) => stub,
    subscribe: (_cb?: any) => stub,
    unsubscribe: () => stub,
  };
  return stub;
}

// ─────────────────────────────────────────────────────────
// Stats helper — fetches /api/stats from the server
// ─────────────────────────────────────────────────────────
async function fetchStats(): Promise<{
  students: number;
  vehicles: number;
  activeVehicles: number;
  routes: number;
  activeRoutes: number;
  locations: number;
  drivers: number;
  users: number;
} | null> {
  const token = localStorage.getItem('stoken');
  if (!token) return null;
  const res = await fetch(`${API_BASE}/api/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const { data, error } = await handleResponse(res);
  if (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
  return data;
}

// ─────────────────────────────────────────────────────────
// Exported supabase-compatible client
// ─────────────────────────────────────────────────────────
export const supabase = {
  auth,
  from: (table: string) => new QueryBuilder(table),
  storage,
  channel: (_name: string) => createChannelStub(),
  removeChannel: (_channel: any) => { },
};

export { fetchStats };

export default supabase;