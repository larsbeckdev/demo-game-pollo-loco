export function snapPercentToStep(value) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const steps = [0, 20, 40, 60, 80, 100];
  return steps.reduce(
    (best, s) => (Math.abs(s - v) < Math.abs(best - v) ? s : best),
    100,
  );
}

export function healthBarSrc(percent, color = "orange") {
  const p = snapPercentToStep(percent);
  return `/images/7_statusbars/1_statusbar/2_statusbar_health/${color}/${p}.png`;
}

export function coinBarSrc(percent, color = "orange") {
  const p = snapPercentToStep(percent);
  return `/images/7_statusbars/1_statusbar/1_statusbar_coin/${color}/${p}.png`;
}

export function bottleBarSrc(percent, color = "orange") {
  const p = snapPercentToStep(percent);
  return `/images/7_statusbars/1_statusbar/3_statusbar_bottle/${color}/${p}.png`;
}

// Endboss hat andere Filenamen: blue0.png, blue20.png ...
export function bossBarSrc(percent, color = "orange") {
  const p = snapPercentToStep(percent);
  return `/images/7_statusbars/2_statusbar_endboss/${color}/${color}${p}.png`;
}
