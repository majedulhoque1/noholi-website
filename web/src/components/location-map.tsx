import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { library } from "@/lib/data";
import { useApp } from "@/lib/store";

export function LocationMap({ className = "h-80 w-full", card = false }: { className?: string; card?: boolean | "sm" }) {
  const { lang } = useApp();
  const bn = lang === "bn";
  return (
    <div className={`relative overflow-hidden border border-border bg-secondary ${className}`}>
      <iframe
        title={bn ? "নহলি পাঠাগারের অবস্থান (গুগল ম্যাপ)" : "Map showing the location of Noholi Library in Pallabi, Dhaka"}
        src={library.embedUrl}
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full border-0"
      />
      {card && (
        <div className={`pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-auto sm:left-4${card === "sm" ? " hidden sm:block" : ""}`}>
          <div className="pointer-events-auto max-w-xs border border-border bg-background/95 p-4 backdrop-blur">
            <div className="eyebrow mb-2">{bn ? library.nameBn : library.name}</div>
            <p className="text-sm leading-relaxed text-muted-foreground">{library.address.join(", ")}</p>
            <p className="mt-2 text-sm tabular-nums">{library.hoursShort}</p>
            <Button size="sm" variant="accent" className="mt-4" asChild>
              <a href={library.directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation className="h-3.5 w-3.5" />
                {bn ? "পথ দেখুন" : "Get directions"}
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
