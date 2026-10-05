/** A soft two-note bell, synthesised — no audio file to download. */
export function playChime(volume = 0.25) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    [
      [659.25, 0],
      [987.77, 0.18],
      [1318.5, 0.36],
    ].forEach(([freq, offset]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + offset);
      gain.gain.linearRampToValueAtTime(volume, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + offset);
      osc.stop(now + offset + 2);
    });
    setTimeout(() => ctx.close(), 2600);
  } catch {
    /* audio unavailable */
  }
}
