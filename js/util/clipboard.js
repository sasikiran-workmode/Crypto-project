export async function copyTextToClipboard(text) {
  const str = (text ?? "").toString();
  if (!str) throw new Error("Nothing to copy.");

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(str);
    return;
  }

  const ta = document.createElement("textarea");
  ta.value = str;
  ta.setAttribute("readonly", "true");
  ta.style.position = "fixed";
  ta.style.top = "-1000px";
  ta.style.left = "-1000px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  if (!ok) throw new Error("Clipboard copy failed.");
}

