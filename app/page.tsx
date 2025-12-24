"use client";

import Image from "next/image";
<<<<<<< Updated upstream
import Link from "next/link";
=======
import Threads from "./components/Threads";
import { useEffect, useMemo, useState } from "react";

type Lang = "fr" | "en";
>>>>>>> Stashed changes

export default function Page() {
  const [lang, setLang] = useState<Lang>("fr");

  // Detect browser language once (optional but clean)
  useEffect(() => {
    const nav = typeof navigator !== "undefined" ? navigator.language : "fr";
    if (nav.toLowerCase().startsWith("en")) setLang("en");
  }, []);

  const t = useMemo(
    () => ({
      fr: {
        tagline:
          "Une chaîne née des collaborations musicales. Un seul lien brisé, et tout s’arrête.",
        play: "Jouer",
        invite: "Inviter des amis",
        howTo: "Comment jouer",
        rulesSubtitle:
          "Le principe est simple : enchaîne les collaborations musicales sans jamais rompre la chaîne.",
        rule1Title: "Artiste de départ",
        rule1Text: "Un artiste est choisi au hasard pour commencer la chaîne.",
        rule2Title: "Trouve le feat",
        rule2Text:
          "Tu as 30 secondes pour proposer un artiste ayant collaboré avec le précédent.",
        rule3Title: "Validation",
        rule3Text: "FeatChain vérifie automatiquement la collaboration via Spotify.",
        rule4Title: "Ne brise pas le lien",
        rule4Text: "Une erreur ou un temps écoulé, et la chaîne s’arrête.",
        aboutTitle: "À propos de FeatChain",
        aboutP1:
          "FeatChain est un jeu de rapidité et de culture musicale : tu relies des artistes uniquement grâce à leurs collaborations. Chaque bonne réponse prolonge la chaîne. Une erreur… et tout s’arrête.",
        aboutP2:
          "Les feats sont vérifiés automatiquement via Spotify pour garder un gameplay fair et instantané.",
        fast: "Rapide",
        reliable: "Fiable",
        competitive: "Compétitif",
        fastTitle: "30 secondes",
        fastText:
          "Un chrono qui met la pression juste comme il faut, sans casser le flow.",
        reliableTitle: "Vérifié grâce à Spotify",
        reliableText:
          "Pas de débats : si le titre commun existe, la chaîne continue.",
        competitiveTitle: "Records & chaînes infinies",
        competitiveText:
          "Joue solo ou à plusieurs, vise la chaîne la plus longue et compare tes performances.",
        start: "Commencer une partie",
        nav: "Navigation",
        info: "Informations",
        legal: "Mentions légales",
        privacy: "Politique de confidentialité",
        data: "Données musicales via Spotify",
        footerDesc:
          "Le jeu de collaboration musicale où chaque feat crée un lien. Une erreur, et la chaîne s’arrête.",
        allRights: "Tous droits réservés.",
      },
      en: {
        tagline:
          "A chain born from musical collaborations. Break one link, and it’s over.",
        play: "Play",
        invite: "Invite friends",
        howTo: "How to play",
        rulesSubtitle:
          "Simple concept: chain collaborations and never break the link.",
        rule1Title: "Starting artist",
        rule1Text: "A random artist is selected to start the chain.",
        rule2Title: "Find the feat",
        rule2Text:
          "You have 30 seconds to name an artist who collaborated with the previous one.",
        rule3Title: "Validation",
        rule3Text: "FeatChain verifies the collaboration via Spotify.",
        rule4Title: "Don’t break the link",
        rule4Text: "One mistake or time runs out — the chain ends.",
        aboutTitle: "About FeatChain",
        aboutP1:
          "FeatChain is a fast-paced music knowledge game: connect artists only through collaborations. Each correct answer extends the chain. One mistake… and it’s over.",
        aboutP2:
          "Collaborations are checked via Spotify to keep gameplay fair and instant.",
        fast: "Fast",
        reliable: "Reliable",
        competitive: "Competitive",
        fastTitle: "30 seconds",
        fastText: "A timer that adds pressure without killing the vibe.",
        reliableTitle: "Verified with Spotify",
        reliableText: "No debate: if the shared track exists, the chain continues.",
        competitiveTitle: "Records & infinite chains",
        competitiveText:
          "Play solo or with friends, chase the longest chain and compare your results.",
        start: "Start a game",
        nav: "Navigation",
        info: "Info",
        legal: "Legal notice",
        privacy: "Privacy policy",
        data: "Music data via Spotify",
        footerDesc:
          "A music collaboration game where every feat creates a link. One mistake, and the chain ends.",
        allRights: "All rights reserved.",
      },
    }),
    []
  );

  const copy = t[lang];

  return (
    <main className="relative min-h-screen w-full bg-black text-white">
      {/* Background video */}
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/bgvid.mp4" type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-black/55" />

<<<<<<< Updated upstream
      {/* Top-left logo */}
      <header className="relative z-10 flex items-start justify-start p-6">
        <Image
          src="/logomini.png"
          alt="Logo"
          width={44}
          height={44}
          className="h-11 w-11 select-none"
          priority
        />
=======
      {/* Header */}
      <header className="relative z-10 p-6">
        <div className="relative flex items-center justify-center sm:justify-start">
          {/* Center on mobile, left on desktop */}
          <Image src="/logo.png" alt="Logo" width={56} height={56} priority />

          {/* Language switch (absolute, doesn't affect centering) */}
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-white/70 transition hover:border-[#32CC8C] hover:text-[#32CC8C]"
            aria-label="Toggle language"
            type="button"
          >
            {lang === "fr" ? "EN" : "FR"}
          </button>
        </div>
>>>>>>> Stashed changes
      </header>

      {/* Hero */}
      <section
        id="jouer"
        className="relative z-10 flex min-h-[calc(100vh-96px)] w-full items-center justify-center px-6"
      >
        <div className="flex w-full max-w-xl flex-col items-center text-center">
          <Image
            src="/logofinal.png"
            alt="Logo central"
            width={700}
            height={700}
            priority
            className="h-auto w-[320px] sm:w-[520px] md:w-[720px]"
          />

          <p className="mt-6 text-balance text-base leading-relaxed text-white/85 md:text-lg">
<<<<<<< Updated upstream
            Défiez vos amis dans une chaîne infinie de featurings ! 
            Trouvez les collaborations entre artistes et devenez le champion du Feat Chain ! 🎵
=======
            {copy.tagline}
>>>>>>> Stashed changes
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
<<<<<<< Updated upstream
            <Link
              href="/lobby"
              className="w-full rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90 active:scale-[0.99] sm:w-auto text-center"
            >
              Jouer en ligne
            </Link>

            <Link
              href="/game?mode=solo"
              className="w-full rounded-2xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 active:scale-[0.99] sm:w-auto text-center"
            >
              Mode solo
            </Link>
=======
            <button
              className="w-full cursor-pointer rounded-2xl bg-[#37AA7A] px-7 py-3.5 text-sm font-semibold text-black shadow-[0_0_0_1px_rgba(50,204,140,0.25),0_10px_30px_rgba(0,0,0,0.45)] transition
              hover:brightness-110 hover:shadow-[0_0_0_1px_rgba(50,204,140,0.45),0_14px_40px_rgba(0,0,0,0.55)]
              active:translate-y-[1px] active:brightness-95 sm:w-auto"
              type="button"
            >
              {copy.play}
            </button>

            <button
              className="w-full cursor-pointer rounded-2xl border border-[#37AA7A]/35 bg-black/35 px-7 py-3.5 text-sm font-semibold text-[#CFFFE2] backdrop-blur transition
              hover:border-[#32CC8C]/65 hover:bg-[#32CC8C]/10
              active:translate-y-[1px] sm:w-auto"
              type="button"
            >
              {copy.invite}
            </button>
>>>>>>> Stashed changes
          </div>
        </div>
      </section>

      {/* Rules */}
      <section
        id="regles"
        className="relative z-10 w-full bg-black px-6 py-24 sm:py-28 overflow-hidden"
      >
        {/* Threads background (fix opacity: keep subtle) */}
        <div className="pointer-events-none absolute inset-0 opacity-[90%]">
          <Threads
            color={[0.117, 0.843, 0.376]}
            amplitude={0.9}
            distance={0.15}
            enableMouseInteraction={false}
          />
        </div>

        <div className="relative mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {copy.howTo}
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-center text-base leading-relaxed text-white/70 md:text-lg">
            {copy.rulesSubtitle}
          </p>

          <div className="mt-14 sm:mt-20 grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur transition hover:border-[#32CC8C]/30">
              <span className="text-sm font-semibold text-[#32CC8C]">01</span>
              <h3 className="mt-4 text-lg font-medium text-white">
                {copy.rule1Title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {copy.rule1Text}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur transition hover:border-[#32CC8C]/30">
              <span className="text-sm font-semibold text-[#32CC8C]">02</span>
              <h3 className="mt-4 text-lg font-medium text-white">
                {copy.rule2Title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {copy.rule2Text}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur transition hover:border-[#32CC8C]/30">
              <span className="text-sm font-semibold text-[#32CC8C]">03</span>
              <h3 className="mt-4 text-lg font-medium text-white">
                {copy.rule3Title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {copy.rule3Text}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur transition hover:border-[#32CC8C]/30">
              <span className="text-sm font-semibold text-[#32CC8C]">04</span>
              <h3 className="mt-4 text-lg font-medium text-white">
                {copy.rule4Title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                {copy.rule4Text}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section
        id="apropos"
        className="relative z-10 w-full bg-black px-6 py-24 overflow-hidden"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
                {copy.aboutTitle}
              </h2>

              <p className="mt-5 text-base leading-relaxed text-white/70 md:text-lg">
                {copy.aboutP1}
              </p>

              <p className="mt-4 text-sm leading-relaxed text-white/60 md:text-base">
                {copy.aboutP2}
              </p>

              <div className="mt-7 inline-flex items-center gap-2 rounded-2xl border border-[#32CC8C]/25 bg-[#32CC8C]/10 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-[#32CC8C]" />
                <span className="text-sm font-medium text-[#CFFFE2]">
                  {lang === "fr" ? "Ne brise pas le lien." : "Don’t break the link."}
                </span>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur">
                <p className="text-sm font-semibold text-[#32CC8C]">{copy.fast}</p>
                <h3 className="mt-3 text-lg font-medium text-white">
                  {copy.fastTitle}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {copy.fastText}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur">
                <p className="text-sm font-semibold text-[#32CC8C]">{copy.reliable}</p>
                <h3 className="mt-3 text-lg font-medium text-white">
                  {copy.reliableTitle}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {copy.reliableText}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-7 backdrop-blur sm:col-span-2">
                <p className="text-sm font-semibold text-[#32CC8C]">{copy.competitive}</p>
                <h3 className="mt-3 text-lg font-medium text-white">
                  {copy.competitiveTitle}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  {copy.competitiveText}
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    className="rounded-2xl bg-[#32CC8C] px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 active:translate-y-[1px]"
                    type="button"
                  >
                    {copy.start}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (center on mobile) */}
      <footer className="relative z-10 w-full bg-black px-6 py-12 text-center sm:text-left">
        <div className="mx-auto mb-10 h-px max-w-6xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
          <div>
            <p className="text-lg font-semibold text-white">FeatChain</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60 mx-auto sm:mx-0">
              {copy.footerDesc}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
              {copy.nav}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#regles"
                  className="text-white/60 transition hover:text-[#32CC8C]"
                >
                  {copy.howTo}
                </a>
              </li>
              <li>
                <a
                  href="#jouer"
                  className="text-white/60 transition hover:text-[#32CC8C]"
                >
                  {copy.play}
                </a>
              </li>
              <li>
                <a
                  href="#apropos"
                  className="text-white/60 transition hover:text-[#32CC8C]"
                >
                  {copy.aboutTitle}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-white/80">
              {copy.info}
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="#"
                  className="text-white/60 transition hover:text-[#32CC8C]"
                >
                  {copy.legal}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/60 transition hover:text-[#32CC8C]"
                >
                  {copy.privacy}
                </a>
              </li>
              <li>
                <span className="text-white/40">{copy.data}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} FeatChain. {copy.allRights}
          </p>
          <p className="text-xs text-white/40">
            {lang === "fr" ? "Ne brise pas le lien." : "Don’t break the link."}
          </p>
        </div>
      </footer>
    </main>
  );
}
