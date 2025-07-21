"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      localStorage.setItem("token", data.token);
      if (data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-sm flex flex-col gap-5 border border-blue-100"
      >
        <div className="flex flex-col items-center mb-2">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mb-2 shadow-lg">
            <span className="text-3xl font-extrabold text-white">LC</span>
          </div>
          <h1 className="text-2xl font-bold text-blue-700 mb-1">Connexion</h1>
          <span className="text-sm text-blue-400 font-medium">Plateforme LC Waikiki</span>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg transition outline-none bg-blue-50 placeholder:text-blue-300 text-black"
          required
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 p-2 rounded-lg transition outline-none bg-blue-50 placeholder:text-blue-300 text-black"
          required
        />
        {error && <div className="text-red-600 text-sm text-center font-semibold">{error}</div>}
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-2 rounded-lg font-bold shadow hover:from-blue-700 hover:to-blue-500 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>
      </form>
    </div>
  );
} 