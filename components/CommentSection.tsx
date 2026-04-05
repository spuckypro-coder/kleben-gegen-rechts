"use client";

import { useEffect, useState } from "react";
import { usePublicUser } from "./PublicUserProvider";
import { useSession } from "next-auth/react";

interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  userId: string | null;
}

interface Props {
  postSlug: string;
}

export default function CommentSection({ postSlug }: Props) {
  const { user: publicUser } = usePublicUser();
  const { data: adminSession } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const isAdmin = !!adminSession?.user;
  const isLoggedIn = isAdmin || !!publicUser;
  const currentUserName = isAdmin
    ? ((adminSession!.user as any).name || adminSession!.user!.email || "Admin")
    : publicUser?.name || "";

  useEffect(() => {
    fetch(`/api/comments?slug=${postSlug}`)
      .then((r) => r.json())
      .then((d) => setComments(Array.isArray(d) ? d : []));
  }, [postSlug]);

  const submit = async () => {
    if (!content.trim() || !isLoggedIn) return;
    setSubmitting(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postSlug, content }),
    });
    const newComment = await res.json();
    if (res.ok) {
      setComments((prev) => [...prev, newComment]);
      setContent("");
    }
    setSubmitting(false);
  };

  const startEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditContent(c.content);
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: editContent }),
    });
    if (res.ok) {
      const updated = await res.json();
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
    }
  };

  const deleteComment = async (id: string) => {
    if (!confirm("Kommentar wirklich löschen?")) return;
    const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const canEdit = (c: Comment) =>
    isAdmin || (!!publicUser && c.userId === publicUser.id);

  return (
    <div className="mt-16 border-t border-gray-800 pt-10">
      <h2 className="text-xl font-black uppercase mb-6">
        Kommentare <span className="text-gray-600 font-normal text-sm">({comments.length})</span>
      </h2>

      {/* Kommentarliste */}
      {comments.length === 0 ? (
        <p className="text-gray-600 text-sm mb-8">Noch keine Kommentare. Sei der Erste!</p>
      ) : (
        <div className="space-y-4 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="border-l-2 border-gray-800 pl-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-black text-sm uppercase">{c.authorName}</span>
                <span className="text-gray-600 text-xs">
                  {new Date(c.createdAt).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                {canEdit(c) && editingId !== c.id && (
                  <button
                    onClick={() => startEdit(c)}
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Bearbeiten
                  </button>
                )}
                {isAdmin && editingId !== c.id && (
                  <button
                    onClick={() => deleteComment(c.id)}
                    className="text-xs text-red-700 hover:text-red-400 transition-colors"
                  >
                    Löschen
                  </button>
                )}
              </div>

              {editingId === c.id ? (
                <div className="mt-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600 resize-none mb-2"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(c.id)}
                      disabled={!editContent.trim()}
                      className="px-4 py-1 bg-red-600 text-white font-black uppercase text-xs hover:bg-red-500 transition-colors disabled:opacity-50"
                    >
                      Speichern
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-1 border border-gray-700 text-gray-400 font-black uppercase text-xs hover:border-white hover:text-white transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 text-sm leading-relaxed">{c.content}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Kommentar schreiben */}
      <div className="bg-gray-950 border border-gray-800 p-6">
        <h3 className="font-black uppercase text-sm mb-4">Kommentar schreiben</h3>

        {isLoggedIn ? (
          <>
            <p className="text-gray-500 text-sm mb-3">
              Eingeloggt als{" "}
              <span className="text-white font-bold">
                {currentUserName}
                {isAdmin && <span className="ml-1 text-xs text-red-500">(Admin)</span>}
              </span>
            </p>
            <textarea
              placeholder="Dein Kommentar..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-gray-900 border border-gray-700 text-white px-3 py-2 text-sm focus:outline-none focus:border-red-600 resize-none mb-3"
            />
            <button
              onClick={submit}
              disabled={submitting || !content.trim()}
              className="px-6 py-2 bg-red-600 text-white font-black uppercase text-sm hover:bg-red-500 transition-colors disabled:opacity-50"
            >
              {submitting ? "Wird gesendet..." : "Kommentar senden"}
            </button>
          </>
        ) : (
          <div>
            <p className="text-gray-500 text-sm mb-4">
              Um zu kommentieren musst du eingeloggt sein.
            </p>
            <button
              onClick={() => setShowAuth(!showAuth)}
              className="px-6 py-2 bg-red-600 text-white font-black uppercase text-sm hover:bg-red-500 transition-colors"
            >
              {showAuth ? "Abbrechen" : "Einloggen / Registrieren"}
            </button>
            {showAuth && <AuthWidget onClose={() => setShowAuth(false)} />}
          </div>
        )}
      </div>
    </div>
  );
}

function AuthWidget({ onClose }: { onClose: () => void }) {
  const { login, register } = usePublicUser();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    const err = mode === "login"
      ? await login(email, password)
      : await register(name, email, password, newsletter);
    setLoading(false);
    if (err) setError(err);
    else onClose();
  };

  return (
    <div className="mt-3 bg-gray-900 border border-gray-700 p-4">
      <div className="flex gap-4 mb-4">
        <button onClick={() => setMode("login")} className={`text-xs font-black uppercase ${mode === "login" ? "text-white" : "text-gray-500"}`}>Login</button>
        <button onClick={() => setMode("register")} className={`text-xs font-black uppercase ${mode === "register" ? "text-white" : "text-gray-500"}`}>Registrieren</button>
      </div>
      {mode === "register" && (
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm mb-2 focus:outline-none" />
      )}
      <input type="email" placeholder="E-Mail" value={email} onChange={(e) => setEmail(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm mb-2 focus:outline-none" />
      <input type="password" placeholder="Passwort" value={password} onChange={(e) => setPassword(e.target.value)}
        className="w-full bg-gray-800 border border-gray-700 text-white px-3 py-2 text-sm mb-2 focus:outline-none" />
      {mode === "register" && (
        <label className="flex items-center gap-2 text-xs text-gray-400 mb-3 cursor-pointer">
          <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
          Newsletter abonnieren (neue Beiträge & Produkte)
        </label>
      )}
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <button onClick={submit} disabled={loading}
        className="w-full py-2 bg-red-600 text-white font-black uppercase text-sm hover:bg-red-500 disabled:opacity-50">
        {loading ? "..." : mode === "login" ? "Einloggen" : "Registrieren"}
      </button>
    </div>
  );
}
