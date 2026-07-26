"use client";

import { ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, Compass, ShieldCheck, Sparkles } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-actions";

const demoCredentials = {
  email: "demo@careeros.ai",
  password: "CareerOS2026!"
};

const credibilityPoints = [
  "Explainable talent matching for every open role",
  "Career Twin paths and fair-pay signals for candidates",
  "AI interview kits and automated onboarding for hiring teams"
];

const spotlightStats = [
  { label: "Employer partners", value: "148" },
  { label: "Candidate matches", value: "24k" },
  { label: "Avg. match score", value: "89%" }
];

export function LoginGateway() {
  const router = useRouter();
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f0e6] text-ink">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,34,61,.10),_transparent_34%),radial-gradient(circle_at_85%_20%,_rgba(169,128,47,.18),_transparent_26%),linear-gradient(135deg,_rgba(255,255,255,.74),_rgba(246,240,230,.96))]" />
      <div className="absolute -left-24 top-16 size-72 rounded-full bg-[#d7c08f]/25 blur-3xl" />
      <div className="absolute bottom-0 right-0 size-[26rem] rounded-full bg-[#18314f]/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-[1400px] gap-8 px-4 py-6 lg:grid-cols-[minmax(0,1.1fr)_460px] lg:px-8">
        <section className="login-hero-panel flex min-h-[420px] flex-col justify-between rounded-[32px] border border-white/55 bg-[#10233f] px-6 py-6 text-paper shadow-[0_24px_90px_rgba(16,35,63,.24)] lg:px-8 lg:py-8">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur">
              <div className="grid size-9 place-items-center rounded-full bg-[#d6aa50] text-[#1c1402]">
                <Compass size={18} aria-hidden="true" />
              </div>
              <div>
                <div className="font-serif text-lg font-semibold">CareerOS</div>
                <div className="mono text-[10px] uppercase tracking-[.18em] text-paper/60">Talent Mobility System</div>
              </div>
            </div>

            <div className="mt-10 max-w-2xl">
              <p className="kicker text-[#d7c899]">One operating system for candidates and employers</p>
              <h1 className="mt-3 font-serif text-5xl font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-6xl">
                Talent movement with structure, not guesswork.
              </h1>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#dbe4f3]">
                Candidate DNA, Career Twin paths, and fair-pay signals on one side. Explainable
                matching, AI interview kits, and automated onboarding on the other.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid size-11 place-items-center rounded-[14px] bg-[#d6aa50] text-[#1c1402]">
                  <Sparkles size={18} aria-hidden="true" />
                </div>
                <div>
                  <p className="kicker text-paper/50">Demo mode</p>
                  <h2 className="font-serif text-2xl font-semibold text-white">Presentation-ready access</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3">
                {credibilityPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-black/10 px-4 py-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#d6aa50]" aria-hidden="true" />
                    <p className="text-sm leading-6 text-[#dbe4f3]">{point}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {spotlightStats.map((stat) => (
                <div key={stat.label} className="rounded-[22px] border border-white/12 bg-white/8 p-4 backdrop-blur">
                  <p className="mono text-xs uppercase tracking-[.18em] text-paper/55">{stat.label}</p>
                  <p className="mt-4 font-serif text-4xl font-semibold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center lg:justify-end">
          <div className="login-card-glow w-full max-w-[460px] rounded-[32px] border border-white/70 bg-[rgba(255,252,247,.92)] p-4 shadow-[0_22px_80px_rgba(92,68,32,.18)] backdrop-blur xl:p-5">
            <div className="rounded-[26px] border border-[#eadfcd] bg-paper p-6 xl:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="kicker">Secure demo access</p>
                  <h2 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.03em] text-ink">Sign in</h2>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    The demo account is prefilled so the team can move directly into the product.
                  </p>
                </div>
                <div className="grid gap-2">
                  <div className="grid size-12 place-items-center rounded-[16px] bg-[#f3ead3] text-gold">
                    <ShieldCheck size={22} aria-hidden="true" />
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[22px] border border-[#e8dcc7] bg-[linear-gradient(135deg,_#fbf6ea,_#f5ecdf)] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="mono text-[11px] uppercase tracking-[.18em] text-[#8e7754]">Demo profile</p>
                    <p className="mt-2 font-semibold text-ink">Candidate workspace with employer switch</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="grid size-10 place-items-center rounded-[14px] bg-white text-ink shadow-sm">
                      <BriefcaseBusiness size={18} aria-hidden="true" />
                    </div>
                    <div className="grid size-10 place-items-center rounded-[14px] bg-white text-ink shadow-sm">
                      <Building2 size={18} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              </div>

              <form
                className="mt-6 grid gap-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  setError(null);
                  startTransition(async () => {
                    const result = await signIn(email, password);
                    if (result.ok) router.push(result.redirectTo);
                    else setError(result.error);
                  });
                }}
              >
                <label className="block">
                  <span className="kicker">Email</span>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-[16px] border border-[#dfd3c1] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-gold focus:bg-white focus:shadow-[0_0_0_4px_rgba(169,128,47,.10)]"
                  />
                </label>

                <label className="block">
                  <div className="flex items-center justify-between gap-3">
                    <span className="kicker">Password</span>
                    <span className="text-xs font-semibold text-faint">Prefilled for demo</span>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="mt-2 w-full rounded-[16px] border border-[#dfd3c1] bg-[#fcfaf6] px-4 py-3 text-sm font-semibold text-ink outline-none transition focus:border-gold focus:bg-white focus:shadow-[0_0_0_4px_rgba(169,128,47,.10)]"
                  />
                </label>

                {error ? (
                  <p role="alert" className="text-sm font-semibold text-bad">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={pending}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#10233f] px-4 py-3 text-sm font-semibold text-paper transition hover:-translate-y-0.5 hover:bg-gold hover:text-[#1c1402] disabled:opacity-60"
                >
                  {pending ? "Signing in…" : "Enter CareerOS"}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </form>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <InfoTile label="Email" value={demoCredentials.email} />
                <InfoTile label="Password" value={demoCredentials.password} />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-line bg-mist px-4 py-3">
      <p className="mono text-[11px] uppercase tracking-[.16em] text-faint">{label}</p>
      <p className="mt-2 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
