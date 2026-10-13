/* --------------------------------------------------------------------------------------------------------------------

SCREEN CALIBRATION  Match an on-screen rectangle to a credit card (an ID-1 card, 85.60 x 53.98 mm) held against the
screen, to learn how big a pixel really is. The answer is remembered in the browser, and is used to set the physical
width and height of the display, so every size in degrees (angle2pix, stimulus.js) is right for THIS screen.

It is a step before the stimulus starts, never a requirement: the start button always works, and "Skip" (or
?calibrate=0 in the address) uses the Display Options as they are.

  StimulusCalibration.apply(display)   - set display.dimension.width/height from a remembered calibration (if it is
                                         for this screen and this browser zoom), returns true if it did
  StimulusCalibration.mount(element)   - put the calibration controls into element (the start screen)

The measurement is in CSS pixels (what the page lays out in), at the browser zoom in force when it was made; the
remembered value is only used again for the same screen size and the same device pixel ratio (zoom).

-------------------------------------------------------------------------------------------------------------------- */

var StimulusCalibration = (function () {

  var KEY = "abi.stimulus.calibration.v1";
  var CARD_W_CM = 8.560, CARD_H_CM = 5.398;

  function here () { return { w: screen.width, h: screen.height, dpr: window.devicePixelRatio || 1 }; }

  function load () {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      if (!c || !(c.cmPerCssPx > 0)) { return null; }
      return c;
    } catch (e) { return null; }
  }

  function save (cmPerCssPx) {
    var h = here();
    try { localStorage.setItem(KEY, JSON.stringify({ cmPerCssPx: cmPerCssPx, w: h.w, h: h.h, dpr: h.dpr, saved: new Date().toISOString() })); } catch (e) { /* storage blocked */ }
  }

  function clear () { try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } }

  // a calibration is only good for the screen and the browser zoom it was made at
  function valid (c) {
    if (!c) { return false; }
    var h = here();
    return c.w === h.w && c.h === h.h && Math.abs(c.dpr - h.dpr) < 1e-6;
  }

  function skipRequested () { return /[?&]calibrate=0\b/.test(window.location.search); }

  function apply (display) {
    if (!display || skipRequested()) { return false; }
    var c = load();
    if (!valid(c)) { return false; }
    display.dimension.width  = c.cmPerCssPx * display.resolution.width;     // (resolution is in CSS pixels)
    display.dimension.height = c.cmPerCssPx * display.resolution.height;
    display.calibrated = true;
    return true;
  }

  function status () {
    var c = load();
    if (skipRequested()) { return { text: "Calibration skipped: the Display Options are used as they are.", ok: false }; }
    if (valid(c)) {
      var pxPerCm = (1 / c.cmPerCssPx).toFixed(1);
      return { text: "Screen calibrated: 1 cm = " + pxPerCm + " px  (" + c.w + " × " + c.h + ", zoom " + Math.round(c.dpr * 100) + "%)", ok: true };
    }
    if (c) { return { text: "A calibration was saved for a different screen or browser zoom, so it is not used. Calibrate again, or skip.", ok: false }; }
    return { text: "Screen not calibrated: sizes use the Display Options.", ok: false };
  }

  /* --- the controls on the start screen ------------------------------------------------------------------------ */

  function mount (host) {

    var box = document.createElement("div");
    box.id = "calibration-panel";
    box.style.cssText = "max-width: 640px; margin: 24px auto 0; padding: 10px 14px; text-align: center; color: #fff; font-size: 0.95rem;";
    box.innerHTML =
      "<div id=\"calibration-status\"></div>" +
      "<div style=\"margin-top:8px;\">" +
        "<button type=\"button\" id=\"calibration-open\" class=\"btn btn-sm btn-light\">Calibrate with a credit card</button> " +
        "<button type=\"button\" id=\"calibration-clear\" class=\"btn btn-sm btn-outline-light\" style=\"display:none;\">Forget calibration</button>" +
      "</div>";
    host.appendChild(box);

    var statusEl = box.querySelector("#calibration-status");
    var openBtn  = box.querySelector("#calibration-open");
    var clearBtn = box.querySelector("#calibration-clear");

    function refresh () {
      var s = status();
      statusEl.textContent = s.text;
      openBtn.textContent = s.ok ? "Calibrate again" : "Calibrate with a credit card";
      clearBtn.style.display = load() ? "" : "none";
    }
    refresh();

    clearBtn.addEventListener("click", function () { clear(); refresh(); });

    openBtn.addEventListener("click", function () {

      var overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed; inset:0; z-index:2000; background:#555; color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; text-align:center;";
      var startWidth = 340;
      var c0 = load();
      if (valid(c0)) { startWidth = Math.round(CARD_W_CM / c0.cmPerCssPx); }
      overlay.innerHTML =
        "<div style=\"max-width:640px;\">" +
          "<h4>Match the card to the rectangle</h4>" +
          "<p>Hold a credit card (any bank or ID card) flat against the screen. Move the slider until the rectangle is exactly the size of the card. " +
          "Use the card edges, not the printed area. Leave the browser zoom as it is (100% is best).</p>" +
        "</div>" +
        "<div id=\"cal-card\" style=\"margin:18px 0; border:2px solid #fff; background:rgba(255,255,255,0.12); border-radius:" + "4% / 6%" + ";\"></div>" +
        "<div style=\"width:min(560px, 90vw);\"><input id=\"cal-slider\" type=\"range\" min=\"120\" max=\"900\" step=\"1\" value=\"" + startWidth + "\" style=\"width:100%;\"></div>" +
        "<div id=\"cal-readout\" style=\"margin:10px 0; font-size:0.9rem; opacity:0.9;\"></div>" +
        "<div>" +
          "<button type=\"button\" id=\"cal-use\" class=\"btn btn-light\">Use this size</button> " +
          "<button type=\"button\" id=\"cal-skip\" class=\"btn btn-outline-light\">Skip: use the Display Options</button>" +
        "</div>";
      document.body.appendChild(overlay);

      var card = overlay.querySelector("#cal-card"), slider = overlay.querySelector("#cal-slider"), readout = overlay.querySelector("#cal-readout");
      function draw () {
        var w = Number(slider.value);
        card.style.width  = w + "px";
        card.style.height = (w * CARD_H_CM / CARD_W_CM) + "px";
        readout.textContent = "Card width on screen: " + w + " px   →   1 cm = " + (w / CARD_W_CM).toFixed(1) + " px";
      }
      slider.addEventListener("input", draw);
      draw();
      slider.focus();

      function close () { if (overlay.parentNode) { overlay.parentNode.removeChild(overlay); } document.removeEventListener("keydown", onKey); refresh(); }
      function onKey (e) {
        if (e.key === "Escape") { close(); }
        else if (e.key === "Enter") { use(); }
      }
      function use () { save(CARD_W_CM / Number(slider.value)); close(); }
      document.addEventListener("keydown", onKey);
      overlay.querySelector("#cal-use").addEventListener("click", use);
      overlay.querySelector("#cal-skip").addEventListener("click", close);
    });
  }

  return { apply: apply, mount: mount, status: status, clear: clear };

})();
