"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import MagasinsList from "./MagasinsList";
import ReservationsAdminList from "./ReservationsAdminList";
import AddResponsableForm from "./AddResponsableForm";
import ResponsablesList from "./ResponsablesList";
import { useState } from "react";

export default function AdminPage() {
  const router = useRouter();
  const [refreshResp, setRefreshResp] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role !== "admin") {
        router.replace("/login");
      }
    } catch {
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-transparent text-black">
      <h1 className="text-3xl font-extrabold mb-8 text-blue-700 drop-shadow">Dashboard Admin LC Waikiki</h1>
      <section className="w-full max-w-3xl mb-8 text-black">
        <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100 text-black">
          <MagasinsList />
        </div>
      </section>
      <section className="w-full max-w-3xl mb-8 text-black">
        <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100 text-black">
          <AddResponsableForm onAdded={() => setRefreshResp(r => r + 1)} />
          <ResponsablesList key={refreshResp} />
        </div>
      </section>
      <section className="w-full max-w-3xl mb-8 text-black">
        <div className="bg-white/90 rounded-xl shadow-lg p-6 border border-blue-100 text-black">
          <ReservationsAdminList />
        </div>
      </section>
    
    </div>
  );
} 