"use client";
import { useState } from "react";

type Props = {
  onAdded: () => void;
};

export default function AddMagasinForm({ onAdded }: Props) {
  const [nom, setNom] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/magasins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setNom("");
      setCode("");
      setSuccess("Magasin ajouté !");
      onAdded();
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.message);
      setSuccess("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="Nom du magasin"
        value={nom}
        onChange={e => setNom(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Code (ex: TN01)"
        value={code}
        onChange={e => setCode(e.target.value)}
        className="border p-2 rounded w-24"
        required
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? "Ajout..." : "Ajouter"}
      </button>
      {success && <span className="text-green-600 text-sm ml-2">{success}</span>}
      {error && <span className="text-red-600 text-sm ml-2">{error}</span>}
    </form>
  );
} 