"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useUser, useUpdateProfile } from "@/lib/hooks";
import { profileSchema, type ProfileValues } from "@/lib/schema";
import AppHeader from "@/components/AppHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";

function formatDateTime(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AccountPage() {
  const { data: user, isLoading } = useUser();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", phone: "" },
  });

  // Prefill once the user loads.
  useEffect(() => {
    if (user) {
      reset({
        name: (user.user_metadata?.name as string | undefined) ?? "",
        phone: (user.user_metadata?.phone as string | undefined) ?? "",
      });
    }
  }, [user, reset]);

  function onValid(values: ProfileValues) {
    updateProfile.mutate(values, {
      onSuccess: () => toast.success("Profile updated"),
      onError: (err) => toast.error(err.message || "Failed to update"),
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      <AppHeader />

      <h1 className="mb-6 text-xl font-semibold tracking-tight">Account</h1>

      {isLoading ? (
        <div className="flex flex-col gap-4">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <form
              onSubmit={handleSubmit(onValid)}
              className="flex flex-col gap-4"
              noValidate
            >
              <Field label="Email">
                <Input value={user?.email ?? ""} readOnly disabled />
              </Field>

              <Field label="Name" htmlFor="name" error={errors.name?.message}>
                <Input id="name" placeholder="Your name" {...register("name")} />
              </Field>

              <Field label="Phone number" htmlFor="phone" error={errors.phone?.message}>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  inputMode="tel"
                  {...register("phone")}
                />
                <p className="text-xs text-faint">
                  Display only for now — reminders use the configured WhatsApp number.
                </p>
              </Field>

              <div className="flex justify-end">
                <Button type="submit" loading={updateProfile.isPending}>
                  Save changes
                </Button>
              </div>
            </form>
          </Card>

          <Card className="flex flex-col gap-3 p-6 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted">Account created</span>
              <span className="tabular-nums">{formatDateTime(user?.created_at)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">Last updated</span>
              <span className="tabular-nums">
                {formatDateTime(user?.updated_at)}
              </span>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
