"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  dashboard: (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <path d="M3 3h18v18H3z" />
      <path d="M3 9h18M9 3v18" strokeWidth="1.5" />
    </svg>
  ),
  company: (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <path d="M4 3h16v16H4z" />
      <path d="M4 9h16M10 3v16" strokeWidth="1.5" />
    </svg>
  ),
  goal: (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" strokeWidth="1.5" />
    </svg>
  ),
  workflow: (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <path d="M3 6h4v4H3zM8 8h8M15 6h4v4h-4M3 14h4v4H3zM8 16h8M15 14h4v4h-4" strokeWidth="1.5" />
    </svg>
  ),
  agents: (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <circle cx="12" cy="7" r="3" />
      <path d="M6 20c0-2.2 2.7-4 6-4s6 1.8 6 4" strokeWidth="1.5" />
    </svg>
  ),
  myAgents: (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21c0-2.2 2.7-4 7-4s7 1.8 7 4" strokeWidth="1.5" />
      <path d="M3 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zM17 10c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2z" strokeWidth="1" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3m0 14v3M22 12h-3m-14 0H2M19 5l-2.1 2.1m-10.8 10.8L5 19M5 5l2.1 2.1m10.8 10.8L19 19" strokeWidth="1.5" />
    </svg>
  ),
  billing: (
    <svg viewBox="0 0 24 24" className="nav-icon">
      <path d="M3 6h18v12H3z" />
      <path d="M3 10h18M12 6v12" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="2" strokeWidth="1.5" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/companies", label: "Companies", icon: "company" },
  { href: "/goals", label: "Goals", icon: "goal" },
  { href: "/workflows", label: "Workflows", icon: "workflow" },
  { href: "/agents", label: "Agents", icon: "agents" },
  { href: "/my-agents", label: "My Agents", icon: "myAgents" },
  { href: "/settings", label: "Settings", icon: "settings" },
  { href: "/billing", label: "Billing", icon: "billing" },
];

export function AppNavigation() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="sidebar-section">
      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-item ${isActive(item.href) ? "nav-item-active" : ""}`}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          {ICONS[item.icon as keyof typeof ICONS]}
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
