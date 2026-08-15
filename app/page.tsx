"use client";

import { useState } from "react";

const maxVideoUploadSize = 25 * 1024 * 1024;

type FailedFile = {
  fileName: string;
  fileSize: string;
  fileType: string;
  reason: string;
};

type UploadFile = {
  file: File;
  originalName: string;
  originalSize: string;
  originalType: string;
  position: number;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Došlo je do greške.";
}

function getFileSize(file: File) {
  if (file.size < 1024 * 1024) {
    return `${Math.max(1, Math.round(file.size / 1024))} KB`;
  }

  return `${(file.size / 1024 / 1024).toFixed(1)} MB`;
}

function createFailedFile(file: File, reason: string): FailedFile {
  return {
    fileName: file.name,
    fileSize: getFileSize(file),
    fileType: file.type || "unknown",
    reason,
  };
}

function formatFailedFiles(failedFiles: FailedFile[]) {
  const visibleFiles = failedFiles.slice(0, 6);
  const hiddenCount = failedFiles.length - visibleFiles.length;
  const lines = visibleFiles.map(
    (file) =>
      `- ${file.fileName} (${file.fileSize}, ${file.fileType}): ${file.reason}`
  );

  if (hiddenCount > 0) {
    lines.push(`- Još ${hiddenCount} fajlova nije prošlo.`);
  }

  return lines.join("\n");
}

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [opened, setOpened] = useState(false);
  const [selectedFileCount, setSelectedFileCount] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = String(formData.get("name") || "");
    const message = String(formData.get("message") || "");
    const files = formData
      .getAll("files")
      .filter((file): file is File => file instanceof File && file.size > 0);

    setLoading(true);
    setStatus("");
    setStatusType("");

    try {
      const backendUrl = process.env.NEXT_PUBLIC_UPLOAD_API_URL;

      if (!backendUrl) {
        throw new Error("Backend URL nije podešen.");
      }

      if (files.length === 0) {
        throw new Error("Dodajte barem jednu sliku ili video.");
      }

      setStatus("Pripremamo fajlove...");
      setStatusType("success");

      const uploadFiles: UploadFile[] = [];
      const failedFiles: FailedFile[] = [];
      let successfulUploads = 0;

      for (const [index, file] of files.entries()) {
        console.log("Original file", {
          name: file.name,
          size: getFileSize(file),
          type: file.type || "unknown",
        });

        if (file.type.startsWith("video/") && file.size > maxVideoUploadSize) {
          failedFiles.push(createFailedFile(file, "Video je veći od 25 MB"));
          continue;
        }

        uploadFiles.push({
          file,
          originalName: file.name,
          originalSize: getFileSize(file),
          originalType: file.type || "unknown",
          position: index + 1,
        });
      }

      for (const uploadFile of uploadFiles) {
        setStatus(
          `Šalje se ${uploadFile.position}/${files.length}: ${uploadFile.file.name}`
        );
        setStatusType("success");

        const batchFormData = new FormData();
        batchFormData.append("name", name);
        batchFormData.append("message", message);
        batchFormData.append("files", uploadFile.file, uploadFile.file.name);

        try {
          const res = await fetch(`${backendUrl}/upload`, {
            method: "POST",
            body: batchFormData,
          });

          const responseBody = await res.text();

          console.log("Backend upload response", {
            fileName: uploadFile.originalName,
            processedFileName: uploadFile.file.name,
            status: res.status,
            ok: res.ok,
            body: responseBody,
          });

          if (!res.ok) {
            let backendMessage = responseBody || res.statusText || "Upload nije uspio.";

            try {
              const data = JSON.parse(responseBody) as {
                error?: string;
                details?: string;
              };
              backendMessage =
                [data.error, data.details].filter(Boolean).join(" - ") ||
                backendMessage;
            } catch {
              backendMessage = responseBody || res.statusText || backendMessage;
            }

            failedFiles.push({
              fileName: uploadFile.originalName,
              fileSize: uploadFile.originalSize,
              fileType: uploadFile.originalType,
              reason: `Backend error ${res.status}: ${backendMessage}`,
            });

            console.error("Backend upload failed", {
              fileName: uploadFile.originalName,
              processedFileName: uploadFile.file.name,
              status: res.status,
              body: responseBody,
            });
            continue;
          }

          successfulUploads += 1;
        } catch (error: unknown) {
          const reason = `Upload request nije uspio: ${getErrorMessage(error)}`;

          failedFiles.push({
            fileName: uploadFile.originalName,
            fileSize: uploadFile.originalSize,
            fileType: uploadFile.originalType,
            reason,
          });

          console.error("Upload request failed", {
            fileName: uploadFile.originalName,
            processedFileName: uploadFile.file.name,
            originalSize: uploadFile.originalSize,
            originalType: uploadFile.originalType,
            error,
          });
        }
      }

      if (successfulUploads > 0) {
        form.reset();
        setSelectedFileCount(0);
      }

      if (failedFiles.length === 0) {
        setStatus("Hvala vam! Vaše uspomene su uspješno poslane.");
        setStatusType("success");
        return;
      }

      if (successfulUploads > 0) {
        setStatus(
          `Poslano je ${successfulUploads} od ${files.length} fajlova.\nNisu prošli:\n${formatFailedFiles(
            failedFiles
          )}\nPokušajte njih poslati posebno.`
        );
        setStatusType("error");
        return;
      }

      setStatus(
        `Nijedan fajl nije poslan. Pokušajte sa manjim fotografijama ili bez velikih video zapisa.\nNisu prošli:\n${formatFailedFiles(
          failedFiles
        )}`
      );
      setStatusType("error");
    } catch (error: unknown) {
      setStatus(getErrorMessage(error));
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="invite-root min-h-screen overflow-x-hidden bg-[#eef3ec] text-[#19382e]">
      <style jsx global>{`
        .invite-root {
          --gold: #315f4f;
          --gold-soft: #dbe8de;
          --ink: #19382e;
          --muted: #5f7167;
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
          width: min(100%, 430px);
          min-height: 860px;
          max-height: none;
          aspect-ratio: auto;
          border-radius: 1.75rem;
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

        .invite-root .memory-card::before,
        .invite-root .memory-card::after {
          content: "";
          position: absolute;
          pointer-events: none;
          opacity: 0.55;
          filter: blur(0.1px);
        }

        .invite-root .memory-card::before {
          left: -14px;
          top: -16px;
          width: 150px;
          height: 120px;
          background:
            radial-gradient(ellipse at 34% 46%, rgba(221, 180, 165, 0.34) 0 22%, transparent 23%),
            radial-gradient(ellipse at 48% 28%, rgba(221, 180, 165, 0.24) 0 18%, transparent 19%),
            radial-gradient(ellipse at 62% 52%, rgba(221, 180, 165, 0.22) 0 16%, transparent 17%),
            linear-gradient(128deg, rgba(183, 137, 55, 0.18), transparent 58%);
          border-top-left-radius: 1.7rem;
        }

        .invite-root .memory-card::after {
          right: -20px;
          top: -12px;
          width: 145px;
          height: 130px;
          background:
            radial-gradient(ellipse at 60% 36%, rgba(183, 137, 55, 0.16) 0 18%, transparent 19%),
            radial-gradient(ellipse at 42% 62%, rgba(216, 170, 162, 0.2) 0 15%, transparent 16%),
            linear-gradient(218deg, rgba(183, 137, 55, 0.16), transparent 60%);
          border-top-right-radius: 1.7rem;
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

      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(112,137,111,0.22),transparent_30%),radial-gradient(circle_at_82%_14%,rgba(49,95,79,0.16),transparent_30%),linear-gradient(180deg,#ffffff_0%,#eef3ec_56%,#dfe9de_100%)]" />
      <div className="pointer-events-none fixed -left-24 top-10 h-72 w-72 rounded-full bg-[#9fb59d]/25 blur-3xl" />
      <div className="pointer-events-none fixed -right-24 bottom-10 h-80 w-80 rounded-full bg-[#315f4f]/15 blur-3xl" />

      <section
        className={`relative mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-2 py-2 sm:px-6 sm:py-6 ${
          opened ? "opened items-start sm:items-center" : ""
        }`}
      >
        <div className="invitation-frame relative overflow-hidden rounded-[1.7rem] border border-white/85 bg-white shadow-2xl shadow-[#19382e]/15">
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="cover-button absolute inset-0 z-30 block h-full w-full cursor-pointer overflow-hidden focus:outline-none focus:ring-4 focus:ring-[#315f4f]/25"
            aria-label="Otvori digitalnu kovertu"
          >
            <img
              src="/envelope-cover.png"
              alt="Digitalna koverta sa zlatnim žigom Z A"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </button>

          <div className="letter-content relative z-10 p-3 sm:p-4">
            <div className="memory-card relative mx-auto max-w-[390px] overflow-hidden rounded-[1.65rem] border border-[#b9cbb9] bg-white/96 px-5 py-7 shadow-[0_18px_55px_rgba(25,56,46,0.16),inset_0_0_0_1px_rgba(255,255,255,0.9)] sm:px-6">
              <div className="relative z-10 text-center">
                <div className="mx-auto flex h-[76px] w-[58px] items-center justify-center rounded-full border border-[#9fb59d] bg-white/85 shadow-lg shadow-[#315f4f]/10">
                  <div className="flex h-[62px] w-[46px] items-center justify-center rounded-full border border-[#c7d6c5] text-[#315f4f]">
                    <span className="script text-2xl italic leading-none">
                      Z
                      <span className="-ml-1 text-xl">A</span>
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-[0.65rem] font-bold uppercase tracking-[0.34em] text-[#315f4f]">
                  Adna & Zijad
                </p>
                <div className="mx-auto mt-2 h-px w-24 bg-gradient-to-r from-transparent via-[#8fa78c] to-transparent" />
                <h1 className="mt-4 text-3xl font-semibold leading-tight text-[#19382e] sm:text-4xl">
                  Podijelite uspomene
                </h1>
                <p className="mx-auto mt-4 max-w-[285px] text-center text-sm leading-6 text-[#5f7167]">
                  Skenirali ste QR kod? Upišite svoje ime, ostavite posvetu i
                  dodajte fotografije ili video zapise koje želite podijeliti s
                  nama.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="relative z-10 mt-7 space-y-5 text-left"
              >
                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#315f4f]">
                    <span className="text-[#6f8d6a]" aria-hidden="true">
                      ♙
                    </span>
                    Ime
                  </label>
                  <input
                    name="name"
                    required
                    placeholder="Vaše ime"
                    className="w-full rounded-lg border border-[#b9cbb9] bg-white/95 px-4 py-3 text-sm text-[#19382e] shadow-[0_7px_18px_rgba(25,56,46,0.08)] outline-none transition placeholder:text-[#9aa99f] focus:border-[#315f4f] focus:ring-4 focus:ring-[#315f4f]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#315f4f]">
                    <span className="text-[#6f8d6a]" aria-hidden="true">
                      ♡
                    </span>
                    Posveta / poruka
                  </label>
                  <textarea
                    name="message"
                    rows={5}
                    placeholder="Napišite poruku mladencima..."
                    className="w-full resize-y rounded-lg border border-[#b9cbb9] bg-white/95 px-4 py-3 text-sm text-[#19382e] shadow-[0_7px_18px_rgba(25,56,46,0.08)] outline-none transition placeholder:text-[#9aa99f] focus:border-[#315f4f] focus:ring-4 focus:ring-[#315f4f]/15"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#315f4f]">
                    <span className="text-[#6f8d6a]" aria-hidden="true">
                      ▧
                    </span>
                    Fotografije ili video
                  </label>

                  <label className="group block cursor-pointer rounded-2xl border border-dashed border-[#9fb59d] bg-[#f5faf4]/80 p-4 transition hover:border-[#315f4f] hover:bg-white">
                    <input
                      name="files"
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      className="sr-only"
                      onChange={(event) =>
                        setSelectedFileCount(event.target.files?.length ?? 0)
                      }
                    />
                    <span className="flex items-center gap-4">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#dfeadd] text-[#315f4f] shadow-inner">
                        <svg
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M12 16V7m0 0 3.5 3.5M12 7l-3.5 3.5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.2 18.5H17a4 4 0 0 0 .7-7.94A5.5 5.5 0 0 0 7.08 8.8 4.86 4.86 0 0 0 7.2 18.5Z"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span>
                        <span className="block text-sm font-bold text-[#19382e]">
                          {selectedFileCount > 0
                            ? `Dodali ste ${selectedFileCount} slika`
                            : "Dodajte fotografije ili video zapise"}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[#5f7167]">
                          Kliknite za pregled ili povucite datoteke ovdje
                        </span>
                        <span className="mt-3 flex flex-wrap gap-2 text-[0.62rem] font-semibold uppercase tracking-wide text-[#315f4f]">
                          <span className="rounded-full bg-white px-2 py-1">
                            JPG, PNG, HEIC
                          </span>
                          <span className="rounded-full bg-white px-2 py-1">
                            MP4, MOV
                          </span>
                          <span className="rounded-full bg-white px-2 py-1">
                            Do 1GB
                          </span>
                        </span>
                      </span>
                    </span>
                  </label>

                  <p className="mt-3 text-center text-xs leading-5 text-[#5f7167]">
                    Možete dodati više fotografija ili video zapisa odjednom.
                  </p>
                </div>

                <button
                  disabled={loading}
                  className="group w-full rounded-xl border border-[#9fb59d] bg-gradient-to-r from-[#19382e] via-[#315f4f] to-[#6f8d6a] px-5 py-4 text-base font-bold text-white shadow-[0_10px_24px_rgba(25,56,46,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(25,56,46,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex items-center justify-center gap-3">
                    <span aria-hidden="true">♡</span>
                    {loading ? "Uspomene se šalju..." : "Pošalji uspomene"}
                    <span className="transition group-hover:translate-x-1" aria-hidden="true">
                      
                    </span>
                  </span>
                </button>
              </form>

              {status && (
                <p
                  className={`relative z-10 mt-5 rounded-2xl border px-4 py-3 text-center text-sm font-semibold leading-6 ${
                    statusType === "success"
                      ? "border-[#b8d7bd] bg-[#f4fbf1] text-[#315f3b]"
                      : "border-[#e7b9b1] bg-[#fff3f1] text-[#8a3a32]"
                  } whitespace-pre-line`}
                >
                  {status}
                </p>
              )}

              <div className="relative z-10 mx-auto mt-8 flex w-32 items-center justify-center gap-2 text-[#6f8d6a]">
                <span className="h-px flex-1 bg-[#b9cbb9]" />
                <span className="text-sm">♥</span>
                <span className="h-px flex-1 bg-[#b9cbb9]" />
              </div>
              <p className="relative z-10 mx-auto mt-4 max-w-[260px] text-center text-xs italic leading-5 text-[#5f7167]">
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
