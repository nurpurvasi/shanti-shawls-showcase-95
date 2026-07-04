import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Shanti Shawls Admin" },
      { name: "description", content: "Admin sign-in for Shanti Shawls Emporium." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. Check your email if confirmation is required, otherwise you're in.");
        // attempt sign-in for convenience
        await supabase.auth.signInWithPassword({ email, password });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err?.message ?? "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <SiteHeader />
      <main id="main" tabIndex={-1} className="focus:outline-none">
      <section className="px-6 md:px-10 py-20">
        <div className="mx-auto max-w-md">
          <p className="eyebrow text-center">Admin Access</p>
          <h1 className="mt-3 font-display text-4xl text-maroon text-center">
            {mode === "signin" ? "Sign in" : "Create admin account"}
          </h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            The first account you create becomes the admin automatically.
          </p>
          <form onSubmit={submit} className="mt-10 space-y-5 rounded-3xl bg-ivory border border-maroon/10 p-8">
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-ink/70">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-maroon/15 text-sm focus:outline-none focus:border-gold" />
            </label>
            <label className="block">
              <span className="text-xs uppercase tracking-[0.18em] text-ink/70">Password</span>
              <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full px-4 py-3 rounded-xl bg-cream border border-maroon/15 text-sm focus:outline-none focus:border-gold" />
            </label>
            <button disabled={loading} className="w-full rounded-full bg-maroon text-cream py-3.5 text-xs font-medium uppercase tracking-[0.25em] hover:bg-maroon-deep transition disabled:opacity-60">
              {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
            <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-xs text-muted-foreground hover:text-maroon">
              {mode === "signin" ? "First time? Create the admin account" : "Already have an account? Sign in"}
            </button>
            <Link to="/" className="block text-center text-xs text-muted-foreground hover:text-maroon mt-2">
              ← Back to storefront
            </Link>
          </form>
        </div>
      </section>
      </main>
    </div>
  );
}