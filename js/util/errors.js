export function toUserFacingError(err, { generic = "Wrong password or corrupted message." } = {}) {
  const msg = (err && typeof err.message === "string" ? err.message : "").trim();
  if (!msg) return generic;

  if (
    msg.includes("Wrong password") ||
    msg.includes("Corrupted payload") ||
    msg.includes("Unsupported payload format")
  ) {
    return generic;
  }
  return msg;
}

