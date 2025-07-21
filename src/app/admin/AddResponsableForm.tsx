"use client";
import { useEffect, useState } from "react";

type Magasin = { _id: string; nom: string; code: string };

type Props = { onAdded: () => void };

export default function AddResponsableForm({ onAdded }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [magasinId, setMagasinId] = useState("");
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/magasins").then(r => r.json()).then(setMagasins);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email, password, magasinId }),
    });
    if (res.ok) {
      setSuccess("Responsable ajouté");
      setEmail(""); setPassword(""); setMagasinId("");
      onAdded();
      setTimeout(() => setSuccess(""), 2000);
    } else {
      const data = await res.json();
      setError(data.error || "Erreur");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4 flex-wrap items-end">
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="border p-2 rounded" required />
      <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="border p-2 rounded" required />
      <select value={magasinId} onChange={e => setMagasinId(e.target.value)} className="border p-2 rounded" required>
        <option value="">Magasin associé</option>
        {magasins.map(m => <option key={m._id} value={m._id}>{m.nom} ({m.code})</option>)}
      </select>
      <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50" disabled={loading}>{loading ? "Ajout..." : "Ajouter"}</button>
      {success && <span className="text-green-600 text-sm ml-2">{success}</span>}
      {error && <span className="text-red-600 text-sm ml-2">{error}</span>}
    </form>
  );
} 