"use client";
import { useEffect, useState } from "react";

type Reservation = {
  _id: string;
  referenceArticle: string;
  nomClient: string;
  telephone: string;
  magasinSource: { nom: string; code: string };
  magasinDestination: { nom: string; code: string };
  statut: string;
};

const STATUTS = ["en attente", "confirmee", "recuperee"];

export default function ReservationsAdminList() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  function fetchReservations() {
    const token = localStorage.getItem("token");
    fetch("/api/reservations", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setReservations(data))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  async function handleChangeStatut(id: string, current: string) {
    const next = current === 'en attente' ? 'confirmee' : current === 'confirmee' ? 'recuperee' : 'recuperee';
    const token = localStorage.getItem("token");
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ statut: next }),
    });
    setLoading(true);
    fetchReservations();
  }

  const filtered = filtre ? reservations.filter(r => r.statut === filtre) : reservations;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-2">Toutes les réservations</h2>
      <div className="mb-4 flex gap-2 items-center">
        <span>Filtrer par statut :</span>
        <select value={filtre} onChange={e => { setFiltre(e.target.value); setCurrentPage(1); }} className="border p-1 rounded">
          <option value="">Tous</option>
          {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300 bg-white">
          <thead>
            <tr className="bg-gray-100 text-black">
              <th className="px-2 py-1 border">N°</th>
              <th className="px-2 py-1 border">Article</th>
              <th className="px-2 py-1 border">Client</th>
              <th className="px-2 py-1 border">De</th>
              <th className="px-2 py-1 border">Vers</th>
              <th className="px-2 py-1 border">Statut</th>
              <th className="px-2 py-1 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, idx) => (
              <tr key={r._id} className="text-black hover:bg-gray-50">
                <td className="px-2 py-1 border text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td className="px-2 py-1 border">{r.referenceArticle}</td>
                <td className="px-2 py-1 border">{r.nomClient} <span className="text-gray-500">({r.telephone})</span></td>
                <td className="px-2 py-1 border">{r.magasinSource.nom} <span className="text-gray-500">({r.magasinSource.code})</span></td>
                <td className="px-2 py-1 border">{r.magasinDestination.nom} <span className="text-gray-500">({r.magasinDestination.code})</span></td>
                <td className="px-2 py-1 border">{r.statut}</td>
                <td className="px-2 py-1 border">
                  {r.statut !== 'recuperee' && (
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleChangeStatut(r._id, r.statut)}
                    >
                      Passer à {r.statut === 'en attente' ? 'confirmée' : 'récupérée'}
                    </button>
                  )}
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