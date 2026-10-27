import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -start-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-32 -end-16 h-96 w-96 rounded-full bg-fuchsia-300/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 text-base font-bold backdrop-blur">
            ID
          </span>
          <span className="text-lg font-bold">IDICorp</span>
        </div>

        <div className="relative space-y-4">
          <h2 className="text-4xl font-extrabold leading-snug">کنسول سرویس داخلی</h2>
          <p className="max-w-md text-base leading-8 text-white/85">
            مدیریت تسک‌ها، ماشین‌حساب لحظه‌ای و آزمایش سرویس اکو، همه در یک محیط.
          </p>
        </div>

        <p className="relative text-sm text-white/70">برای ادامه وارد حساب خود شوید.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white">
              ID
            </span>
            <span className="text-base font-bold">کنسول سرویس IDICorp</span>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-xl shadow-indigo-500/5 backdrop-blur sm:p-8">
            <h1 className="mb-1 text-2xl font-bold">ورود به کنسول</h1>
            <p className="mb-6 text-sm leading-6 text-slate-600">
              نام کاربری، رمز عبور و پاسخ کپچا را وارد کنید.
            </p>
            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}