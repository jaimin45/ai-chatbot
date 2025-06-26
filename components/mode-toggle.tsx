import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle({
  mode,
  setMode,
}: {
  mode: "chat" | "docs-qa";
  setMode: (mode: "chat" | "docs-qa") => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        className={cn(
          "hidden md:flex md:px-2 md:h-[34px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
          mode === "chat" && "bg-accent text-accent-foreground"
        )}
        onClick={() => setMode("chat")}
        data-state={mode === "chat" ? "active" : undefined}
      >
        General Chat
      </Button>

      <Button
        variant="outline"
        className={cn(
          "hidden md:flex md:px-2 md:h-[34px] data-[state=active]:bg-accent data-[state=active]:text-accent-foreground",
          mode === "docs-qa" && "bg-accent text-accent-foreground"
        )}
        onClick={() => setMode("docs-qa")}
        data-state={mode === "docs-qa" ? "active" : undefined}
      >
        Document Q&A
      </Button>
    </div>
  );
}
