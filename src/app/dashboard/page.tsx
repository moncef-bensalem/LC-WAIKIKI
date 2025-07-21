"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ReservationForm from "./ReservationForm";
import ReservationsList from "./ReservationsList";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "responsable") {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-transparent">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-700 drop-shadow">Dashboard Responsable LC Waikiki</h1>
      <section id="new" className="w-full max-w-2xl mb-8">
        <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100">
          <ReservationForm onAdded={() => setRefresh(r => r + 1)} />
        </div>
      </section>
      <section id="mes-demandes" className="w-full max-w-2xl mb-8">
        <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100">
          <ReservationsList key={refresh + '-creees'} type="creees" onAction={() => setRefresh(r => r + 1)} />
        </div>
      </section>
      <section id="a-traiter" className="w-full max-w-2xl mb-8">
        <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100">
          <ReservationsList key={refresh + '-a_traiter'} type="a_traiter" onAction={() => setRefresh(r => r + 1)} />
        </div>
      </section>
    </div>
  );
} 