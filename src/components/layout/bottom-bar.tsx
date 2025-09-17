import { NavLinks } from "./nav-links";

export function BottomBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur-sm md:hidden">
      <NavLinks className="h-16" />
    </div>
  );
}
