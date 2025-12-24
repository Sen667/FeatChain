"use client";

import Image from "next/image";

export default function Page() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        {/* Mets ta vidéo dans /public/videos/intro.mp4 (ou change le chemin) */}
        <source src="/bgvid.mp4" type="video/mp4" />
      </video>

      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Top-left logo */}
      <header className="relative z-10 flex items-start justify-start p-6">
        {/* Mets ton logo dans /public/logo.svg (ou change le src) */}
        <Image
          src="/logomini.png"
          alt="Logo"
          width={44}
          height={44}
          className="h-11 w-11 select-none"
          priority
        />
      </header>

      {/* Center content */}
      <section className="relative z-10 flex min-h-[calc(100vh-96px)] w-full items-center justify-center px-6">
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          {/* Center logo */}
          <Image
            src="/logofinal.png"
            alt="Logo central"
            width={140}
            height={140}
            className="h-28 w-28 select-none"
            priority
          />

          {/* Description */}
          <p className="mt-6 text-balance text-base leading-relaxed text-white/85 md:text-lg">
            Une courte description ici. Quelques mots pour poser l’ambiance et
            donner envie de cliquer.
          </p>

          {/* Buttons */}
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              className="w-full rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.99] sm:w-auto"
              type="button"
            >
              Jouer
            </button>

            <button
              className="w-full rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 active:scale-[0.99] sm:w-auto"
              type="button"
            >
              Inviter des amis
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
