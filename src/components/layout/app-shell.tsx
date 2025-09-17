
'use client';
import { BottomBar } from "@/components/layout/bottom-bar";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "../ui/button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between p-4 border-b">
          <div className="font-bold">AgriFlow ERP</div>
          <div>
            <span>Welcome, {user?.username} ({user?.role})</span>
            <Button variant="ghost" size="sm" onClick={logout} className="ml-4">Logout</Button>
          </div>
      </header>
      <main className="flex-1 p-4 md:p-6">{children}</main>
      <BottomBar />
    </div>
  );
}
