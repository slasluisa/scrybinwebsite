/* Scrybin hero — the answer card runs a looping demo: type a lookup, let the
   result settle in, hold, then move on to the next card. Static without JS or
   when the visitor prefers reduced motion. */
(function () {
  "use strict";

  var card = document.querySelector(".hero .answer");
  if (!card || !("matchMedia" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var q = card.querySelector(".q");
  var name = card.querySelector("h2");
  var setline = card.querySelector(".setline");
  var copies = card.querySelector(".copies");
  var list = card.querySelector("ul");
  if (!q || !name || !setline || !copies || !list) return;

  var scenarios = [
    {
      q: "sol ring",
      name: "Sol Ring",
      setline: "Commander Masters · Artifact",
      copies: "4 copies · 3 filed · 1 checked out",
      rows: [
        { chip: "A-01", where: "×2 · shelf binder" },
        { chip: "BOX-03", where: "×1 · bulk box" },
        { chip: "DECK", gold: true, where: "×1 · Sol Ring EDH" }
      ]
    },
    {
      q: "cyclonic rift",
      name: "Cyclonic Rift",
      setline: "Commander Masters · Instant",
      copies: "3 copies · 2 filed · 1 checked out",
      rows: [
        { chip: "B-02", where: "×1 · blue control box" },
        { chip: "TRADE", where: "×1 · trade binder · foil" },
        { chip: "DECK", gold: true, where: "×1 · Atraxa Superfriends" }
      ]
    },
    {
      q: "llanowar elves",
      name: "Llanowar Elves",
      setline: "Foundations · Creature",
      copies: "5 copies · all filed",
      rows: [
        { chip: "SHELF-B", where: "×2 · green ramp box" },
        { chip: "A-01", where: "×2 · shelf binder" },
        { chip: "BOX-03", where: "×1 · bulk box" }
      ]
    }
  ];

  var TYPE_MS = 70;      // per character typed
  var ERASE_MS = 32;     // per character erased
  var REVEAL_MS = 150;   // stagger between result rows
  var HOLD_MS = 4600;    // finished result stays on screen

  // One chain of timeouts drives the loop. Restarts bump `gen`, which orphans
  // every callback from the previous chain — without this, a visibilitychange
  // on load can start a second interleaved chain.
  var gen = 0;

  function later(fn, ms) {
    var g = gen;
    window.setTimeout(function () { if (g === gen) fn(); }, ms);
  }

  function render(s) {
    name.textContent = s.name;
    setline.textContent = s.setline;
    copies.textContent = s.copies;
    list.textContent = "";
    for (var i = 0; i < s.rows.length; i++) {
      var r = s.rows[i];
      var li = document.createElement("li");
      if (r.gold) li.className = "deck";
      var chip = document.createElement("span");
      chip.className = r.gold ? "chip gold" : "chip";
      chip.textContent = r.chip;
      var where = document.createElement("span");
      where.className = "where";
      where.textContent = r.where;
      li.appendChild(chip);
      li.appendChild(where);
      list.appendChild(li);
    }
  }

  function results() {
    return [name, setline, copies].concat(
      Array.prototype.slice.call(list.children)
    );
  }

  function hideResults() {
    results().forEach(function (el) {
      el.classList.add("rise");
      el.classList.remove("in");
    });
  }

  function revealResults(done) {
    var els = results();
    // headline block first, then each bin row
    els[0].classList.add("in");
    els[1].classList.add("in");
    els[2].classList.add("in");
    var i = 3;
    (function next() {
      if (i >= els.length) { later(done, HOLD_MS); return; }
      els[i].classList.add("in");
      i++;
      later(next, REVEAL_MS);
    })();
  }

  function erase(done) {
    var text = q.textContent;
    if (!text.length) { done(); return; }
    q.textContent = text.slice(0, -1);
    later(function () { erase(done); }, ERASE_MS);
  }

  function type(text, done) {
    var i = 0;
    (function next() {
      if (i >= text.length) { done(); return; }
      q.textContent += text.charAt(i);
      i++;
      later(next, TYPE_MS);
    })();
  }

  function play(index) {
    var s = scenarios[index % scenarios.length];
    erase(function () {
      render(s);
      hideResults();
      later(function () {
        type(s.q, function () {
          later(function () {
            revealResults(function () { play(index + 1); });
          }, 350);
        });
      }, 200);
    });
  }

  function restart() {
    gen++;
    q.textContent = "";
    play(0);
  }

  // Start on the first scenario: the static markup already matches it, so the
  // loop begins by typing over a cleared searchbar.
  restart();

  // Don't churn in hidden tabs; restart the cycle cleanly on return.
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      gen++; // orphan the running chain
    } else {
      restart();
    }
  });
})();

/* Demo-reel video: never autoplay for reduced-motion visitors (hand them
   controls instead), and only run while it's actually on screen. */
(function () {
  "use strict";

  var video = document.querySelector(".stage-phone video");
  if (!video || !("matchMedia" in window)) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    video.removeAttribute("autoplay");
    video.pause();
    video.controls = true;
    return;
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          video.play().catch(function () {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.15 }).observe(video);
  }
})();
