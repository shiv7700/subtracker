"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { NewSubscription, Subscription } from "@/lib/types";
import { POPULAR_SERVICES } from "@/lib/services";
import {
  CUSTOM,
  REMINDER_DAY_OPTIONS,
  REMINDER_DAY_LABELS,
  subscriptionFormSchema,
  type SubscriptionFormValues,
} from "@/lib/schema";
import { useAddSubscription, useUpdateSubscription } from "@/lib/hooks";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/ui/field";
import { DatePicker } from "@/components/ui/date-picker";

/** Build form defaults from an existing subscription (or blanks for "add"). */
function deriveDefaults(sub?: Subscription): SubscriptionFormValues {
  if (!sub) {
    return {
      service: CUSTOM,
      customName: "",
      amount: "",
      cycle: "monthly",
      date: "",
      reminderDays: "3",
    };
  }
  const known = (POPULAR_SERVICES as readonly string[]).includes(sub.name);
  return {
    service: known ? sub.name : CUSTOM,
    customName: known ? "" : sub.name,
    amount: String(sub.amount),
    cycle: sub.cycle,
    date: sub.next_billing_date,
    reminderDays: String(sub.reminder_days_before),
  };
}

/**
 * Add OR edit a subscription. Pass `subscription` to edit; omit it to add.
 * `trigger` is the element that opens the modal.
 */
export default function SubscriptionModal({
  subscription,
  trigger,
}: {
  subscription?: Subscription;
  trigger: React.ReactNode;
}) {
  const isEdit = Boolean(subscription);
  const [open, setOpen] = useState(false);

  const addSubscription = useAddSubscription();
  const updateSubscription = useUpdateSubscription();
  const pending = addSubscription.isPending || updateSubscription.isPending;

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: deriveDefaults(subscription),
  });

  // Re-seed the form from the source values each time the modal opens.
  useEffect(() => {
    if (open) reset(deriveDefaults(subscription));
  }, [open, subscription, reset]);

  const isCustom = watch("service") === CUSTOM;

  function onValid(values: SubscriptionFormValues) {
    const name =
      values.service === CUSTOM ? values.customName.trim() : values.service;

    const payload: NewSubscription = {
      name,
      amount: Number(values.amount),
      cycle: values.cycle,
      next_billing_date: values.date,
      reminder_days_before: Number(values.reminderDays),
    };

    const handlers = {
      onSuccess: () => {
        toast.success(`${name} ${isEdit ? "updated" : "added"}`);
        setOpen(false);
      },
      onError: (err: Error) =>
        toast.error(err.message || "Something went wrong"),
    };

    if (isEdit && subscription) {
      updateSubscription.mutate({ id: subscription.id, input: payload }, handlers);
    } else {
      addSubscription.mutate(payload, handlers);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        title={isEdit ? "Edit subscription" : "Add a subscription"}
        description={
          isEdit
            ? "Update the amount, cycle, or next charge date."
            : "Track a recurring charge and get reminded before it hits."
        }
      >
        <form
          onSubmit={handleSubmit(onValid)}
          className="flex flex-col gap-4"
          noValidate
        >
          <Field label="Service" htmlFor="service">
            <Select id="service" {...register("service")}>
              <option value={CUSTOM}>Custom…</option>
              {POPULAR_SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </Field>

          {isCustom && (
            <Field
              label="Name"
              htmlFor="customName"
              error={errors.customName?.message}
            >
              <Input
                id="customName"
                placeholder="e.g. Gym membership"
                autoFocus
                {...register("customName")}
              />
            </Field>
          )}

          <Field label="Amount (₹)" htmlFor="amount" error={errors.amount?.message}>
            <Input
              id="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="499"
              {...register("amount")}
            />
          </Field>

          <Field label="Billing cycle" htmlFor="cycle">
            <Select id="cycle" {...register("cycle")}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </Select>
          </Field>

          <Field
            label="Next billing date"
            htmlFor="date"
            error={errors.date?.message}
          >
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePicker
                  id="date"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Field>

          <Field
            label="Remind me"
            htmlFor="reminderDays"
            error={errors.reminderDays?.message}
          >
            <Select id="reminderDays" {...register("reminderDays")}>
              {REMINDER_DAY_OPTIONS.map((d) => (
                <option key={d} value={String(d)}>
                  {REMINDER_DAY_LABELS[d]}
                </option>
              ))}
            </Select>
          </Field>

          <div className="mt-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" loading={pending}>
              {isEdit ? "Save changes" : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
