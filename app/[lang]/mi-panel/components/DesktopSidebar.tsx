"use client"

import { SidebarContent } from "./SidebarContent"

import { type Locale } from "@/lib/i18n" 

interface DesktopSidebarProps {
  userName: string;
  onLogout: () => void;
  lang: Locale; 
}

export function DesktopSidebar({ userName, lang, onLogout }: DesktopSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 p-4">
      <SidebarContent userName={userName} onLogout={onLogout} lang={lang} />
    </aside>
  )
}
