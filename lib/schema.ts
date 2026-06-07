import { z } from "zod";

/** Sentinel for the "type your own name" option in the service dropdown. */
export const CUSTOM = "Custom";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Curated reminder lead-time options (days before the charge). */
export const REMINDER_DAY_OPTIONS = [0, 1, 2, 3, 5, 7] as const;

/** Human labels for the reminder dropdown. */
export const REMINDER_DAY_LABELS: Record<number, string> = {
  0: "On the day",
  1: "1 day before",
  2: "2 days before",
  3: "3 days before",
  5: "5 days before",
  7: "1 week before",
};

/** Real calendar date in YYYY-MM-DD (rejects junk like 2024-13-40). */
function isRealDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const [y, m, d] = value.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

/**
 * API payload schema (POST /api/subscriptions, PATCH /api/subscriptions/:id).
 * Shared so the server has one source of truth for validation.
 */
export const newSubscriptionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  cycle: z.enum(["monthly", "yearly"]),
  next_billing_date: z
    .string()
    .refine(isRealDate, "Must be a real date (YYYY-MM-DD)"),
  reminder_days_before: z
    .number()
    .int()
    .min(0, "Invalid reminder timing")
    .max(30, "Invalid reminder timing"),
});

/**
 * Front-end form schema. `service` + `customName` collapse into `name` on submit
 * (amount/date stay strings here — they come from inputs and convert on submit).
 */
export const subscriptionFormSchema = z
  .object({
    service: z.string().min(1),
    customName: z.string(),
    amount: z
      .string()
      .refine(
        (v) => Number.isFinite(Number(v)) && Number(v) > 0,
        "Amount must be greater than 0",
      ),
    cycle: z.enum(["monthly", "yearly"]),
    date: z.string().refine(isRealDate, "Pick a date"),
    reminderDays: z.string().refine((v) => {
      const n = Number(v);
      return Number.isInteger(n) && n >= 0 && n <= 30;
    }, "Pick a reminder time"),
  })
  .refine((v) => v.service !== CUSTOM || v.customName.trim().length > 0, {
    path: ["customName"],
    message: "Name is required",
  });

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;

/** Login form schema. */
export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Profile form schema (name + phone; both optional, stored in auth metadata). */
export const profileSchema = z.object({
  name: z.string().trim().max(80, "Name is too long"),
  phone: z
    .string()
    .trim()
    .max(20, "Too long")
    .regex(/^[0-9+\-\s()]*$/, "Only digits, spaces and + - ( )"),
});

export type ProfileValues = z.infer<typeof profileSchema>;
