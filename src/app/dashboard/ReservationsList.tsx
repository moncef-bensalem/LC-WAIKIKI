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

type Props = {
  type?: "creees" | "a_traiter";
  onAction?: () => void;
};

export default function ReservationsList({ type = "creees", onAction }: Props) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/reservations?type=${type}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setReservations(data);
          setError("");
        } else {
          setReservations([]);
          setError(data.error || "Erreur lors du chargement des réservations");
        }
      })
      .finally(() => setLoading(false));
    setCurrentPage(1); // reset page on type or action change
  }, [type, onAction]);

  const totalPages = Math.ceil(reservations.length / itemsPerPage);
  const paginated = reservations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-2 text-black">
        {type === "a_traiter" ? "Demandes à traiter dans mon magasin" : "Mes demandes de réservation"}
      </h2>
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
              {type === "a_traiter" && <th className="px-2 py-1 border">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginated.map((r, idx) => (
              <tr key={r._id} className="text-black hover:bg-gray-50">
                <td className="px-2 py-1 border text-center">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                <td className="px-2 py-1 border">{r.referenceArticle}</td>
                <td className="px-2 py-1 border">{r.nomClient} <span className="text-gray-500">({r.telephone})</span></td>
                <td className="px-2 py-1 border">{r.magasinDestination.nom} <span className="text-gray-500">({r.magasinDestination.code})</span></td>
                <td className="px-2 py-1 border">{r.magasinSource.nom} <span className="text-gray-500">({r.magasinSource.code})</span></td>
                <td className="px-2 py-1 border">{r.statut}</td>
                {type === "a_traiter" && (
                  <td className="px-2 py-1 border">
                    {r.statut !== 'recuperee' && <ActionButtons r={r} onAction={onAction} />}
                  </td>
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

function ActionButtons({ r, onAction }: { r: Reservation; onAction?: () => void }) {
  const [loading, setLoading] = useState(false);
  async function handleChangeStatut(next: string) {
    setLoading(true);
    const token = localStorage.getItem("token");
    await fetch(`/api/reservations/${r._id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ statut: next }),
    });
    setLoading(false);
    if (onAction) onAction();
  }
  return (
    <>
      {r.statut === 'en attente' && (
        <>
          <button className="ml-4 text-blue-600 hover:underline" disabled={loading} onClick={() => handleChangeStatut('confirmee')}>Confirmer</button>
          <button className="ml-2 text-red-600 hover:underline" disabled={loading} onClick={() => handleChangeStatut('annulee')}>Annuler</button>
        </>
      )}
      {r.statut === 'confirmee' && (
        <button className="ml-4 text-green-600 hover:underline" disabled={loading} onClick={() => handleChangeStatut('recuperee')}>Marquer comme récupérée</button>
      )}
    </>
  );
} 