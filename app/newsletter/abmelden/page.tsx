"use client";
import { useState } from "react";

export default function AbmeldenPage() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!email) return;
    await fetch(`/api/newsletter?email=${encodeURIComponent(email)}`, { method: "DELETE" });
    setDone(true);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-black uppercase mb-6">Newsletter abmelden</h1>
        {done ? (
          <p className="text-green-400 font-bold">Du wurdest erfolgreich abgemeldet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Deine E-Mail-Adresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-red-600"
            />
            <button onClick={submit} className="bg-red-600 text-white font-black uppercase py-3 hover:bg-red-500 transition-colors">
              Abmelden
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
