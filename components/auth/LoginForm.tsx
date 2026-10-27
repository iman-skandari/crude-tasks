"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { getErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { fetchCaptcha, login } from "@/lib/services";
import type { CaptchaResponse } from "@/types";

const schema = z.object({
  username: z.string().trim().min(1, "نام کاربری را وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
  captcha_answer: z.string().trim().min(1, "پاسخ کپچا را وارد کنید"),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null);
  const [captchaLoading, setCaptchaLoading] = useState(true);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [captchaTick, setCaptchaTick] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "", captcha_answer: "" },
  });

  const loadCaptcha = useCallback(async () => {
    setCaptchaLoading(true);
    setCaptchaError(null);
    try {
      setCaptcha(await fetchCaptcha());
      setCaptchaTick((n) => n + 1);
    } catch (error) {
      setCaptcha(null);
      setCaptchaError(getErrorMessage(error));
    } finally {
      setCaptchaLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCaptcha();
  }, [loadCaptcha]);

  const handleRefresh = () => {
    resetField("captcha_answer");
    loadCaptcha();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!captcha) return;
    setSubmitError(null);
    try {
      const result = await login({ ...values, salt: captcha.salt });
      signIn(result.access_token);
      router.replace("/dashboard");
    } catch (error) {
      setSubmitError(getErrorMessage(error));
      resetField("captcha_answer");
      loadCaptcha();
    }
  });

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <Field
        id="username"
        label="نام کاربری"
        autoComplete="username"
        dir="ltr"
        error={errors.username?.message}
        {...register("username")}
      />
      <Field
        id="password"
        label="رمز عبور"
        type="password"
        autoComplete="current-password"
        dir="ltr"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="space-y-2">
        <span className="block text-sm font-medium text-slate-700">کپچا</span>
        <div className="flex items-stretch gap-3">
          <div className="flex h-14 min-w-0 flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white px-2 shadow-xs">
            {captchaLoading ? (
              <span className="h-5 w-24 animate-pulse rounded bg-slate-200" />
            ) : captcha ? (
              <img src={captcha.captcha} alt="تصویر کپچا" className="max-h-12 w-auto max-w-full" />
            ) : (
              <span className="text-sm text-rose-600">بارگذاری نشد</span>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={captchaLoading}
            aria-label="دریافت کپچای جدید"
            className="h-14 shrink-0 px-4"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className={`h-5 w-5 ${captchaLoading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
            <span className="hidden sm:inline">جدید</span>
          </Button>
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {captchaLoading ? "در حال دریافت کپچا" : captchaTick > 0 ? "کپچا به‌روزرسانی شد" : ""}
        </p>
        {captchaError ? (
          <p role="alert" className="text-sm text-rose-600">
            {captchaError}
          </p>
        ) : null}
      </div>

      <Field
        id="captcha_answer"
        label="پاسخ کپچا"
        autoComplete="off"
        inputMode="numeric"
        dir="ltr"
        error={errors.captcha_answer?.message}
        {...register("captcha_answer")}
      />

      {submitError ? <Alert kind="error">{submitError}</Alert> : null}

      <Button
        type="submit"
        disabled={isSubmitting || captchaLoading || !captcha}
        className="w-full"
      >
        {isSubmitting ? "در حال ورود..." : "ورود"}
      </Button>
    </form>
  );
}