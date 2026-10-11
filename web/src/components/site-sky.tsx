import { CloudShader } from "@/components/ui/cloud-shader";
import { useApp } from "@/lib/store";

/** Site-wide animated sky behind all content; colours follow light/dark theme. */
export function SiteSky() {
  const { theme } = useApp();
  const dark = theme === "dark";
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <CloudShader
        className="h-full min-h-0 w-full"
        speed={0.6}
        cloudColor={dark ? "#4a4858" : "#fffdf8"}
        skyTopColor={dark ? "#0d1120" : "#c9d8e8"}
        skyBottomColor={dark ? "#26212e" : "#f5eee1"}
      />
    </div>
  );
}
