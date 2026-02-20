function isEmailValid(email) {
  if (typeof email !== "string") return false;
  const e = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}

function isPasswordStrong(pw) {
  if (typeof pw !== "string") return false;
  const s = pw.trim();
  const lengthOk = s.length >= 8;
  const upperOk = /[A-Z]/.test(s);
  const numberOk = /\d/.test(s);
  const specialOk = /[^A-Za-z0-9]/.test(s);
  return lengthOk && upperOk && numberOk && specialOk;
}

module.exports = { isEmailValid, isPasswordStrong };
