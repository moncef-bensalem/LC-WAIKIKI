"use client";
import { useEffect, useState } from "react";
import AddMagasinForm from "./AddMagasinForm";

type Magasin = {
  _id: string;
  nom: string;
  code: string;
};

export default function MagasinsList() {
  const [magasins, setMagasins] = useState<Magasin[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/api/magasins")
      .then(res => res.json())
      .then(data => setMagasins(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;

  const totalPages = Math.ceil(magasins.length / itemsPerPage);
  const paginated = magasins.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce magasin ?')) return;
    await fetch(`/api/magasins/${id}`, { method: 'DELETE' });
    setLoading(true);
    fetch("/api/magasins")
      .then(res => res.json())
      .then(data => setMagasins(data))
      .finally(() => setLoading(false));
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">Liste des magasins</h2>
      <AddMagasinForm onAdded={() => {
        setLoading(true);
        fetch("/api/magasins")
          .then(res => res.json())
          .then(data => setMagasins(data))
          .finally(() => setLoading(false));
      }} />
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white mt-4">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="px-2 py-1 border">N°</th>
              <th className="px-2 py-1 border">Nom</th>
              <th className="px-2 py-1 border">Code</th>
              <th className="px-2 py-1 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((m, idx) => (
              <tr key={m._id} className="text-black hover:bg-gray-50">
                <td className="px-2 py-1 border text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td className="px-2 py-1 border">{m.nom}</td>
                <td className="px-2 py-1 border">{m.code}</td>
                <td className="px-2 py-1 border">
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDelete(m._id)}
                  >
                    Supprimer
                  </button>
                </td>
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