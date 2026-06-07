import axios from "axios";

/**
 * Central axios instance for our own API routes.
 * - baseURL "/api" so callers use short paths ("/subscriptions").
 * - A response interceptor surfaces the server's { error } message as an Error,
 *   so React Query / UI just read `error.message`.
 */
export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      (axios.isAxiosError(error) &&
        (error.response?.data as { error?: string } | undefined)?.error) ||
      (error instanceof Error ? error.message : "") ||
      "Request failed";
    return Promise.reject(new Error(message));
  },
);
