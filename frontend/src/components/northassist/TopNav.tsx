import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export type NavItem = { id: string; label: string; onClick: () => void };

export function TopNav({
  items,
  onHome,
  activeId,
}: {
  items: NavItem[];
  onHome: () => void;
  activeId?: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <button onClick={onHome} className="flex items-center gap-2 group">
          <div className="grid h-9 w-9 place-items-center rounded-xl text-primary-foreground shadow-soft" style={{ background: "var(--gradient-hero)" }}>
            <Compass className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold tracking-tight text-foreground">NorthAssist <span className="text-primary-glow">AI</span></div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Northern Ontario</div>
          </div>
        </button>
        <nav className="hidden items-center gap-1 md:flex">
          {items.map((it) => (
            <button
              key={it.id}
              onClick={it.onClick}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeId === it.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {it.label}
            </button>
          ))}
        </nav>
        <Button size="sm" variant="outline" className="md:hidden" onClick={onHome}>Home</Button>
      </div>
    </header>
  );
}
