// Animate a stat from 0 to the number already written in the element.

// ========= COUNT-UP NUMBERS =========
export const countUp = (el) => {
  const final = el.textContent.trim();
  const m = final.match(/^([^\d]*)(\d+)(.*)$/);
  if (!m || Number(m[2]) < 2) return; // skip values like "0→1"
  const [, prefix, num, suffix] = m;
  const target = Number(num);
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = final;
  };
  el.textContent = `${prefix}0${suffix}`;
  requestAnimationFrame(step);
};
