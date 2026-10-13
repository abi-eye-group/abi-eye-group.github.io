/* --------------------------------------------------------------------------------------------------------------------

SCREEN CALIBRATION  Match an on-screen rectangle to a credit card (an ID-1 card, 85.60 x 53.98 mm) held against the
screen, to learn how big a pixel really is. The answer is remembered in the browser, and is used to set the physical
width and height of the display, so every size in degrees (angle2pix, stimulus.js) is right for THIS screen.

It is a step before the stimulus starts, never a requirement: the start button always works, and "Skip" (or
?calibrate=0 in the address) uses the Display Options as they are.

  StimulusCalibration.apply(display)   - set display.dimension.width/height from a remembered calibration (if it is
                                         for this screen and this browser zoom), returns true if it did
  StimulusCalibration.mount(host, { display, start }) - the calibration IS the entry screen: match the card, then
                                         Start (which calls start(), where the page enters full screen)
  StimulusCalibration.showEntry()      - show that screen again (the experiment was left)

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
      return { text: "Screen calibrated: 1 cm = " + pxPerCm + " px", ok: true };
    }
    if (c) { return { text: "A calibration was saved for a different screen or browser zoom, so it is not used. Calibrate again, or skip.", ok: false }; }
    return { text: "Screen not calibrated: sizes use the Display Options.", ok: false };
  }

  /* --- the start screen ------------------------------------------------------------------------------------- */

  // The calibration IS the entry screen: match the card, then Start (which also goes full screen). A saved
  // calibration is shown already set, so a returning visitor only presses Start. Skip starts straight away with the
  // Display Options. ?calibrate=0 does not show this screen at all (the page's own start button is used).

  var entry = null, startFn = null, displayObj = null, refreshNote = null;

  function mount (host, options) {

    options = options || {};
    startFn = options.start || function () {};
    displayObj = options.display || null;
    if (skipRequested()) { return; }

    var c0 = load(), saved = valid(c0);
    var startWidth = saved ? Math.round(CARD_W_CM / c0.cmPerCssPx) : 340;

    entry = document.createElement("div");
    entry.id = "calibration-panel";
    entry.style.cssText = "position:fixed; inset:0; z-index:2000; background:#777; color:#fff; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; text-align:center;";
    entry.innerHTML =
      "<div style=\"max-width:640px;\">" +
        "<h4>Set up the screen</h4>" +
        "<p style=\"margin-bottom:4px;\">Hold a credit card (any bank or ID card) flat against the screen and move the slider until the rectangle is exactly the size of the card. " +
        "Use the card's edges. Then press <b>Start</b>.</p>" +
        "<p id=\"cal-note\" style=\"font-size:0.9rem; opacity:0.9; margin:0;\"></p>" +
      "</div>" +
      "<div id=\"cal-card\" style=\"margin:18px 0; border:2px solid #fff; background:rgba(255,255,255,0.12); border-radius:4% / 6%;\"></div>" +
      "<div style=\"width:min(560px, 90vw);\"><input id=\"cal-slider\" type=\"range\" min=\"120\" max=\"900\" step=\"1\" value=\"" + startWidth + "\" style=\"width:100%;\"></div>" +
      "<div id=\"cal-readout\" style=\"margin:10px 0 16px; font-size:0.9rem; opacity:0.9;\"></div>" +
      "<div>" +
        "<button type=\"button\" id=\"cal-start\" class=\"btn btn-light btn-lg\">Start</button> " +
        "<button type=\"button\" id=\"cal-skip\" class=\"btn btn-outline-light btn-lg\">Skip calibration and start</button>" +
      "</div>" +
      "<div style=\"margin-top:16px; font-size:0.9rem;\">" +
        "<a href=\"instructions.html\" style=\"color:#fff; text-decoration:underline;\">Instructions</a>" +
        "<span id=\"cal-forget-wrap\"> &nbsp;&middot;&nbsp; <a href=\"#\" id=\"cal-forget\" style=\"color:#fff; text-decoration:underline;\">Forget the saved calibration</a></span>" +
      "</div>";
    document.body.appendChild(entry);

    var card = entry.querySelector("#cal-card"), slider = entry.querySelector("#cal-slider"),
        readout = entry.querySelector("#cal-readout"), note = entry.querySelector("#cal-note"),
        forget = entry.querySelector("#cal-forget"), forgetWrap = entry.querySelector("#cal-forget-wrap");

    function noteText () {
      var c = load();
      if (valid(c)) { note.textContent = "Your saved calibration is shown. Press Start to use it, or adjust it first."; forgetWrap.style.display = ""; }
      else if (c)   { note.textContent = "The saved calibration was for a different screen or browser zoom, so it is not used. Please calibrate again."; forgetWrap.style.display = ""; }
      else          { note.textContent = ""; forgetWrap.style.display = "none"; }
    }
    function draw () {
      var w = Number(slider.value);
      card.style.width  = w + "px";
      card.style.height = (w * CARD_H_CM / CARD_W_CM) + "px";
      readout.textContent = "Card width on screen: " + w + " px   \u2192   1 cm = " + (w / CARD_W_CM).toFixed(1) + " px";
    }
    slider.addEventListener("input", draw);
    refreshNote = noteText;
    noteText(); draw();

    function go () {
      // (called from a click: the start function enters full screen, which needs that user gesture)
      entry.style.display = "none";
      startFn();
    }
    entry.querySelector("#cal-start").addEventListener("click", function () {
      save(CARD_W_CM / Number(slider.value));
      if (displayObj) { apply(displayObj); }
      go();
    });
    entry.querySelector("#cal-skip").addEventListener("click", go);
    forget.addEventListener("click", function (e) { e.preventDefault(); clear(); noteText(); });
    document.addEventListener("keydown", function (e) {
      if (entry && entry.style.display !== "none" && e.key === "Enter") { entry.querySelector("#cal-start").click(); }
    });

    slider.focus();
  }

  // back to the entry screen (when the experiment is left): the saved size is shown again
  function showEntry () {
    if (!entry) { return; }
    var c = load(), slider = entry.querySelector("#cal-slider");
    if (valid(c)) { slider.value = Math.round(CARD_W_CM / c.cmPerCssPx); slider.dispatchEvent(new Event("input")); }
    if (refreshNote) { refreshNote(); }
    entry.style.display = "flex";
  }

  return { apply: apply, mount: mount, showEntry: showEntry, status: status, clear: clear };

})();
