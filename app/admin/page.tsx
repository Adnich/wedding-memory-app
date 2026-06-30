"use client";

import { useState } from "react";

type AdminMessage = {
  time: string;
  name: string;
  message: string;
  fileCount: string;
  files: string;
};

type AdminResponse = {
  messages?: AdminMessage[];
  error?: string;
};

function parseFileLine(line: string) {
  const match = line.match(/^(.*)\s+\((https?:\/\/[^)]+)\)$/);

  if (!match) {
    return null;
  }

  return {
    name: match[1],
    url: match[2],
  };
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadMessages() {
    setLoading(true);
    setStatus("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL;

      if (!backendUrl) {
        throw new Error("Backend URL nije podešen.");
      }

      const res = await fetch(`${backendUrl}/admin/messages`, {
        method: "GET",
        headers: {
          "x-admin-password": password,
        },
      });

      const data = (await res.json()) as AdminResponse;

      if (!res.ok) {
        throw new Error(data.error || "Poruke nije moguće učitati.");
      }

      setMessages(data.messages || []);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Došlo je do greške.";

      setMessages([]);
      setStatus(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-6">
          Admin pregled
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-medium mb-1">Admin šifra</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={loadMessages}
            className="w-full bg-black text-white rounded-xl p-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Učitava se..." : "Prikaži poruke"}
          </button>
        </div>

        {status && (
          <p className="text-center mb-4 font-medium">
            {status}
          </p>
        )}

        <div className="space-y-4">
          {messages.map((item, index) => {
            const fileLines = item.files
              .split(/\r?\n/)
              .map((line) => line.trim())
              .filter(Boolean);

            return (
              <article
                key={`${item.time}-${item.name}-${index}`}
                className="border rounded-xl p-4 space-y-3"
              >
                <div>
                  <p className="text-sm text-stone-500">Vrijeme</p>
                  <p className="font-medium">{item.time || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">Ime</p>
                  <p className="font-medium">{item.name || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">Posveta</p>
                  <p className="whitespace-pre-wrap">{item.message || "-"}</p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">Broj fajlova</p>
                  <p className="font-medium">{item.fileCount || "0"}</p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">Fajlovi</p>
                  {fileLines.length > 0 ? (
                    <div className="space-y-2">
                      {fileLines.map((line, fileIndex) => {
                        const parsed = parseFileLine(line);

                        if (!parsed) {
                          return (
                            <p
                              key={`${line}-${fileIndex}`}
                              className="break-words"
                            >
                              {line}
                            </p>
                          );
                        }

                        return (
                          <div
                            key={`${parsed.url}-${fileIndex}`}
                            className="break-words"
                          >
                            <p>{parsed.name}</p>
                            <a
                              href={parsed.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium underline"
                            >
                              Otvori fajl
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p>-</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
