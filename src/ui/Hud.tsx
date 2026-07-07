import { useLab } from "../state/store";
import "./shell.css";

// Bottom-left caption HUD — re-renders only on store commits, never per-frame.
export default function Hud() {
  const count = useLab((s) => s.spaces.length);
  const zoom = useLab((s) => s.camera.zoom);
  return (
    <div className="hud" data-testid="hud">
      {count} {count === 1 ? "space" : "spaces"} · {Math.round(zoom * 100)}%
    </div>
  );
}
