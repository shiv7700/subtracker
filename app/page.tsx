"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginValues } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onValid(values: LoginValues) {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(values);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Bell className="size-6" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">SubTracker</h1>
          <p className="mt-1 text-sm text-muted">
            Get reminded before you get charged.
          </p>
        </div>

        <Card className="p-6">
          <form
            onSubmit={handleSubmit(onValid)}
            className="flex flex-col gap-4"
            noValidate
          >
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
            </Field>

            <Button type="submit" loading={loading} className="mt-1 w-full">
              Sign in
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-faint">
          Single-user app — accounts are created manually, there is no signup.
        </p>
      </div>
    </main>
  );
}
