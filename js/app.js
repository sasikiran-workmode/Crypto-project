import { initUi, setMode, clearErrors, setStatus, setCompatMessage, updateHideSizeHint } from "./ui.js";
import { hide, reveal, validatePassword5Digits } from "./core/cloak.js";
import { copyTextToClipboard } from "./util/clipboard.js";
import { toUserFacingError } from "./util/errors.js";

function isWebCryptoSupported() {
  return !!(globalThis.crypto && globalThis.crypto.subtle);
}

function attachNumeric5DigitsInput(inputEl) {
  inputEl.addEventListener("input", () => {
    const cleaned = inputEl.value.replace(/[^\d]/g, "").slice(0, 5);
    if (cleaned !== inputEl.value) inputEl.value = cleaned;
  });
}

function setBusy(ui, busy) {
  ui.btnHide.disabled = busy;
  ui.btnReveal.disabled = busy;
}

function validateHideInputs(ui) {
  let ok = true;
  const secret = ui.hideSecret.value;
  const password = ui.hidePassword.value;
  const cover = ui.hideCover.value;

  if (!secret || !secret.trim()) {
    ui.hideSecretErr.textContent = "Secret is required.";
    ok = false;
  }
  if (!validatePassword5Digits(password)) {
    ui.hidePasswordErr.textContent = "Password must be exactly 5 digits.";
    ok = false;
  }
  if (cover && cover.trim().length > 0) {
    const wordCount = cover.trim().replace(/\s+/g, " ").split(" ").length;
    if (wordCount < 2) {
      ui.hideCoverErr.textContent = "Cover text must contain at least two words (or leave blank to auto-generate).";
      ok = false;
    }
  }
  return ok;
}

function validateRevealInputs(ui) {
  let ok = true;
  const carrier = ui.revealCarrier.value;
  const password = ui.revealPassword.value;
  if (!carrier || !carrier.trim()) {
    ui.revealCarrierErr.textContent = "Carrier message is required.";
    ok = false;
  }
  if (!validatePassword5Digits(password)) {
    ui.revealPasswordErr.textContent = "Password must be exactly 5 digits.";
    ok = false;
  }
  return ok;
}

async function onHide(ui) {
  clearErrors(ui);
  setStatus(ui, { kind: "info", text: "" });

  if (!validateHideInputs(ui)) return;

  setBusy(ui, true);
  try {
    const carrier = await hide({
      secretText: ui.hideSecret.value,
      password: ui.hidePassword.value,
      coverText: ui.hideCover.value,
    });
    ui.hideOutput.value = carrier;
    ui.btnCopyCarrier.disabled = false;
    setStatus(ui, { kind: "ok", text: "Hidden message created. Copy the output and paste it into your app." });
  } catch (err) {
    setStatus(ui, { kind: "err", text: toUserFacingError(err, { generic: "Wrong password or corrupted message." }) });
  } finally {
    setBusy(ui, false);
  }
}

async function onReveal(ui) {
  clearErrors(ui);
  setStatus(ui, { kind: "info", text: "" });

  if (!validateRevealInputs(ui)) return;

  setBusy(ui, true);
  try {
    const secret = await reveal({
      carrierText: ui.revealCarrier.value,
      password: ui.revealPassword.value,
    });
    ui.revealOutput.value = secret;
    ui.btnCopySecret.disabled = false;
    setStatus(ui, { kind: "ok", text: "Secret revealed." });
  } catch (err) {
    const msg = toUserFacingError(err, { generic: "Wrong password or corrupted message." });
    if (msg.includes("Invisible stream not detected")) {
      setStatus(ui, { kind: "err", text: "No hidden message detected. The platform may have stripped invisible characters." });
    } else {
      setStatus(ui, { kind: "err", text: msg });
    }
  } finally {
    setBusy(ui, false);
  }
}

async function onCopy(ui, which) {
  const text = which === "carrier" ? ui.hideOutput.value : ui.revealOutput.value;
  try {
    await copyTextToClipboard(text);
    setStatus(ui, { kind: "ok", text: which === "carrier" ? "Copied carrier output." : "Copied secret." });
  } catch {
    setStatus(ui, {
      kind: "err",
      text: "Copy failed (permission denied or unsupported). Try selecting the text manually and copying.",
    });
  }
}

function boot() {
  const ui = initUi();

  setMode(ui, "hide");
  attachNumeric5DigitsInput(ui.hidePassword);
  attachNumeric5DigitsInput(ui.revealPassword);
  updateHideSizeHint(ui);

  ui.hideSecret.addEventListener("input", () => updateHideSizeHint(ui));

  ui.tabHide.addEventListener("click", () => setMode(ui, "hide"));
  ui.tabReveal.addEventListener("click", () => setMode(ui, "reveal"));

  ui.btnHide.addEventListener("click", () => onHide(ui));
  ui.btnReveal.addEventListener("click", () => onReveal(ui));
  ui.btnCopyCarrier.addEventListener("click", () => onCopy(ui, "carrier"));
  ui.btnCopySecret.addEventListener("click", () => onCopy(ui, "secret"));

  if (!isWebCryptoSupported()) {
    setCompatMessage(
      ui,
      "Your browser does not support the required Web Crypto APIs. Use a modern Chrome/Edge/Firefox/Safari."
    );
    setBusy(ui, true);
    ui.btnCopyCarrier.disabled = true;
    ui.btnCopySecret.disabled = true;
  } else {
    setCompatMessage(ui, "");
  }
}

boot();

