"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";
import type { Subscription, NewSubscription } from "@/lib/types";
import { api } from "@/lib/api";
import { createClient } from "@/lib/supabase/client";

const SUBSCRIPTIONS_KEY = ["subscriptions"] as const;
const USER_KEY = ["user"] as const;

/** GET /api/subscriptions — the current user's subscriptions. */
export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: SUBSCRIPTIONS_KEY,
    queryFn: async () => {
      const { data } = await api.get<Subscription[]>("/subscriptions");
      return data;
    },
  });
}

/** POST /api/subscriptions — create a subscription. */
export function useAddSubscription() {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, NewSubscription>({
    mutationFn: async (input) => {
      const { data } = await api.post<Subscription>("/subscriptions", input);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
    },
  });
}

/** PATCH /api/subscriptions/:id — update a subscription. */
export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  return useMutation<Subscription, Error, { id: string; input: NewSubscription }>(
    {
      mutationFn: async ({ id, input }) => {
        const { data } = await api.patch<Subscription>(
          `/subscriptions/${id}`,
          input,
        );
        return data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
      },
    },
  );
}

/** DELETE /api/subscriptions/:id — remove a subscription. */
export function useDeleteSubscription() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await api.delete(`/subscriptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBSCRIPTIONS_KEY });
    },
  });
}

/** The current authenticated user (with metadata + timestamps). */
export function useUser() {
  return useQuery<User | null>({
    queryKey: USER_KEY,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) throw new Error(error.message);
      return data.user;
    },
  });
}

/** Update the user's profile (name + phone) in Supabase Auth metadata. */
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<User, Error, { name: string; phone: string }>({
    mutationFn: async ({ name, phone }) => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.updateUser({
        data: { name, phone },
      });
      if (error) throw new Error(error.message);
      if (!data.user) throw new Error("Failed to update profile");
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_KEY });
    },
  });
}
