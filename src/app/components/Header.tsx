"use client";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<unknown>(null);

  useEffect(() => {
    if (pathname === "/login") return;
    const token = localStorage.getItem("token");
    if (token) {
      try {
        setUser(JSON.parse(atob(token.split(".")[1])));
      } catch {}
    }
  }, [pathname]);

  if (pathname === "/login" || !user) return null;

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <nav className="w-full flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-700 via-blue-500 to-blue-400 shadow-lg sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-extrabold text-white tracking-tight drop-shadow-lg select-none">LC Waikiki</span>
        <span className="ml-4 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider shadow-sm">
          {user.role === 'admin' ? 'Admin' : 'Responsable'}
        </span>
      </div>
      <div className="flex items-center gap-8">
        {user.role === 'responsable' && (
          <>
            <a href="/dashboard#new" className="text-white font-medium hover:underline underline-offset-4 transition">Nouvelle réservation</a>
            <a href="/dashboard#mes-demandes" className="text-white font-medium hover:underline underline-offset-4 transition">Mes demandes</a>
            <a href="/dashboard#a-traiter" className="text-white font-medium hover:underline underline-offset-4 transition">À traiter</a>
          </>
        )}
        {user.role === 'admin' && (
          <a href="/admin" className="text-white font-medium hover:underline underline-offset-4 transition">Admin</a>
        )}
        <span className="hidden sm:block text-white font-medium text-base drop-shadow-sm">{user.email}</span>
        <button
          onClick={handleLogout}
          className="bg-white text-blue-700 font-bold px-4 py-1.5 rounded-full shadow hover:bg-blue-100 transition-all border border-blue-200"
        >
          Déconnexion
        </button>
      </div>
    </nav>
  );
} 