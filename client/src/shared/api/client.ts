const BASE_URL = import.meta.env.VITE_API_URL;
let isRefreshing = false;
let refreshSubscribers: (() => Promise<void>)[] = [];
const subscribeTokenRefresh = (cb: () => Promise<void>) => {
  refreshSubscribers.push(cb);
};
const onRefreshed = async () => {
  const promises = refreshSubscribers.map((cb) => cb());
  refreshSubscribers = [];
  await Promise.all(promises);
};
export const request = async (
  url: string,
  options?: RequestInit,
): Promise<any> => {
  const res = await fetch(`${BASE_URL}${url}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (res.status === 401) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async () => {
          try {
            const result = await request(url, options);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      });
    }
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        isRefreshing = false;
        onRefreshed();
        return await request(url, options);
      } else {
        isRefreshing = false;
        refreshSubscribers = [];
        window.location.href = '/';
        return;
      }
    } catch {
      isRefreshing = false;
      refreshSubscribers = [];
      window.location.href = '/';
      return;
    }
  }
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
};
export const getMeRequest = () => {
  return request('/auth/me', {
    method: 'GET',
  });
};
