"use client";
import { useEffect, useState } from "react";

type Magasin = {
  _id: string;
  nom: string;
  code: string;
};

type Props = {
  onAdded: () => void;
};

export default function ReservationForm({ onAdded }: Props) {
  const [referenceArticle, setReferenceArticle] = useState("");
  const [nomClient, setNomClient] = useState("");
  const [telephone, setTelephone] = useState("");
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [magasinSource, setMagasinSource] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [magasinDest, setMagasinDest] = useState<Magasin | null>(null);

  // Récupérer la liste des magasins
  useEffect(() => {
    fetch("/api/magasins")
      .then(res => res.json())
      .then(data => setMagasins(data));
    // Décoder le magasin destination depuis le JWT
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Trouver le magasin du responsable
        fetch("/api/magasins")
          .then(res => res.json())
          .then(data => {
            const mag = data.find((m: Magasin) => m._id === payload.magasinId);
            setMagasinDest(mag || null);
          });
      } catch {}
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!magasinSource || !magasinDest) {
      setError("Magasin source ou destination introuvable");
      setLoading(false);
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          referenceArticle,
          nomClient,
          telephone,
          magasinSource,
          magasinDestination: magasinDest._id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur inconnue");
      setReferenceArticle("");
      setNomClient("");
      setTelephone("");
      setMagasinSource("");
      onAdded();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6">
       <input
        type="text"
        value={magasinDest ? `${magasinDest.nom} (${magasinDest.code})` : ""}
        className="border p-2 rounded bg-gray-100 text-black"
        disabled
        placeholder="Magasin destination (votre magasin)"
      />
      <h2 className="text-lg font-bold mb-2 text-black">Nouvelle réservation</h2>
      <input
        type="text"
        placeholder="Référence article"
        value={referenceArticle}
        onChange={e => setReferenceArticle(e.target.value)}
        className="border p-2 rounded text-black"
        required
      />
      <input
        type="text"
        placeholder="Nom du client"
        value={nomClient}
        onChange={e => setNomClient(e.target.value)}
        className="border p-2 rounded text-black"
        required
      />
      <input
        type="tel"
        placeholder="Téléphone"
        value={telephone}
        onChange={e => setTelephone(e.target.value)}
        className="border p-2 rounded text-black"
        required
      />
      <select
        value={magasinSource}
        onChange={e => setMagasinSource(e.target.value)}
        className="border p-2 rounded text-black"
        required
      >
        <option value="">Choisir magasin source (qui possède l'article)</option>
        {magasins.map(m => (
          <option key={m._id} value={m._id}>{m.nom} ({m.code})</option>
        ))}
      </select>
     
      {error && <span className="text-red-600 text-sm">{error}</span>}
      <button
        type="submit"
        className="bg-blue-600  px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 text-black"
        disabled={loading}
      >
        {loading ? "Création..." : "Créer la réservation"}
      </button>
    </form>
  );
} 