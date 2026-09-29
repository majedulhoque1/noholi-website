import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import "./login.css";

// Public site, for the "back to the website" link.
const WEBSITE_URL = import.meta.env.VITE_WEBSITE_URL || "https://noholi-website.vercel.app";

export default function Login() {
  const { user, loading, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="nl-login nl-login--loading">
        <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    setSubmitting(true);
    const { error: err } = await signIn(email.trim(), password);
    if (err) setError(err);
    setSubmitting(false);
  };

  return (
    <div className="nl-login">
      <aside className="nl-login-panel">
        <div className="nl-login-ledger" aria-hidden="true" />
        <div className="nl-login-grain" aria-hidden="true" />

        <img className="nl-login-logo nl-rise" style={{ "--d": 0 } as React.CSSProperties}
          src="/noholi-logo-light.png" alt="Noholi" width={98} height={64} />

        <div className="nl-login-pitch">
          <p className="nl-login-kicker nl-rise" style={{ "--d": 1 } as React.CSSProperties}>Noholi OS · Staff console</p>
          <h2 className="nl-login-headline nl-rise" style={{ "--d": 2 } as React.CSSProperties}>
            Every book, every reader, <em>one ledger.</em>
          </h2>
          <span className="nl-login-rule" aria-hidden="true" />
          <p className="nl-login-lede nl-rise" style={{ "--d": 3 } as React.CSSProperties}>
            Lending, members, donations and fines for Noholi Library &amp; Press, kept in one place
            for the people who run the desk.
          </p>
        </div>

        <p className="nl-login-foot nl-rise" style={{ "--d": 4 } as React.CSSProperties}>
          Staff access only · Admins confirm each sign-in with an authenticator code
        </p>
      </aside>

      <main className="nl-login-main">
        <form onSubmit={handleSubmit} className="nl-login-form" noValidate>
          <p className="nl-login-kicker nl-login-kicker--ink nl-rise" style={{ "--d": 2 } as React.CSSProperties}>Sign in</p>
          <h1 className="nl-login-title nl-rise" style={{ "--d": 3 } as React.CSSProperties}>Welcome back</h1>
          <p className="nl-login-sub nl-rise" style={{ "--d": 4 } as React.CSSProperties}>
            Use the email and password your Noholi admin gave you.
          </p>

          <div className="nl-login-field nl-rise" style={{ "--d": 5 } as React.CSSProperties}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@noholi.org"
              aria-invalid={!!error}
            />
          </div>

          <div className="nl-login-field nl-rise" style={{ "--d": 6 } as React.CSSProperties}>
            <label htmlFor="password">Password</label>
            <div className="nl-login-password">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                aria-invalid={!!error}
              />
              <button
                type="button"
                className="nl-login-reveal"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="nl-login-error" role="alert">{error}</p>
          )}

          <button type="submit" className="nl-login-submit nl-rise" style={{ "--d": 7 } as React.CSSProperties} disabled={submitting}>
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-label="Signing in" />
            ) : (
              <>
                Sign in <ArrowRight className="nl-login-arrow h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>

          <p className="nl-login-help nl-rise" style={{ "--d": 8 } as React.CSSProperties}>
            Forgot your password? Ask a Noholi admin to reset it.
          </p>
        </form>

        <a className="nl-login-back" href={WEBSITE_URL}>← Noholi Library website</a>
      </main>
    </div>
  );
}
