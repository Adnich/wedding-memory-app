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
    <main className="envelope-root min-h-screen overflow-x-hidden bg-[#f5efe3] text-[#302820]">
      <style jsx global>{`
        .envelope-root {
          --paper: #fbf8ef;
          --paper-deep: #efe5d5;
          --ink: #302820;
          --muted: #7d6f61;
          --gold: #b78937;
          --gold-light: #f3d58c;
          --gold-deep: #8d6423;
          --rose: #d8aaa2;
          font-family: Georgia, "Times New Roman", serif;
        }

        .envelope-root .script {
          font-family: "Brush Script MT", "Segoe Script", Georgia, serif;
        }

        .envelope-root .paper-texture {
          background:
            radial-gradient(circle at 24% 16%, rgba(255, 255, 255, 0.9), transparent 28%),
            radial-gradient(circle at 84% 8%, rgba(183, 137, 55, 0.1), transparent 24%),
            linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(244, 236, 221, 0.92)),
            repeating-linear-gradient(110deg, rgba(91, 74, 55, 0.026) 0 1px, transparent 1px 8px);
        }

        .envelope-root .envelope-scene {
          perspective: 1400px;
        }

        .envelope-root .envelope-panel {
          box-shadow:
            0 28px 80px rgba(74, 50, 28, 0.18),
            inset 0 0 0 1px rgba(255, 255, 255, 0.72);
          transition:
            min-height 900ms cubic-bezier(0.16, 1, 0.3, 1),
            max-width 900ms cubic-bezier(0.16, 1, 0.3, 1),
            border-radius 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        .envelope-root .envelope-panel::before,
        .envelope-root .envelope-panel::after {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          transition: opacity 700ms ease;
        }

        .envelope-root .envelope-panel::before {
          background:
            linear-gradient(37deg, transparent 49.65%, rgba(153, 124, 86, 0.24) 50%, transparent 50.35%),
            linear-gradient(-37deg, transparent 49.65%, rgba(153, 124, 86, 0.2) 50%, transparent 50.35%);
        }

        .envelope-root .envelope-panel::after {
          background:
            linear-gradient(145deg, transparent 49.7%, rgba(255, 255, 255, 0.82) 50%, transparent 50.3%),
            linear-gradient(-145deg, transparent 49.7%, rgba(187, 163, 129, 0.28) 50%, transparent 50.3%);
        }

        .envelope-root .envelope-flap {
          transform-origin: top center;
          transform: rotateX(0deg);
          pointer-events: none;
          transition:
            transform 1050ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 800ms ease;
          clip-path: polygon(0 0, 100% 0, 50% 100%);
          box-shadow: inset 0 -1px 0 rgba(153, 124, 86, 0.28);
        }

        .envelope-root .gold-seal {
          clip-path: polygon(28% 0, 72% 0, 100% 28%, 100% 72%, 72% 100%, 28% 100%, 0 72%, 0 28%);
          background:
            linear-gradient(145deg, #f7d982 0%, #b78937 43%, #8c5e1f 100%);
          box-shadow:
            0 16px 34px rgba(80, 48, 13, 0.23),
            inset 0 0 0 2px rgba(255, 232, 166, 0.55),
            inset 0 0 0 7px rgba(117, 79, 29, 0.18);
          transition:
            transform 900ms cubic-bezier(0.16, 1, 0.3, 1),
            opacity 500ms ease;
        }

        .envelope-root .gold-seal::before {
          content: "";
          position: absolute;
          inset: 8px;
          clip-path: inherit;
          border: 1px solid rgba(96, 60, 18, 0.34);
        }

        .envelope-root .letter-content {
          opacity: 0;
          transform: translateY(54px) scale(0.985);
          pointer-events: none;
          position: relative;
          z-index: 40;
          transition:
            opacity 700ms ease 260ms,
            transform 850ms cubic-bezier(0.16, 1, 0.3, 1) 220ms;
        }

        .envelope-root .closed-copy {
          pointer-events: auto;
          transition:
            opacity 420ms ease,
            transform 520ms ease;
        }

        .envelope-root .envelope-open .envelope-panel {
          min-height: 960px;
          max-width: 760px;
          border-radius: 2rem;
          overflow: visible;
        }

        .envelope-root .envelope-open .envelope-panel::before,
        .envelope-root .envelope-open .envelope-panel::after {
          opacity: 0.22;
        }

        .envelope-root .envelope-open .envelope-flap {
          transform: rotateX(-165deg);
          opacity: 0;
          visibility: hidden;
        }

        .envelope-root .envelope-open .gold-seal {
          opacity: 0;
          transform: translateY(-96px) scale(0.42) rotate(-10deg);
        }

        .envelope-root .envelope-open .letter-content {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .envelope-root .envelope-open .closed-copy {
          opacity: 0;
          transform: translateY(16px);
          pointer-events: none;
          visibility: hidden;
        }

        @media (min-width: 640px) {
          .envelope-root .envelope-open .envelope-panel {
            min-height: 900px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .envelope-root *,
          .envelope-root *::before,
          .envelope-root *::after {
            transition-duration: 1ms !important;
            animation-duration: 1ms !important;
          }
        }
      `}</style>

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(216,170,162,0.24),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(183,137,55,0.17),transparent_30%),linear-gradient(180deg,#fffdf8_0%,#f5efe3_52%,#eadcc8_100%)]" />
      <div className="pointer-events-none fixed -left-24 top-10 h-72 w-72 rounded-full bg-[#d8aaa2]/20 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 bottom-10 h-80 w-80 rounded-full bg-[#b78937]/15 blur-3xl" />

      <section
        className={`envelope-scene relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-6 sm:px-6 ${
          opened ? "envelope-open items-start sm:items-center" : ""
        }`}
      >
        <div className="envelope-panel paper-texture relative min-h-[min(760px,calc(100vh-48px))] w-full max-w-[430px] overflow-hidden rounded-[1.7rem] border border-white/70">
          <div className="envelope-flap paper-texture absolute inset-x-0 top-0 z-20 h-[38%] border-t border-white/80" />

          <div className="closed-copy absolute inset-x-8 top-[45%] z-30 -translate-y-1/2 text-center">
            <button
              type="button"
              onClick={() => setOpened(true)}
              className="gold-seal relative mx-auto flex h-28 w-24 items-center justify-center text-[#5b3710] transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[#b78937]/25"
              aria-label="Otvori kovertu"
            >
              <span className="script relative z-10 text-4xl italic leading-none">
                Z A
              </span>
            </button>

            <p className="mt-24 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#6f6256]">
              Dodirnite žig
            </p>
            <p className="mx-auto mt-4 max-w-xs text-sm italic leading-6 text-[#847668]">
              Otvorite digitalnu kovertu i podijelite uspomene sa vjenčanja.
            </p>
          </div>

          <div className="letter-content relative z-10 px-5 py-8 sm:px-8 sm:py-10">
            <div className="mx-auto max-w-xl rounded-[1.6rem] border border-[#d8bd80]/55 bg-[#fffaf0]/92 p-5 shadow-2xl shadow-[#6b4c28]/10 backdrop-blur sm:p-8">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-14 items-center justify-center [clip-path:polygon(28%_0,72%_0,100%_28%,100%_72%,72%_100%,28%_100%,0_72%,0_28%)] bg-gradient-to-br from-[#f4da8c] via-[#bd8d36] to-[#8b5d1e] text-[#5b3710] shadow-lg shadow-[#8b5d1e]/20">
                  <span className="script text-2xl italic">Z A</span>
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
