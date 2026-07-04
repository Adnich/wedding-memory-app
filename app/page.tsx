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
    <main className="wedding-root relative min-h-screen overflow-hidden bg-[#fbf6ec] text-[#2b241d]">
      <style jsx global>{`
        .wedding-root {
          --ivory: #fbf6ec;
          --paper: #fffaf0;
          --sage: #7d8b62;
          --forest: #1f3a31;
          --gold: #b88a38;
          --gold-soft: #e8d2a3;
          --rose: #d7a09b;
          --ink: #2b241d;
          font-family: Georgia, "Times New Roman", serif;
        }

        .wedding-root .font-script {
          font-family: "Brush Script MT", "Segoe Script", Georgia, serif;
        }

        .wedding-root .opening-scene {
          animation: scene-rise 900ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .wedding-root .phone-frame {
          animation: phone-float 5.5s ease-in-out infinite;
          transform-origin: center;
        }

        .wedding-root .seal {
          animation: seal-release 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          transform-origin: center;
        }

        .wedding-root .invite-cover {
          animation: cover-open 4.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          transform-origin: top center;
        }

        .wedding-root .invite-content {
          animation: content-reveal 4.8s ease-in-out infinite;
        }

        .wedding-root .leaf {
          animation: leaf-sway 6.5s ease-in-out infinite;
          transform-origin: bottom center;
        }

        .wedding-root .leaf:nth-child(2n) {
          animation-delay: -2.2s;
        }

        .wedding-root .fade-up {
          opacity: 0;
          transform: translateY(16px);
          animation: fade-up 900ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .wedding-root .delay-1 { animation-delay: 180ms; }
        .wedding-root .delay-2 { animation-delay: 360ms; }
        .wedding-root .delay-3 { animation-delay: 540ms; }
        .wedding-root .delay-4 { animation-delay: 720ms; }

        @keyframes scene-rise {
          from {
            opacity: 0;
            transform: translateY(22px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes phone-float {
          0%, 100% { transform: rotate(-4deg) translateY(0); }
          50% { transform: rotate(-2deg) translateY(-10px); }
        }

        @keyframes seal-release {
          0%, 22% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          38%, 74% {
            opacity: 0;
            transform: translateY(-34px) scale(0.82);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes cover-open {
          0%, 24% {
            transform: translateY(0) scaleY(1);
            opacity: 1;
          }
          45%, 74% {
            transform: translateY(-88%) scaleY(0.18);
            opacity: 0.18;
          }
          100% {
            transform: translateY(0) scaleY(1);
            opacity: 1;
          }
        }

        @keyframes content-reveal {
          0%, 28% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          48%, 76% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
        }

        @keyframes leaf-sway {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(5deg); }
        }

        @keyframes fade-up {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .wedding-root *,
          .wedding-root *::before,
          .wedding-root *::after {
            animation-duration: 1ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_6%,rgba(125,139,98,0.22),transparent_28%),radial-gradient(circle_at_86%_16%,rgba(184,138,56,0.18),transparent_30%),linear-gradient(180deg,#fffdf8_0%,#fbf6ec_48%,#efe1cc_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-[#7d8b62]/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-80 h-80 w-80 rounded-full bg-[#d7a09b]/20 blur-3xl" />
      <div className="pointer-events-none absolute left-1/2 top-10 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full border border-[#b88a38]/15" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="fade-up flex items-center justify-between border-b border-[#c9a766]/30 pb-5 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#76634e]">
          <span>Vjenčanje</span>
          <span className="mx-5 h-px flex-1 bg-gradient-to-r from-transparent via-[#b88a38]/55 to-transparent" />
          <span>Adna & Zijad</span>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12 lg:py-12">
          <div className="order-2 text-center lg:order-1 lg:text-left">
            <p className="fade-up delay-1 text-xs font-semibold uppercase tracking-[0.45em] text-[#9b762f]">
              Digitalna pozivnica uspomena
            </p>
            <h1 className="fade-up delay-2 mt-5 text-6xl font-semibold italic leading-none text-[#1f3a31] sm:text-7xl lg:text-8xl">
              Adna <span className="text-[#b88a38]">&</span> Zijad
            </h1>
            <div className="fade-up delay-2 mx-auto mt-6 h-px w-36 bg-gradient-to-r from-transparent via-[#b88a38] to-transparent lg:mx-0" />
            <p className="fade-up delay-3 mt-7 text-2xl italic leading-9 text-[#3b3128]">
              Hvala što ste dio našeg posebnog dana
            </p>
            <p className="fade-up delay-3 mx-auto mt-4 max-w-xl text-base leading-8 text-[#6d5c49] lg:mx-0">
              Podijelite s nama fotografije, video zapise i najljepše trenutke
              koje ste zabilježili.
            </p>
            <p className="fade-up delay-4 mx-auto mt-5 max-w-xl text-sm leading-7 text-[#7d6b57] lg:mx-0">
              Skenirali ste QR kod? Upišite svoje ime, ostavite posvetu i
              dodajte fotografije ili video zapise koje želite podijeliti s
              nama.
            </p>
          </div>

          <div className="opening-scene order-1 mx-auto w-full max-w-sm lg:order-2 lg:max-w-md">
            <div className="relative min-h-[470px] sm:min-h-[540px]">
              <div className="leaf absolute left-1 top-8 h-48 w-24 rounded-full bg-[#7d8b62]/25 blur-sm [clip-path:ellipse(34%_49%_at_50%_50%)]" />
              <div className="leaf absolute right-0 top-20 h-56 w-28 rounded-full bg-[#426854]/20 blur-sm [clip-path:ellipse(34%_49%_at_50%_50%)]" />
              <div className="leaf absolute -left-5 bottom-20 h-44 w-24 rounded-full bg-[#9daa75]/22 blur-sm [clip-path:ellipse(34%_49%_at_50%_50%)]" />

              <div className="phone-frame absolute left-1/2 top-6 w-[255px] -translate-x-1/2 rounded-[2.2rem] bg-[#1f1c1a] p-3 shadow-2xl shadow-[#3c2c18]/30 sm:w-[295px]">
                <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#f9f0dc]">
                  <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-[#111]" />
                  <div className="relative h-[430px] bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.55),transparent_24%),linear-gradient(145deg,#dde5c8_0%,#eef0dc_42%,#f6c9c8_100%)] sm:h-[500px]">
                    <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(#7d8b62_1px,transparent_1px)] [background-size:18px_18px]" />
                    <div className="invite-content absolute inset-x-5 top-20 rounded-t-[1.4rem] border border-white/60 bg-white/55 px-5 pb-8 pt-10 text-center shadow-xl shadow-[#6b4b2a]/10 backdrop-blur">
                      <p className="text-[0.62rem] uppercase tracking-[0.35em] text-[#9b762f]">
                        Wedding memories
                      </p>
                      <p className="font-script mt-5 text-4xl leading-none text-[#1f3a31]">
                        Adna & Zijad
                      </p>
                      <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-[#b88a38] to-transparent" />
                      <p className="mt-5 text-sm italic leading-6 text-[#5d4d3b]">
                        Podijelite s nama trenutke koje želite sačuvati.
                      </p>
                    </div>

                    <div className="invite-cover absolute inset-x-5 top-20 rounded-t-[1.4rem] border border-[#b88a38]/35 bg-[linear-gradient(135deg,rgba(126,142,98,0.35),rgba(247,244,220,0.95)),radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.75),transparent_24%)] px-5 py-16 text-center shadow-xl shadow-[#4d3b22]/15">
                      <p className="font-script text-3xl text-[#1f3a31]">
                        You are invited
                      </p>
                      <div className="mx-auto mt-5 h-px w-24 bg-gradient-to-r from-transparent via-[#b88a38] to-transparent" />
                      <p className="mt-5 text-xs uppercase tracking-[0.22em] text-[#7a633b]">
                        Adna & Zijad
                      </p>
                    </div>

                    <div className="seal absolute left-1/2 top-28 z-30 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#f48b84,#b93130_62%,#7f1f21)] text-[#ffd9c9] shadow-xl shadow-[#802322]/30 ring-4 ring-[#f0b1a7]/45">
                      <span className="font-script text-2xl">A&Z</span>
                    </div>

                    <div className="absolute bottom-4 left-1/2 flex w-[82%] -translate-x-1/2 items-center justify-between rounded-full bg-white/55 px-4 py-2 text-[0.62rem] text-[#7a6a59] backdrop-blur">
                      <span>memories.adna-zijad.ba</span>
                      <span>♡</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-1/2 w-[86%] -translate-x-1/2 rounded-full bg-[#4a321d]/20 blur-2xl h-10" />
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-2xl pb-12">
          <div className="rounded-[2rem] border border-[#c9a766]/55 bg-white/55 p-2 shadow-2xl shadow-[#5d3f1e]/15 backdrop-blur-xl">
            <div className="rounded-[1.55rem] border border-white/80 bg-[#fffaf0]/95 px-5 py-7 shadow-inner shadow-[#ead6ad] sm:px-8 sm:py-9">
              <div className="mx-auto mb-7 max-w-md text-center">
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.36em] text-[#b88a38]">
                  Knjiga uspomena
                </p>
                <h2 className="mt-3 text-3xl font-semibold italic text-[#1f3a31]">
                  Podijelite uspomene
                </h2>
                <p className="mt-3 text-base leading-7 text-[#6d5c49]">
                  Upišite ime, ostavite posvetu i dodajte fotografije ili video
                  zapise.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-left">
                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#47382b]">
                    Ime
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Vaše ime"
                    className="w-full rounded-2xl border border-[#dec99d] bg-white px-4 py-3.5 text-[#2b241d] shadow-sm outline-none transition placeholder:text-[#a89986] focus:border-[#b88a38] focus:ring-4 focus:ring-[#b88a38]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#47382b]">
                    Posveta / poruka
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Napišite poruku mladencima..."
                    className="w-full resize-y rounded-2xl border border-[#dec99d] bg-white px-4 py-3.5 text-[#2b241d] shadow-sm outline-none transition placeholder:text-[#a89986] focus:border-[#b88a38] focus:ring-4 focus:ring-[#b88a38]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-[#47382b]">
                    Fotografije ili video
                  </label>
                  <div className="rounded-3xl border border-dashed border-[#b88a38]/60 bg-gradient-to-br from-[#fff8ec] to-white p-4 shadow-sm">
                    <input
                      name="files"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="w-full cursor-pointer rounded-2xl bg-white/80 px-3 py-3 text-sm text-[#5c493b] file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-gradient-to-r file:from-[#1f3a31] file:to-[#315f4f] file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-[#fff8ec] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#b88a38]/15"
                    />
                    <p className="mt-3 text-sm leading-6 text-[#76634e]">
                      Možete dodati više fotografija ili video zapisa odjednom.
                    </p>
                  </div>
                </div>

                <button
                  disabled={loading}
                  className="group w-full rounded-2xl bg-gradient-to-r from-[#1f3a31] via-[#315f4f] to-[#b88a38] px-5 py-4 text-base font-semibold text-[#fff8ec] shadow-xl shadow-[#1f3a31]/20 transition hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-[#8b672c]/25 disabled:cursor-not-allowed disabled:opacity-60"
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

          <div className="mx-auto mt-10 max-w-xl text-center">
            <div className="mx-auto mb-5 h-px w-28 bg-gradient-to-r from-transparent via-[#b88a38] to-transparent" />
            <p className="text-base italic leading-7 text-[#6d5c49]">
              Svaka fotografija i svaka poruka ostaje kao dio naše zajedničke
              uspomene.
            </p>
          </div>
        </section>

        <footer className="border-t border-[#c9a766]/30 py-6 text-center text-sm font-medium text-[#76634e]">
          S ljubavlju, Adna i Zijad ♡
        </footer>
      </div>
    </main>
  );
}
