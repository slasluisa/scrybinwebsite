/* Scrybin hero — the answer card runs a looping demo: type a lookup, let the
   result settle in, hold, then move on to the next card. Static without JS or
   when the visitor prefers reduced motion. */
(function () {
  "use strict";

  var card = document.querySelector(".hero .answer");
  if (!card || !("matchMedia" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var q = card.querySelector(".q");
  var stats = card.querySelectorAll(".stat");
  var nums = card.querySelectorAll(".stat .num");
  var answerHead = card.querySelector(".answer-head");
  var resultsHead = card.querySelector(".results-head");
  var count = card.querySelector(".results-head .count");
  var list = card.querySelector("ul");
  if (!q || stats.length !== 3 || !answerHead || !resultsHead || !count || !list) return;

  // Mirrors the app's Find screen against the demo collection.
  var scenarios = [
    {
      q: "sol ring",
      name: "Sol Ring",
      set: "Commander Masters · #352",
      stats: [15, 11, 4],
      count: "15 locations · 15 total",
      rows: [
        { chip: "COMMANDER STAPLES" },
        { chip: "GAME NIGHT BOX" },
        { chip: "ATRAXA SUPERFRIENDS", gold: true }
      ]
    },
    {
      q: "cyclonic rift",
      name: "Cyclonic Rift",
      set: "Commander Masters · #76",
      stats: [8, 7, 1],
      count: "8 locations · 8 total",
      rows: [
        { chip: "COMMANDER STAPLES" },
        { chip: "BLUE CONTROL" },
        { chip: "YURIKO NINJAS", gold: true }
      ]
    },
    {
      q: "lightning bolt",
      name: "Lightning Bolt",
      set: "Foundations · #134",
      stats: [14, 13, 1],
      count: "14 locations · 14 total",
      rows: [
        { chip: "REMOVAL BOX" },
        { chip: "TRADE BINDER" },
        { chip: "KAALIA, ANGELS & DEMONS", gold: true }
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

  function span(cls, text) {
    var el = document.createElement("span");
    el.className = cls;
    el.textContent = text;
    return el;
  }

  function render(s) {
    for (var n = 0; n < 3; n++) nums[n].textContent = s.stats[n];
    count.textContent = s.count;
    list.textContent = "";
    for (var i = 0; i < s.rows.length; i++) {
      var r = s.rows[i];
      var li = document.createElement("li");
      if (r.gold) li.className = "deck";
      li.appendChild(span("thumb", ""));
      var text = span("rowtext", "");
      text.appendChild(span("rname", s.name));
      text.appendChild(span("rset", s.set));
      text.appendChild(span(r.gold ? "chip gold" : "chip", r.chip));
      li.appendChild(text);
      list.appendChild(li);
    }
  }

  function results() {
    return [answerHead, stats[0], stats[1], stats[2], resultsHead].concat(
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
    // the Answer header and stat tiles land together, then each result row
    els[0].classList.add("in");
    els[1].classList.add("in");
    els[2].classList.add("in");
    els[3].classList.add("in");
    els[4].classList.add("in");
    var i = 5;
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

/* How-it-works steps: when the section scrolls into view, the rail draws and
   a card rides it station to station, popping each step in as it arrives.
   Without JS (or with reduced motion) the section is simply static. */
(function () {
  "use strict";

  var steps = document.querySelector(".how .steps");
  if (!steps || !("matchMedia" in window) || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  steps.classList.add("js");

  var stepEls = steps.querySelectorAll(".step");
  var lastStep = stepEls[stepEls.length - 1];
  steps.addEventListener("animationend", function (e) {
    // release the fill-mode once the sequence lands, so hover transforms work
    if (e.animationName === "step-pop" && e.target === lastStep) {
      steps.classList.add("played");
    }
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        steps.classList.add("play");
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(steps);
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
