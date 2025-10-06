"use client"

import { SidebarContent } from "./SidebarContent"

interface DesktopSidebarProps {
  userName: string
  onLogout: () => void
}

export function DesktopSidebar({ userName, onLogout }: DesktopSidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-gray-200 p-4">
      <SidebarContent userName={userName} onLogout={onLogout} />
    </aside>
  )
}
