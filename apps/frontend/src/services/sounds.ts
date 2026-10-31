/** Small, locally synthesized cues. Never plays before a user gesture. */
export const soundCatalog = {
  installStart: [392, 523, 659],
  installSuccess: [523, 784, 1047],
  update: [440, 587, 740],
  loginStart: [349, 523, 698],
  menuOpen: [330, 440],
  menuClose: [440, 294],
  navigation: [523],
  viewerOpen: [392, 587],
  close: [349, 262],
  uploadOpen: [440, 554, 659],
  uploadStart: [262, 330, 392],
  uploadSuccess: [523, 659, 784],
  requestStart: [370, 494],
  requestSuccess: [494, 622],
  approve: [587, 740, 880],
  reject: [392, 311],
  download: [784, 659, 523],
  search: [660],
  filter: [554, 740],
  file: [415, 622],
  theme: [294, 440, 349],
  notification: [698, 880],
  error: [220, 185, 165],
  blocked: [311, 233],
  external: [466, 698],
  logout: [440, 330, 220],
  soundOn: [440, 660],
} as const;
export type Sound = keyof typeof soundCatalog;
let context: AudioContext | undefined;
let enabled = true,
  volume = 0.55,
  interacted = false,
  lastPlayed = -Infinity;
let audioError = "";
try {
  enabled = localStorage.getItem("ssdc-sound") !== "off";
  const saved = localStorage.getItem("ssdc-volume");
  if (saved !== null && Number.isFinite(Number(saved)))
    volume = Math.max(0, Math.min(1, Number(saved)));
} catch {
  /* Storage is optional. */
}
function changed() {
  window.dispatchEvent(new Event("ssdc-sounds-change"));
}
export function soundsEnabled() {
  return enabled;
}
export function soundVolume() {
  return volume;
}
export function setSoundVolume(value: number) {
  if (!Number.isFinite(value)) return;
  volume = Math.max(0, Math.min(1, value));
  try {
    localStorage.setItem("ssdc-volume", String(volume));
  } catch {}
  changed();
}
export function setSoundsEnabled(value: boolean) {
  enabled = value;
  try {
    localStorage.setItem("ssdc-sound", value ? "on" : "off");
  } catch {}
  if (!value && context?.state === "running")
    void context.suspend().catch(() => {});
  changed();
}
function engine() {
  const AudioEngine =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!AudioEngine)
    throw new Error("Ce navigateur ne fournit pas le moteur audio nécessaire.");
  return (context ??= new AudioEngine());
}
// Actual pointer/keyboard gestures also support browsers without navigator.userActivation.
for (const event of ["pointerdown", "keydown"])
  window.addEventListener(
    event,
    (e) => {
      if (e.isTrusted) {
        interacted = true;
        if (enabled) {
          try {
            const audio = engine();
            if (audio.state !== "running") void audio.resume().catch(() => {});
          } catch {}
        }
      }
    },
    { capture: true },
  );
export function audioStatus() {
  return (
    audioError ||
    (context?.state === "running"
      ? "Moteur audio actif. Vérifiez aussi le volume de votre appareil."
      : "Touchez « Tester le son » pour activer l’audio.")
  );
}
export function playSound(sound: Sound) {
  if (
    !enabled ||
    volume === 0 ||
    (!interacted && navigator.userActivation?.hasBeenActive !== true)
  )
    return;
  if (performance.now() - lastPlayed < 55) return;
  lastPlayed = performance.now();
  try {
    const audio = engine();
    const start = () => {
      if (!enabled || audio.state !== "running") return;
      audioError = "";
      soundCatalog[sound].forEach((frequency, index) => {
        const oscillator = audio.createOscillator(),
          gain = audio.createGain(),
          time = audio.currentTime + index * 0.085;
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(frequency, time);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(volume * 0.35, time + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.145);
        oscillator.connect(gain);
        gain.connect(audio.destination);
        oscillator.start(time);
        oscillator.stop(time + 0.16);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
        };
      });
    };
    if (audio.state !== "running")
      void audio
        .resume()
        .then(start)
        .catch(() => {
          audioError =
            "Lecture bloquée : vérifiez les autorisations audio du navigateur.";
          changed();
        });
    else start();
  } catch {
    audioError = "Audio indisponible dans ce navigateur.";
    changed();
  }
}
