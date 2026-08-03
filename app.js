/* =========================================================================
 *  ❤️  VOOR JOU  —  hier pas je alles aan
 *  ========================================================================
 *  Alles wat je zelf wilt wijzigen staat in dit CONFIG-blok hieronder.
 *  Je hoeft nergens anders in de code te komen.
 * ======================================================================= */

const CONFIG = {

  /* -- De naam van je vriendin (verschijnt in de hub) ------------------- */
  naam: "Douni",

  /* -- De envelop-onthulling -------------------------------------------- */
  reveal: {
    // Korte boodschap op het kaartje in de envelop:
    boodschap: "Vandaag is het International Girlfriend Day — en jij bent de mijne. Klein cadeautje, alleen voor jou. ❤️",
    // Foto van jullie samen. Zet 'm in de map /photo en pas de naam aan.
    // Laat je 'm leeg (""), dan verschijnt er automatisch een hartje.
    foto: "photo/ons.jpg",
    // Tekst onder de polaroid:
    fotoBijschrift: "wij",
  },

  /* -- De hub (startscherm met de twee onderdelen) ---------------------- */
  hub: {
    ondertitel: "Twee kleine dingen die ik voor je heb gemaakt. Tik maar rond.",
  },

  /* -- DE BRIEFJES  ----------------------------------------------------- *
   *  Zet hier je briefjes. Elke regel tussen aanhalingstekens is één
   *  briefje. Voeg toe of haal weg zoals je wilt.                         */
  briefjes: [
    "Lach, want je hebt de mooiste lach van de hele wereld ❤️",
    "I love your titties cause I can focus on two things at once (of niet eigenlijk)",
    "Als je dit leest, weet dat ik aan je denk ❤️",
    "Je bent de liefste persoon die ik ooit heb ontmoet ❤️",
    "Je bent zo prachtig Douni, je hebt echt geen idee ❤️",
    "Ik hou van jou prinsesje ❤️",
    "Dankjewel dat je van mij een beter persoon maakt ❤️",
    "Jij bent de vrouw van mijn dromen ❤️",
    "Jij bent zo mooi dat deze site bijna crasht ervan ❤️",
    "Vergeet niet te eten en te drinken prinsesje ❤️",
    "Smeer je in als het warm is ❤️",
    "Stay hydrated ❤️",
    "Ik ben altijd bij je, ook nu ❤️",
  ],

  // Bericht als alle briefjes gelezen zijn:
  briefjesSlot: "Dat waren ze — voor nu. Ik hou van je, prinsesje. ❤️",

  /* -- HET SOUNDBOARD  -------------------------------------------------- *
   *  Koppel elk mp3-bestand aan een label. Zet de mp3's in de map /audio.
   *  'icon' is optioneel (een emoji op de tegel).                         */
  soundboardIntro: "Tik op een tegel en hoor mijn stem.",
  soundboard: [
    { label: "Goedemorgen",       file: "audio/goedemorgen.mp3",   icon: "☀️" },
    { label: "Ik mis je",         file: "audio/ik-mis-je.mp3",     icon: "🥺" },
    { label: "Voor het slapen",   file: "audio/slaaplekker.mp3",   icon: "🌙" },
    { label: "Een kusje",         file: "audio/kusje.mp3",         icon: "😘" },
    { label: "Ik hou van je",     file: "audio/ik-hou-van-je.mp3", icon: "❤️" },
    { label: "Verrassing",        file: "audio/verrassing.mp3",    icon: "🎁" },
  ],

  /* -- Creditregel onderaan --------------------------------------------- */
  credit: "met liefde gemaakt door mij, voor jou ❤️",
};

