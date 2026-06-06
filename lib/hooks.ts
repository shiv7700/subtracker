"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Subscription, NewSubscription } from "@/lib/types";

const SUBSCRIPTIONS_KEY = ["subscriptions"] as const;

/** Parse an error message out of a non-ok response, falling back to status text. */
async function errorFromResponse(res: Response): Promise<Error> {
  let message = res.statusText || `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (body && typeof body.error === "string" && body.error.length > 0) {
      message = body.error;
    }
  } catch {
    // body wasn't JSON — keep the fallback message
  }
  return new Error(message);
}

/** GET /api/subscriptions — the current user's subscriptions. */
export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: SUBSCRIPTIONS_KEY,
    queryFn: async () => {
      const res = await fetch("/api/subscriptions");
      if (!res.ok) throw await errorFromResponse(res);
      return res.json();
    },
  });
}

/** POST /api/subscriptions — create a subscription. */
export function useAddSubscription() {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, NewSubscription>({
    mutationFn: async (input) => {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw await errorFromResponse(res);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
    },
  });
}

/** DELETE /api/subscriptions/:id — remove a subscription. */
export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const res = await fetch(`/api/subscriptions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw await errorFromResponse(res);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
    },
  });
}
