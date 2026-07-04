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
    <main className="wedding-root relative min-h-screen overflow-hidden bg-[#faf6ec] text-[#2b2620]">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap");

        .wedding-root {
          --ivory: #faf6ec;
          --card: #f5eeda;
          --ink-green: #1f3d33;
          --ink-green-deep: #142821;
          --ink: #2b2620;
          --gold: #b8912f;
          --gold-light: #d9b969;
          --gold-soft: #e7d29f;
          --muted: #6f6151;
        }

        .wedding-root .font-display {
          font-family: "Playfair Display", "Times New Roman", serif;
        }

        .wedding-root .font-body {
          font-family: "Cormorant Garamond", "Times New Roman", serif;
        }

        .wedding-root .reveal {
          opacity: 0;
          transform: translateY(14px);
          animation: reveal-up 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .wedding-root .reveal-1 { animation-delay: 0.05s; }
        .wedding-root .reveal-2 { animation-delay: 0.25s; }
        .wedding-root .reveal-3 { animation-delay: 0.45s; }
        .wedding-root .reveal-4 { animation-delay: 0.65s; }
        .wedding-root .reveal-5 { animation-delay: 0.85s; }

        @keyframes reveal-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wedding-root .reveal {
            animation: none;
            opacity: 1;
            transform: none;
          }
        }

        .wedding-root .invite-card {
          position: relative;
          border: 1px solid rgba(184, 145, 47, 0.55);
          box-shadow: inset 0 0 0 4px var(--ivory), inset 0 0 0 5px rgba(184, 145, 47, 0.35);
        }

        .wedding-root .corner {
          position: absolute;
          width: 30px;
          height: 30px;
          opacity: 0.75;
        }
        .wedding-root .corner-tl { top: -1px; left: -1px; }
        .wedding-root .corner-tr { top: -1px; right: -1px; transform: scaleX(-1); }
        .wedding-root .corner-bl { bottom: -1px; left: -1px; transform: scaleY(-1); }
        .wedding-root .corner-br { bottom: -1px; right: -1px; transform: scale(-1, -1); }

        .wedding-root input,
        .wedding-root textarea {
          font-family: "Cormorant Garamond", serif;
        }
      `}</style>

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_14%_6%,rgba(31,61,51,0.06),transparent_32%),radial-gradient(circle_at_88%_14%,rgba(184,145,47,0.10),transparent_30%),linear-gradient(180deg,#fffdf7_0%,#faf6ec_45%,#f2e8d2_100%)]" />
      <div className="pointer-events-none absolute left-1/2 top-4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full border border-[#1f3d33]/[0.06]" />
      <div className="pointer-events-none absolute left-1/2 top-20 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full border border-[#b8912f]/[0.14]" />
      <div className="pointer-events-none absolute -left-24 top-56 h-64 w-64 rounded-full bg-[#1f3d33]/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-96 h-72 w-72 rounded-full bg-[#b8912f]/[0.10] blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-[#b8912f]/25 pb-5 font-body text-[0.72rem] font-semibold uppercase tracking-[0.34em] text-[#6f6151]">
          <span>Vjenčanje</span>
          <span className="mx-5 h-px flex-1 bg-gradient-to-r from-transparent via-[#b8912f]/50 to-transparent" />
          <span>04 . 07 . 2026</span>
        </header>

        <section className="flex flex-1 flex-col items-center pt-10 text-center sm:pt-14 lg:pt-16">
          {/* Wax seal monogram — signature element */}
          <div className="reveal reveal-1 mx-auto mb-6">
            <svg width="108" height="108" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="54" cy="54" r="50" stroke="#b8912f" strokeWidth="1.4" opacity="0.85" />
              <circle cx="54" cy="54" r="43" stroke="#b8912f" strokeWidth="0.7" opacity="0.55" />
              <text
                x="54"
                y="63"
                textAnchor="middle"
                fontFamily="Playfair Display, serif"
                fontStyle="italic"
                fontWeight="600"
                fontSize="30"
                fill="#1f3d33"
              >
                A&amp;Z
              </text>
            </svg>
          </div>

          {/* Laurel wreath framing the names */}
          <div className="reveal reveal-2 relative mx-auto flex w-full max-w-3xl items-center justify-center">
            <svg
              className="hidden sm:block"
              width="140"
              height="60"
              viewBox="0 0 140 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d="M130 8C95 8 55 20 20 46" stroke="#b8912f" strokeWidth="1.1" opacity="0.8" />
              {[
                [118, 11, 18], [104, 15, 32], [90, 20, 46], [76, 26, 58],
                [62, 32, 68], [48, 38, 78], [34, 42, 86],
              ].map(([x, y, rot], i) => (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx="7"
                  ry="3.1"
                  fill="#1f3d33"
                  opacity={0.55 + i * 0.02}
                  transform={`rotate(${rot} ${x} ${y})`}
                />
              ))}
            </svg>

            <div className="px-2 sm:px-6">
              <p className="font-body text-xs font-semibold uppercase tracking-[0.5em] text-[#b8912f]">
                Vjenčanje
              </p>
              <h1 className="font-display mt-4 text-6xl italic leading-none text-[#142821] sm:text-7xl lg:text-8xl">
                Adna <span className="text-[#b8912f]">&amp;</span> Zijad
              </h1>
            </div>

            <svg
              className="hidden sm:block"
              width="140"
              height="60"
              viewBox="0 0 140 60"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              style={{ transform: "scaleX(-1)" }}
            >
              <path d="M130 8C95 8 55 20 20 46" stroke="#b8912f" strokeWidth="1.1" opacity="0.8" />
              {[
                [118, 11, 18], [104, 15, 32], [90, 20, 46], [76, 26, 58],
                [62, 32, 68], [48, 38, 78], [34, 42, 86],
              ].map(([x, y, rot], i) => (
                <ellipse
                  key={i}
                  cx={x}
                  cy={y}
                  rx="7"
                  ry="3.1"
                  fill="#1f3d33"
                  opacity={0.55 + i * 0.02}
                  transform={`rotate(${rot} ${x} ${y})`}
                />
              ))}
            </svg>
          </div>

          <div className="reveal reveal-2 mx-auto mt-6 h-px w-40 bg-gradient-to-r from-transparent via-[#b8912f] to-transparent" />

          <p className="font-body reveal reveal-3 mx-auto mt-7 max-w-2xl text-xl italic leading-8 text-[#3f3529] sm:text-2xl">
            Hvala što ste dio našeg posebnog dana
          </p>
          <p className="font-body reveal reveal-3 mx-auto mt-4 max-w-2xl text-base leading-8 text-[#5c4f3f] sm:text-lg">
            Podijelite s nama fotografije, video zapise i najljepše trenutke
            koje ste zabilježili.
          </p>
          <p className="font-body reveal reveal-3 mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#6f6151] sm:text-base">
            Skenirali ste QR kod? Upišite svoje ime, ostavite posvetu i
            dodajte fotografije ili video zapise koje želite podijeliti s
            nama.
          </p>

          {/* Invitation card */}
          <section className="reveal reveal-4 mt-11 w-full max-w-2xl sm:mt-14 lg:mt-16">
            <div className="invite-card relative rounded-md bg-[var(--card)] px-6 py-9 sm:px-10 sm:py-11">
              <svg className="corner corner-tl" viewBox="0 0 30 30" fill="none">
                <path d="M2 2C10 2 20 8 20 20" stroke="#b8912f" strokeWidth="1" />
                <circle cx="2" cy="2" r="2" fill="#b8912f" />
              </svg>
              <svg className="corner corner-tr" viewBox="0 0 30 30" fill="none">
                <path d="M2 2C10 2 20 8 20 20" stroke="#b8912f" strokeWidth="1" />
                <circle cx="2" cy="2" r="2" fill="#b8912f" />
              </svg>
              <svg className="corner corner-bl" viewBox="0 0 30 30" fill="none">
                <path d="M2 2C10 2 20 8 20 20" stroke="#b8912f" strokeWidth="1" />
                <circle cx="2" cy="2" r="2" fill="#b8912f" />
              </svg>
              <svg className="corner corner-br" viewBox="0 0 30 30" fill="none">
                <path d="M2 2C10 2 20 8 20 20" stroke="#b8912f" strokeWidth="1" />
                <circle cx="2" cy="2" r="2" fill="#b8912f" />
              </svg>

              <div className="mx-auto mb-8 max-w-md text-center">
                <p className="font-body text-[0.7rem] font-bold uppercase tracking-[0.4em] text-[#b8912f]">
                  Knjiga uspomena
                </p>
                <h2 className="font-display mt-3 text-3xl italic text-[#142821]">
                  Podijelite uspomene
                </h2>
                <p className="font-body mt-3 text-base leading-7 text-[#5c4f3f] sm:text-lg">
                  Upišite ime, ostavite posvetu i dodajte fotografije ili
                  video zapise.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="font-body mb-2 block text-sm font-semibold uppercase tracking-wide text-[#3f3529]">
                    Ime
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Vaše ime"
                    className="w-full rounded-md border border-[#b8912f]/35 bg-[var(--ivory)] px-4 py-3.5 text-[#2b2620] shadow-sm outline-none transition placeholder:text-[#a99b8c] focus:border-[#b8912f] focus:ring-4 focus:ring-[#b8912f]/15"
                  />
                </div>

                <div>
                  <label className="font-body mb-2 block text-sm font-semibold uppercase tracking-wide text-[#3f3529]">
                    Posveta / poruka
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Napišite poruku mladencima..."
                    className="w-full resize-y rounded-md border border-[#b8912f]/35 bg-[var(--ivory)] px-4 py-3.5 text-[#2b2620] shadow-sm outline-none transition placeholder:text-[#a99b8c] focus:border-[#b8912f] focus:ring-4 focus:ring-[#b8912f]/15"
                  />
                </div>

                <div>
                  <label className="font-body mb-2 block text-sm font-semibold uppercase tracking-wide text-[#3f3529]">
                    Fotografije ili video
                  </label>
                  <div className="rounded-md border border-dashed border-[#b8912f]/60 bg-[var(--ivory)]/70 p-4">
                    <input
                      name="files"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="w-full cursor-pointer rounded-md bg-white/70 px-3 py-3 text-sm text-[#5c493b] file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-[#142821] file:to-[#1f3d33] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#f5eeda] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#b8912f]/15"
                    />
                    <p className="font-body mt-3 text-sm leading-6 text-[#6f6151]">
                      Možete dodati više fotografija ili video zapisa
                      odjednom.
                    </p>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="group w-full rounded-md bg-gradient-to-r from-[#142821] via-[#1f3d33] to-[#2a5142] px-5 py-4 font-body text-base font-semibold uppercase tracking-wide text-[#f5eeda] shadow-lg shadow-[#142821]/20 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#1f3d33]/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? "Uspomene se šalju..." : "Pošalji uspomene"}
                    <span className="h-px w-6 bg-[#b8912f] transition group-hover:w-9" />
                  </span>
                </button>
              </form>

              {status && (
                <p
                  className={`font-body mt-5 rounded-md border px-4 py-3 text-center text-sm font-semibold leading-6 ${
                    statusType === "success"
                      ? "border-[#1f3d33]/25 bg-[#eaf1ec] text-[#1f3d33]"
                      : "border-[#a5453a]/30 bg-[#fbecea] text-[#8a3a32]"
                  }`}
                >
                  {status}
                </p>
              )}
            </div>
          </section>

          <section className="reveal reveal-5 mx-auto mt-11 max-w-xl pb-8 text-center sm:mt-12">
            <div className="mx-auto mb-5 h-px w-28 bg-gradient-to-r from-transparent via-[#b8912f] to-transparent" />
            <p className="font-body text-base italic leading-7 text-[#5c4f3f] sm:text-lg">
              Svaka fotografija i svaka poruka ostaje kao dio naše zajedničke
              uspomene.
            </p>
          </section>
        </section>

        <footer className="reveal reveal-5 flex items-center justify-center gap-3 border-t border-[#b8912f]/25 py-6 font-body text-sm text-[#6f6151]">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#b8912f" strokeWidth="0.8" />
            <text x="9" y="12.5" textAnchor="middle" fontFamily="Playfair Display, serif" fontStyle="italic" fontSize="8" fill="#b8912f">
              AZ
            </text>
          </svg>
          <span>S ljubavlju, Adna i Zijad</span>
        </footer>
      </div>
    </main>
  );
}