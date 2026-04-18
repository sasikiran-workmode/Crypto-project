import { canUseCompressionStream } from "./codec/compress.js";

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element: ${id}`);
  return el;
}

export function initUi() {
  return {
    tabHide: $("tab-hide"),
    tabReveal: $("tab-reveal"),
    viewHide: $("view-hide"),
    viewReveal: $("view-reveal"),
    compat: $("compat"),
    status: $("status"),

    hideSecret: $("hide-secret"),
    hideCover: $("hide-cover"),
    hidePassword: $("hide-password"),
    hideOutput: $("hide-output"),
    hideSecretErr: $("hide-secret-err"),
    hideCoverErr: $("hide-cover-err"),
    hidePasswordErr: $("hide-password-err"),
    hideSize: $("hide-size"),
    btnHide: $("btn-hide"),
    btnCopyCarrier: $("btn-copy-carrier"),

    revealCarrier: $("reveal-carrier"),
    revealPassword: $("reveal-password"),
    revealOutput: $("reveal-output"),
    revealCarrierErr: $("reveal-carrier-err"),
    revealPasswordErr: $("reveal-password-err"),
    btnReveal: $("btn-reveal"),
    btnCopySecret: $("btn-copy-secret"),

    canUseCompression: canUseCompressionStream(),
  };
}

export function setMode(ui, mode) {
  const isHide = mode === "hide";
  ui.tabHide.classList.toggle("tab--active", isHide);
  ui.tabReveal.classList.toggle("tab--active", !isHide);
  ui.tabHide.setAttribute("aria-selected", String(isHide));
  ui.tabReveal.setAttribute("aria-selected", String(!isHide));

  ui.viewHide.hidden = !isHide;
  ui.viewReveal.hidden = isHide;
  ui.viewHide.classList.toggle("view--active", isHide);
  ui.viewReveal.classList.toggle("view--active", !isHide);
}

export function clearErrors(ui) {
  ui.hideSecretErr.textContent = "";
  ui.hideCoverErr.textContent = "";
  ui.hidePasswordErr.textContent = "";
  ui.revealCarrierErr.textContent = "";
  ui.revealPasswordErr.textContent = "";
}

export function setStatus(ui, { kind = "info", text = "" } = {}) {
  ui.status.textContent = text || "";
  ui.status.classList.remove("status__box--ok", "status__box--err");
  if (kind === "ok") ui.status.classList.add("status__box--ok");
  if (kind === "err") ui.status.classList.add("status__box--err");
}

export function setCompatMessage(ui, message) {
  if (!message) {
    ui.compat.hidden = true;
    ui.compat.textContent = "";
    return;
  }
  ui.compat.hidden = false;
  ui.compat.textContent = message;
}

export function updateHideSizeHint(ui) {
  const text = ui.hideSecret.value || "";
  const bytes = new TextEncoder().encode(text).length;
  const kb = (bytes / 1024).toFixed(bytes < 1024 ? 1 : 0);
  const compressionNote = ui.canUseCompression
    ? "Compression: deflate (CompressionStream) when supported."
    : "Compression: unavailable in this browser (falls back to raw UTF-8).";
  ui.hideSize.textContent = `Secret size: ~${kb} KB. ${compressionNote}`;
}

