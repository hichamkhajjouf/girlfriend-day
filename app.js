/* =========================================================================
 *  ❤️  DOUNICHI V2  —  hier pas je alles aan
 *  ========================================================================
 *  Alles wat je zelf wilt wijzigen staat in dit CONFIG-blok hieronder.
 *  Je hoeft nergens anders in de code te komen.
 * ======================================================================= */

const CONFIG = {

  /* -- De begroeting bovenaan de hub ------------------------------------ */
  begroeting: "Goeiemorgen schoonheid ☀️",

  /* -- De envelop-onthulling -------------------------------------------- */
  reveal: {
    // Korte boodschap op het kaartje in de envelop:
    boodschap: "Welkom bij dounichi v2, een klein plekje op internet, alleen voor jou gemaakt. Ik hou van jou Douni inu ❤️",
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
    { label: "Liedje",            file: "audio/verrassing.mp3",    icon: "🎵" },
  ],

  /* -- Creditregel onderaan --------------------------------------------- */
  credit: "met liefde gemaakt door hichi, voor zijn allerliefste douni ❤️",
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
   *  BRIEFJES  —  één doorlopend deck: het gelezen briefje vliegt weg,
   *  het volgende komt meteen vanuit de stapel omhoog. Elk briefje één
   *  keer, tot de stapel op is.
   * =================================================================== */
  const deck    = $("#deck");
  const card    = $("#noteCard");
  const cardTxt = $("#noteText");
  const cardCta = $("#noteCta");
  const endBox  = $("#noteEnd");
  const counter = $("#notesCounter");
  const COVER_TEXT = "tik voor een briefje";

  let order = [];   // geschudde volgorde van briefje-indexen
  let pos   = -1;   // -1 = cover; anders index in 'order' van het getoonde briefje

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function resetNotes() {
    order = shuffle(CONFIG.briefjes.map((_, i) => i));
    pos = -1;
    endBox.hidden = true;
    deck.hidden = false;
    card.style.visibility = "";
    card.classList.remove("gone");
    renderCard();
    renderDeck();
  }

  function renderCard() {
    if (pos < 0) {
      cardTxt.textContent = COVER_TEXT;
      cardCta.textContent = "";
      card.classList.add("is-cover");
    } else {
      cardTxt.textContent = CONFIG.briefjes[order[pos]];
      cardCta.textContent = pos === order.length - 1 ? "en dan… →" : "volgende →";
      card.classList.remove("is-cover");
    }
    // herstart de 'omhoog uit de stapel'-animatie
    card.classList.remove("enter");
    void card.offsetWidth;
    card.classList.add("enter");
  }

  function renderDeck() {
    const total = CONFIG.briefjes.length;
    const shown = pos < 0 ? 0 : pos + 1;
    counter.textContent = `${shown}/${total}`;
    // hoeveel briefjes liggen er nog ONDER de bovenste kaart
    const under = pos < 0 ? total : total - 1 - pos;
    deck.className = "deck layers-" + Math.min(3, Math.max(0, under));
  }

  // maak een losse kopie die wegvliegt; ruimt zichzelf op (ook bij snel tikken)
  function spawnGhost() {
    const rect = card.getBoundingClientRect();
    const ghost = card.cloneNode(true);
    ghost.removeAttribute("id");
    ghost.classList.remove("enter");
    ghost.classList.add("is-ghost");
    ghost.style.position = "fixed";
    ghost.style.left = rect.left + "px";
    ghost.style.top = rect.top + "px";
    ghost.style.width = rect.width + "px";
    ghost.style.height = rect.height + "px";
    ghost.style.margin = "0";
    document.body.appendChild(ghost);
    const kill = () => ghost.remove();
    ghost.addEventListener("animationend", kill);
    setTimeout(kill, 800);   // vangnet
  }

  function advance() {
    // al bij het laatste briefje? → laat het wegvliegen en toon het slot
    if (pos >= order.length - 1) {
      if (pos >= 0) {
        spawnGhost();
        card.classList.add("gone");
        deck.className = "deck layers-0";
      }
      setTimeout(showEnd, pos >= 0 ? 280 : 0);
      return;
    }
    // een gelezen briefje vliegt weg (niet bij de cover)
    if (pos >= 0) spawnGhost();
    pos++;
    renderCard();
    renderDeck();
  }

  function showEnd() {
    deck.hidden = true;
    endBox.hidden = false;
  }

  card.addEventListener("click", advance);
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
    $("#hubTitle").textContent = CONFIG.begroeting;
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
