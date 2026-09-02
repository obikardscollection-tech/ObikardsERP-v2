import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole } from "lucide-react";
import useAuth from "../hooks/useAuth";

function Login() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/dashboard" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await signIn({ email, password });
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Connexion impossible.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,#dbeafe,transparent_35%),linear-gradient(135deg,#f8fafc,#e2e8f0)] p-6">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center gap-4">
          <div className="grid size-12 place-items-center rounded-lg bg-blue-600 text-white"><LockKeyhole /></div>
          <div><h1 className="font-[var(--font-display)] text-2xl font-bold text-slate-950">OBIKARDS</h1><p className="text-sm text-slate-500">Accès ERP sécurisé</p></div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">Email
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="block text-sm font-semibold text-slate-700">Mot de passe
            <input className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-600" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p role="alert" className="text-sm font-medium text-red-700">{error}</p> : null}
          <button className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60" disabled={submitting} type="submit">
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default Login;