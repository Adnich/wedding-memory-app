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
    <main className="relative min-h-screen overflow-hidden bg-[#fff9f1] text-[#332820]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_8%,rgba(226,182,160,0.38),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(196,151,86,0.22),transparent_27%),linear-gradient(180deg,#fffdf8_0%,#fff6ec_45%,#f5e5d8_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-6 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full border border-[#d5b06a]/25" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-[25rem] w-[25rem] -translate-x-1/2 rounded-full border border-[#eadcc8]/70" />
      <div className="pointer-events-none absolute -left-28 top-40 h-72 w-72 rounded-full bg-[#f1b7aa]/30 blur-3xl" />
      <div className="pointer-events-none absolute -right-32 top-80 h-80 w-80 rounded-full bg-[#d4a64f]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 left-10 hidden h-32 w-32 rounded-full border border-[#c49b55]/25 sm:block" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-[#dfcaa7]/40 pb-5 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#7b644d]">
          <span>Vjenčanje</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[#caa560]/55 to-transparent mx-5" />
          <span>Adna & Zijad</span>
        </header>

        <section className="flex flex-1 flex-col items-center pt-12 text-center sm:pt-16 lg:pt-20">
          <div className="relative w-full max-w-4xl">
            <div className="absolute left-1/2 top-7 h-24 w-px -translate-x-1/2 bg-gradient-to-b from-[#c49b55]/60 to-transparent" />
            <div className="relative mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full border border-[#d0ad6c]/50 bg-white/55 text-[#9a6d2d] shadow-sm shadow-[#b98a4a]/10 backdrop-blur">
              <span className="text-2xl leading-none">♡</span>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#a67c3f]">
              Vjenčanje
            </p>
            <h1 className="mt-5 text-6xl font-semibold leading-none text-[#2d241d] sm:text-7xl lg:text-8xl">
              Adna & Zijad
            </h1>
            <div className="mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-[#b98a4a] to-transparent" />
            <p className="mx-auto mt-7 max-w-2xl text-xl font-medium leading-8 text-[#5a483a] sm:text-2xl">
              Hvala što ste dio našeg posebnog dana
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#6f5b49] sm:text-lg">
              Podijelite s nama fotografije, video zapise i najljepše trenutke
              koje ste zabilježili.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#7c6857] sm:text-base">
              Skenirali ste QR kod? Upišite svoje ime, ostavite posvetu i
              dodajte fotografije ili video zapise koje želite podijeliti s
              nama.
            </p>
          </div>

          <section className="mt-10 w-full max-w-2xl sm:mt-14 lg:mt-16">
            <div className="rounded-[2rem] border border-[#d6b877]/60 bg-white/55 p-2 shadow-2xl shadow-[#8b5e34]/15 backdrop-blur-xl">
              <div className="rounded-[1.65rem] border border-white/80 bg-[#fffdf8]/95 px-5 py-7 shadow-inner shadow-[#f2dec2] sm:px-8 sm:py-9">
                <div className="mx-auto mb-7 max-w-md text-center">
                  <p className="text-[0.7rem] font-bold uppercase tracking-[0.34em] text-[#b08a4f]">
                    Knjiga uspomena
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-[#2d241d]">
                    Podijelite uspomene
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#6b5949] sm:text-base">
                    Upišite ime, ostavite posvetu i dodajte fotografije ili
                    video zapise.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#46382d]">
                      Ime
                    </label>
                    <input
                      name="name"
                      required
                      placeholder="Vaše ime"
                      className="w-full rounded-2xl border border-[#e1cfb2] bg-white px-4 py-3.5 text-[#2d241d] shadow-sm outline-none transition placeholder:text-[#a99b8c] focus:border-[#c29a56] focus:ring-4 focus:ring-[#d7b16d]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#46382d]">
                      Posveta / poruka
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      placeholder="Napišite poruku mladencima..."
                      className="w-full resize-y rounded-2xl border border-[#e1cfb2] bg-white px-4 py-3.5 text-[#2d241d] shadow-sm outline-none transition placeholder:text-[#a99b8c] focus:border-[#c29a56] focus:ring-4 focus:ring-[#d7b16d]/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#46382d]">
                      Fotografije ili video
                    </label>
                    <div className="rounded-3xl border border-dashed border-[#d4ad68] bg-gradient-to-br from-[#fff7ed] to-[#fffdf8] p-4 shadow-sm">
                      <input
                        name="files"
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="w-full cursor-pointer rounded-2xl bg-white/80 px-3 py-3 text-sm text-[#5c493b] file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-[#3b3028] file:to-[#6b4f35] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#fff8ec] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#d7b16d]/20"
                      />
                      <p className="mt-3 text-sm leading-6 text-[#756150]">
                        Možete dodati više fotografija ili video zapisa
                        odjednom.
                      </p>
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    className="group w-full rounded-2xl bg-gradient-to-r from-[#2f261f] via-[#4c3828] to-[#8d6835] px-5 py-4 text-base font-semibold text-[#fff8ec] shadow-xl shadow-[#7a4f26]/20 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#9b6f32]/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      {loading ? "Uspomene se šalju..." : "Pošalji uspomene"}
                      <span className="h-px w-6 bg-[#f3d99e] transition group-hover:w-9" />
                    </span>
                  </button>
                </form>

                {status && (
                  <p
                    className={`mt-5 rounded-2xl border px-4 py-3 text-center text-sm font-semibold leading-6 ${
                      statusType === "success"
                        ? "border-[#b8d7bd] bg-[#f4fbf1] text-[#315f3b]"
                        : "border-[#e7b9b1] bg-[#fff3f1] text-[#8a3a32]"
                    }`}
                  >
                    {status}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mx-auto mt-10 max-w-xl pb-8 text-center sm:mt-12">
            <div className="mx-auto mb-5 h-px w-28 bg-gradient-to-r from-transparent via-[#b98a4a] to-transparent" />
            <p className="text-sm leading-7 text-[#715d4c] sm:text-base">
              Svaka fotografija i svaka poruka ostaje kao dio naše zajedničke
              uspomene.
            </p>
          </section>
        </section>

        <footer className="border-t border-[#dfcaa7]/40 py-5 text-center text-sm font-medium text-[#6d5847]">
          S ljubavlju, Adna i Zijad ♡
        </footer>
      </div>
    </main>
  );
}
