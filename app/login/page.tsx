"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email oder Passwort falsch");
      setLoading(false);
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black uppercase">
            Admin <span className="text-red-500">Login</span>
          </h1>
          <p className="text-gray-500 mt-2 uppercase text-sm font-bold">
            Nur für Admins
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-2 border-gray-800 p-8 bg-gray-950"
          style={{ boxShadow: "4px 4px 0px #ff0033" }}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-600 text-red-400 font-bold uppercase text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-medium"
              placeholder="deine@email.de"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-2">
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-red-600 font-medium"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-widest hover:bg-red-500 transition-colors disabled:opacity-50"
          >
            {loading ? "..." : "Einloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}
