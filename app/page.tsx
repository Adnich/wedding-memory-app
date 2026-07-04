"use client";

import { useState } from "react";

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [opened, setOpened] = useState(false);

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
    <main className="invite-root min-h-screen overflow-x-hidden bg-[#f3ecdf] text-[#302820]">
      <style jsx global>{`
        .invite-root {
          --gold: #b78937;
          --gold-soft: #ead2a1;
          --ink: #302820;
          --muted: #746657;
          font-family: Georgia, "Times New Roman", serif;
        }

        .invite-root .script {
          font-family: "Brush Script MT", "Segoe Script", Georgia, serif;
        }

        .invite-root .invitation-frame {
          width: min(100%, 430px);
          aspect-ratio: 945 / 1536;
          max-height: calc(100vh - 16px);
          transition:
            width 850ms cubic-bezier(0.16, 1, 0.3, 1),
            max-width 850ms cubic-bezier(0.16, 1, 0.3, 1),
            min-height 850ms cubic-bezier(0.16, 1, 0.3, 1),
            border-radius 850ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .invite-root .cover-button {
          transition:
            opacity 620ms ease,
            transform 900ms cubic-bezier(0.16, 1, 0.3, 1),
            visibility 620ms ease;
        }

        .invite-root .letter-content {
          position: absolute;
          inset: 0;
          opacity: 0;
          transform: translateY(40px) scale(0.985);
          pointer-events: none;
          transition:
            opacity 620ms ease 240ms,
            transform 820ms cubic-bezier(0.16, 1, 0.3, 1) 180ms;
        }

        .invite-root .opened .invitation-frame {
          width: min(100%, 760px);
          min-height: 900px;
          max-height: none;
          aspect-ratio: auto;
          border-radius: 2rem;
        }

        .invite-root .opened .cover-button {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-38px) scale(0.965);
          visibility: hidden;
        }

        .invite-root .opened .letter-content {
          position: relative;
          inset: auto;
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        @media (max-width: 430px) {
          .invite-root .invitation-frame {
            min-height: calc(100vh - 16px);
            border-radius: 0.9rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .invite-root *,
          .invite-root *::before,
          .invite-root *::after {
            transition-duration: 1ms !important;
          }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(216,170,162,0.24),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(183,137,55,0.18),transparent_30%),linear-gradient(180deg,#fffdf8_0%,#f3ecdf_56%,#e8d8c0_100%)]" />
      <div className="pointer-events-none fixed -left-24 top-10 h-72 w-72 rounded-full bg-[#d8aaa2]/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 bottom-10 h-80 w-80 rounded-full bg-[#b78937]/15 blur-3xl" />

      <section
        className={`relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-2 py-2 sm:px-6 sm:py-6 ${
          opened ? "opened items-start sm:items-center" : ""
        }`}
      >
        <div className="invitation-frame relative overflow-hidden rounded-[1.7rem] border border-white/75 bg-[#fbf6ec] shadow-2xl shadow-[#5a3a18]/20">
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="cover-button absolute inset-0 z-30 block h-full w-full cursor-pointer overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#b78937]/25"
            aria-label="Otvori digitalnu kovertu"
          >
            <img
              src="/envelope-cover.png"
              alt="Digitalna koverta sa zlatnim žigom Z A"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </button>

          <div className="letter-content relative z-10 px-5 py-8 sm:px-8 sm:py-10">
            <div className="mx-auto max-w-xl rounded-[1.7rem] border border-[#d8bd80]/60 bg-[#fffaf0]/95 p-5 shadow-2xl shadow-[#6b4c28]/10 backdrop-blur sm:p-8">
              <div className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center [clip-path:polygon(28%_0,72%_0,100%_28%,100%_72%,72%_100%,28%_100%,0_72%,0_28%)] bg-gradient-to-br from-[#f4da8c] via-[#bd8d36] to-[#8b5d1e] text-[#5b3710] shadow-lg shadow-[#8b5d1e]/20">
                  <span className="script text-3xl italic">Z A</span>
                </div>
                <p className="mt-6 text-[0.68rem] font-bold uppercase tracking-[0.38em] text-[#b78937]">
                  Adna & Zijad
                </p>
                <h1 className="mt-3 text-4xl font-semibold italic leading-tight text-[#2d261f] sm:text-5xl">
                  Podijelite uspomene
                </h1>
                <p className="mx-auto mt-4 max-w-md text-base leading-7 text-[#6f6256]">
                  Skenirali ste QR kod? Upišite svoje ime, ostavite posvetu i
                  dodajte fotografije ili video zapise koje želite podijeliti s
                  nama.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5 text-left">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#4c4035]">
                    Ime
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Vaše ime"
                    className="w-full rounded-2xl border border-[#dfc99b] bg-white px-4 py-3.5 text-[#302820] shadow-sm outline-none transition placeholder:text-[#a99b8c] focus:border-[#b78937] focus:ring-4 focus:ring-[#b78937]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#4c4035]">
                    Posveta / poruka
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Napišite poruku mladencima..."
                    className="w-full resize-y rounded-2xl border border-[#dfc99b] bg-white px-4 py-3.5 text-[#302820] shadow-sm outline-none transition placeholder:text-[#a99b8c] focus:border-[#b78937] focus:ring-4 focus:ring-[#b78937]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#4c4035]">
                    Fotografije ili video
                  </label>
                  <div className="rounded-3xl border border-dashed border-[#b78937]/60 bg-gradient-to-br from-[#fff8ec] to-white p-4 shadow-sm">
                    <input
                      name="files"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="w-full cursor-pointer rounded-2xl bg-white/85 px-3 py-3 text-sm text-[#5c493b] file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-[#2d261f] file:to-[#8d6423] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#fff8ec] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#b78937]/15"
                    />
                    <p className="mt-3 text-sm leading-6 text-[#766858]">
                      Možete dodati više fotografija ili video zapisa odjednom.
                    </p>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="group w-full rounded-2xl bg-gradient-to-r from-[#2d261f] via-[#5a4028] to-[#b78937] px-5 py-4 text-base font-semibold text-[#fff8ec] shadow-xl shadow-[#5a4028]/20 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#8b672c]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? "Uspomene se šalju..." : "Pošalji uspomene"}
                    <span className="h-px w-6 bg-[#f3d58c] transition group-hover:w-9" />
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

              <div className="mx-auto mt-8 h-px w-28 bg-gradient-to-r from-transparent via-[#b78937] to-transparent" />
              <p className="mt-5 text-center text-sm italic leading-7 text-[#6f6256]">
                Svaka fotografija i svaka poruka ostaje kao dio naše
                zajedničke uspomene.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
