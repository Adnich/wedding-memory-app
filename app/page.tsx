"use client";

import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    setStatus("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL;

      if (!backendUrl) {
        throw new Error("Backend URL nije podešen.");
      }

      const res = await fetch(`${backendUrl}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload nije uspio.");
      }

      setStatus("Hvala! Vaše uspomene su uspješno poslane.");
      form.reset();
    } catch (error: any) {
      setStatus(error.message || "Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-2">
          Podijelite uspomene s nama
        </h1>

        <p className="text-center text-stone-600 mb-6">
          Upišite ime, posvetu i dodajte fotografije ili video s vjenčanja.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Ime</label>
            <input
              name="name"
              required
              placeholder="Vaše ime"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Posveta / poruka
            </label>
            <textarea
              name="message"
              rows={4}
              placeholder="Napišite poruku mladencima..."
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Fotografije ili video
            </label>
            <input
              name="files"
              type="file"
              multiple
              accept="image/*,video/*"
              className="w-full border rounded-xl p-3"
            />
            <p className="text-sm text-stone-500 mt-1">
              Možete dodati više slika ili kraći video.
            </p>
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white rounded-xl p-3 font-semibold disabled:opacity-60"
          >
            {loading ? "Šalje se..." : "Pošalji uspomene"}
          </button>
        </form>

        {status && (
          <p className="text-center mt-4 font-medium">
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