/* =========================================================================
 *  Vanaf hier hoef je niets meer aan te passen.
 * ======================================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const $  = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  /* ---- Schermnavigatie (zonder herladen) ---------------------------- */
  function goto(id) {
    const current = $(".screen.is-active");
    const next = document.getElementById(id);
    if (!next || current === next) return;
    if (current) {
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      setTimeout(() => current.classList.remove("is-leaving"), 450);
    }
    next.classList.add("is-active");
    // stembericht stoppen als je het soundboard verlaat
    if (id !== "screen-sound") stopSound();
  }
  $$("[data-goto]").forEach((el) =>
    el.addEventListener("click", () => goto(el.dataset.goto))
  );

  /* =====================================================================
   *  AUDIO  —  iOS Safari-vriendelijk
   *  Strategie: elk geluid krijgt één eigen, voorgeladen Audio-element.
   *  Bij de allereerste tik (op de envelop) 'ontgrendelen' we ze stil,
   *  zodat iOS ze daarna zonder gedoe laat afspelen. Er speelt altijd
   *  maar één tegelijk; snel achter elkaar tikken wisselt netjes.
   * =================================================================== */
  const players = [];      // { audio, tile, progress, ok }
  let activePlayer = null;
  let audioUnlocked = false;

  function buildPlayers() {
    CONFIG.soundboard.forEach((snd) => {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = snd.file;
      players.push({ audio, cfg: snd, tile: null, ok: true });
    });
  }

  // Ontgrendel alle audio-elementen binnen de eerste tik (user gesture).
  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    players.forEach((p) => {
      const a = p.audio;
      a.muted = true;
      const attempt = a.play();
      if (attempt && attempt.then) {
        attempt
          .then(() => { a.pause(); a.currentTime = 0; a.muted = false; })
          .catch(() => { a.muted = false; });
      } else {
        a.muted = false;
      }
    });
  }

  function stopSound() {
    if (activePlayer) {
      activePlayer.audio.pause();
      activePlayer.audio.currentTime = 0;
      setTileState(activePlayer, false);
      activePlayer = null;
    }
  }

  function setTileState(p, playing) {
    if (!p.tile) return;
    p.tile.classList.toggle("is-playing", playing);
    if (!playing && p.progress) p.progress.style.width = "0%";
  }

  function playSound(p) {
    // Zelfde tegel opnieuw = stoppen (toggle)
    if (activePlayer === p) { stopSound(); return; }
    stopSound();                       // altijd maar één tegelijk

    activePlayer = p;
    const a = p.audio;
    a.currentTime = 0;
    setTileState(p, true);

    const attempt = a.play();
    if (attempt && attempt.catch) {
      attempt.catch(() => {
        // Afspelen mislukt (bv. bestand ontbreekt) → tegel markeren
        if (activePlayer === p) activePlayer = null;
        setTileState(p, false);
        p.tile.classList.add("is-error");
      });
    }
  }

  function buildSoundboard() {
    const grid = $("#soundGrid");
    players.forEach((p) => {
      const tile = document.createElement("button");
      tile.className = "sound-tile";
      tile.setAttribute("aria-label", "Speel: " + p.cfg.label);
      tile.innerHTML = `
        <span class="tile-icon">${p.cfg.icon || "🎧"}</span>
        <span class="tile-label">${p.cfg.label}</span>
        <span class="tile-wave"><span></span><span></span><span></span><span></span></span>
        <span class="tile-progress"></span>`;
      const progress = tile.querySelector(".tile-progress");
      p.tile = tile;
      p.progress = progress;

      // events voor visuele feedback
      p.audio.addEventListener("timeupdate", () => {
        if (activePlayer === p && p.audio.duration) {
          progress.style.width = (p.audio.currentTime / p.audio.duration) * 100 + "%";
        }
      });
      p.audio.addEventListener("ended", () => {
        if (activePlayer === p) activePlayer = null;
        setTileState(p, false);
      });
      p.audio.addEventListener("error", () => { tile.classList.add("is-error"); });

      tile.addEventListener("click", () => { unlockAudio(); playSound(p); });
      grid.appendChild(tile);
    });
  }

  /* =====================================================================
   *  BRIEFJES  —  elk briefje één keer, tot de stapel op is
   * =================================================================== */
  let remaining = [];          // nog niet getoonde indexen
  const stack   = $("#noteStack");
  const card    = $("#noteCard");
  const cardTxt = $("#noteText");
  const endBox  = $("#noteEnd");
  const counter = $("#notesCounter");

  function resetNotes() {
    remaining = CONFIG.briefjes.map((_, i) => i);
    // schud voor willekeurige volgorde
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    card.hidden = true;
    endBox.hidden = true;
    stack.hidden = false;
    stack.disabled = false;
    updateCounter();
  }

  function updateCounter() {
    const total = CONFIG.briefjes.length;
    const done = total - remaining.length;
    counter.textContent = `${done}/${total}`;
  }

  function drawNote() {
    if (remaining.length === 0) return;
    const idx = remaining.pop();
    cardTxt.textContent = CONFIG.briefjes[idx];

    stack.hidden = true;
    card.hidden = false;
    card.classList.remove("animate-in");
    void card.offsetWidth;            // herstart animatie
    card.classList.add("animate-in");
    updateCounter();
  }

  function nextNote() {
    if (remaining.length === 0) {
      // stapel leeg → slot tonen
      card.hidden = true;
      stack.hidden = true;
      endBox.hidden = false;
    } else {
      card.hidden = true;
      stack.hidden = false;
      stack.disabled = false;
    }
  }

  stack.addEventListener("click", drawNote);
  $("#noteNext").addEventListener("click", nextNote);
  $("#noteRestart").addEventListener("click", resetNotes);

  /* =====================================================================
   *  ENVELOP  —  onthulling + audio-ontgrendeling
   * =================================================================== */
  const envelope = $("#envelope");
  let envOpen = false;

  function openEnvelope() {
    if (envOpen) return;
    envOpen = true;
    unlockAudio();                     // dé cruciale eerste tik voor iOS
    envelope.classList.add("is-open");
    $("#revealHint").style.display = "none";
    setTimeout(() => {
      const btn = $("#revealContinue");
      btn.hidden = false;
    }, 1100);
  }
  envelope.addEventListener("click", openEnvelope);
  envelope.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEnvelope(); }
  });
  $("#revealContinue").addEventListener("click", () => goto("screen-hub"));

  /* =====================================================================
   *  "Zet op beginscherm"-tip (alleen op iPhone in Safari, niet als app)
   * =================================================================== */
  function maybeShowA2HS() {
    const ua = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isStandalone = ("standalone" in navigator && navigator.standalone) ||
      window.matchMedia("(display-mode: standalone)").matches;
    if (isIOS && !isStandalone) $("#a2hsHint").hidden = false;
  }

  /* =====================================================================
   *  Inhoud invullen vanuit CONFIG
   * =================================================================== */
  function hydrate() {
    $("#hubTitle").textContent = `Hoi ${CONFIG.naam}`;
    $("#hubSub").textContent = CONFIG.hub.ondertitel;
    $("#noteEndText").textContent = CONFIG.briefjesSlot;
    $("#revealMessage").textContent = CONFIG.reveal.boodschap;
    $("#polaroidCaption").textContent = CONFIG.reveal.fotoBijschrift;
    $("#soundIntro").textContent = CONFIG.soundboardIntro;
    $("#credit").textContent = CONFIG.credit;

    const photo = $("#revealPhoto");
    const showFallback = () => {
      photo.removeAttribute("src");
      photo.style.display = "none";   // geen 'broken image' / alt-tekst tonen
    };
    if (CONFIG.reveal.foto) {
      photo.addEventListener("load", () => { photo.style.display = "block"; });
      photo.addEventListener("error", showFallback);
      photo.src = CONFIG.reveal.foto;
    } else {
      showFallback();
    }
  }

  /* ---- Start -------------------------------------------------------- */
  hydrate();
  buildPlayers();
  buildSoundboard();
  resetNotes();
  maybeShowA2HS();
});
