import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  audioStatus,
  playSound,
  setSoundsEnabled,
  setSoundVolume,
  soundsEnabled,
  soundVolume,
} from "../services/sounds";
export default function SoundSettings() {
  const [volume, setVolume] = useState(soundVolume),
    [enabled, setEnabled] = useState(soundsEnabled),
    [status, setStatus] = useState("");
  useEffect(() => {
    const changed = () => {
      setVolume(soundVolume());
      setEnabled(soundsEnabled());
    };
    window.addEventListener("ssdc-sounds-change", changed);
    return () => window.removeEventListener("ssdc-sounds-change", changed);
  }, []);
  return (
    <details className="sound-settings">
      <summary>
        <Volume2 size={14} />
        Sons & volume
      </summary>
      <div>
        <label>
          Volume des effets : {Math.round(volume * 100)} %
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={Math.round(volume * 100)}
            onChange={(e) => setSoundVolume(Number(e.target.value) / 100)}
          />
        </label>
        <label className="sound-check">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setSoundsEnabled(e.target.checked)}
          />
          Activer les effets sonores
        </label>
        <button
          className="sound-test"
          onClick={() => {
            setSoundsEnabled(true);
            if (soundVolume() === 0) setSoundVolume(0.55);
            playSound("soundOn");
            window.setTimeout(() => setStatus(audioStatus()), 250);
          }}
        >
          Tester le son
        </button>
        {status && <p role="status">{status}</p>}
      </div>
    </details>
  );
}
