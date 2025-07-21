"use client";
import { useEffect, useState } from "react";

type Magasin = { _id: string; nom: string; code: string };
type Responsable = {
  _id: string;
  email: string;
  magasinId: Magasin;
};

export default function ResponsablesList() {
  const [responsables, setResponsables] = useState<Responsable[]>([]);
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<{ email: string; magasinId: string; password: string }>({ email: "", magasinId: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  function fetchAll() {
    setLoading(true);
    const token = localStorage.getItem("token");
    Promise.all([
      fetch("/api/users", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/magasins").then(r => r.json()),
    ]).then(([users, mags]) => {
      setResponsables(users);
      setMagasins(mags);
    }).finally(() => setLoading(false));
  }

  useEffect(() => { fetchAll(); }, []);

  function startEdit(r: Responsable) {
    setEditId(r._id);
    setEdit({ email: r.email, magasinId: r.magasinId?._id || "", password: "" });
    setError("");
    setSuccess("");
  }

  async function handleSave(id: string) {
    setError(""); setSuccess("");
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...edit, password: edit.password || undefined }),
    });
    if (res.ok) {
      setSuccess("Responsable modifié");
      setEditId(null);
      fetchAll();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer ce responsable ?")) return;
    setError(""); setSuccess("");
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setSuccess("Responsable supprimé");
      fetchAll();
    } else {
      const data = await res.json();
      setError(data.error || "Erreur");
    }
  }

  if (loading) return <div>Chargement...</div>;

  const totalPages = Math.ceil(responsables.length / itemsPerPage);
  const paginated = responsables.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">Responsables</h2>
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="px-2 py-1 border">N°</th>
              <th className="px-2 py-1 border">Email</th>
              <th className="px-2 py-1 border">Magasin</th>
              <th className="px-2 py-1 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, idx) => (
              <tr key={r._id} className="text-black hover:bg-gray-50">
                <td className="px-2 py-1 border text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                {editId === r._id ? (
                  <>
                    <td className="px-2 py-1 border">
                      <input value={edit.email} onChange={e => setEdit({ ...edit, email: e.target.value })} className="border p-1 rounded w-full" />
                    </td>
                    <td className="px-2 py-1 border">
                      <select value={edit.magasinId} onChange={e => setEdit({ ...edit, magasinId: e.target.value })} className="border p-1 rounded w-full">
                        <option value="">Aucun</option>
                        {magasins.map(m => <option key={m._id} value={m._id}>{m.nom} ({m.code})</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-1 border flex flex-col sm:flex-row gap-1">
                      <input type="password" value={edit.password} onChange={e => setEdit({ ...edit, password: e.target.value })} placeholder="Nouveau mot de passe" className="border p-1 rounded mb-1 sm:mb-0" />
                      <button onClick={() => handleSave(r._id)} className="bg-green-600 text-white px-2 py-1 rounded">Enregistrer</button>
                      <button onClick={() => setEditId(null)} className="bg-gray-300 px-2 py-1 rounded">Annuler</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-2 py-1 border min-w-[180px]">{r.email}</td>
                    <td className="px-2 py-1 border text-sm text-gray-600">{r.magasinId?.nom} ({r.magasinId?.code})</td>
                    <td className="px-2 py-1 border">
                      <button onClick={() => startEdit(r)} className="text-blue-600 hover:underline mr-2">Modifier</button>
                      <button onClick={() => handleDelete(r._id)} className="text-red-600 hover:underline">Supprimer</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          Précédent
        </button>
        <span>Page {currentPage} / {totalPages || 1}</span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Suivant
        </button>
      </div>
    </div>
  );
} 