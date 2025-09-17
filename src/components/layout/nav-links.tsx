'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Archive, Factory, ShoppingCart, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/store', label: 'Store', icon: Archive },
  { href: '/production', label: 'Production', icon: Factory },
  { href: '/sales', label: 'Sales', icon: ShoppingCart },
  { href: '/invoices', label: 'Invoices', icon: FileText },
];

export function NavLinks({ className, itemClassName }: { className?: string; itemClassName?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex items-center justify-around", className)}>
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            href={link.href}
            key={link.href}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-md text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:bg-muted",
              itemClassName
            )}
          >
            <link.icon className="h-5 w-5" />
            <span className="text-xs">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
