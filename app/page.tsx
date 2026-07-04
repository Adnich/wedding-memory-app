"use client";

import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);

    setLoading(true);
    setStatus("");
    setStatusType("");

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

      setStatus("Hvala vam! Vaše uspomene su uspješno poslane.");
      setStatusType("success");
      form.reset();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Došlo je do greške.";
      setStatus(`Žao nam je, nešto nije prošlo kako treba. ${message}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fffaf3] text-stone-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(244,194,194,0.34),_transparent_34%),linear-gradient(135deg,_#fffaf3_0%,_#fff4ea_45%,_#f8e8df_100%)]" />
      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute -right-24 top-52 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
      <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/70 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-8 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between text-sm font-medium tracking-[0.22em] text-stone-600">
          <span>VJENČANJE</span>
          <span className="text-rose-500">♡</span>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:py-14">
          <div className="text-center lg:text-left">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-rose-700">
              Hvala što ste dio našeg posebnog dana.
            </p>
            <h1 className="text-5xl font-semibold leading-tight text-stone-950 sm:text-6xl lg:text-7xl">
              Adna & Zijad
            </h1>
            <p className="mt-5 text-xl font-medium text-stone-700 sm:text-2xl">
              Podijelite s nama najljepše uspomene s našeg vjenčanja
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-600 lg:mx-0">
              Skenirali ste QR kod? Upišite svoje ime, ostavite posvetu i
              dodajte fotografije ili video zapise koje želite podijeliti s
              nama.
            </p>

            <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-3 text-center lg:mx-0">
              <div className="rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl text-rose-700">01</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                  Ime
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl text-rose-700">02</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                  Posveta
                </p>
              </div>
              <div className="rounded-2xl border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur">
                <p className="text-2xl text-rose-700">03</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
                  Uspomene
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/80 bg-white/80 p-4 shadow-2xl shadow-rose-900/10 backdrop-blur sm:p-6">
            <div className="rounded-[1.5rem] border border-rose-100 bg-white p-5 shadow-inner shadow-amber-100/50 sm:p-8">
              <div className="mb-6 text-center">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
                  Knjiga uspomena
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-stone-950">
                  Pošaljite nam trenutak koji želite sačuvati
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-800">
                    Ime
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Vaše ime"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-800">
                    Posveta / poruka
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Napišite poruku mladencima..."
                    className="w-full resize-y rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-950 outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:bg-white focus:ring-4 focus:ring-rose-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-stone-800">
                    Fotografije ili video
                  </label>
                  <input
                    name="files"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    className="w-full rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-4 py-4 text-sm text-stone-700 file:mr-4 file:rounded-full file:border-0 file:bg-stone-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:bg-rose-50 focus:outline-none focus:ring-4 focus:ring-rose-100"
                  />
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Možete dodati više fotografija ili video zapisa odjednom.
                  </p>
                </div>

                <button
                  disabled={loading}
                  className="w-full rounded-2xl bg-stone-950 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-stone-900/20 transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Šalje se..." : "Pošalji uspomene"}
                </button>
              </form>

              {status && (
                <p
                  className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm font-semibold leading-6 ${
                    statusType === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {status}
                </p>
              )}
            </div>
          </div>
        </section>

        <footer className="pb-2 text-center text-sm font-medium text-stone-600">
          S ljubavlju, Adna i Zijad
        </footer>
      </div>
    </main>
  );
}
