import { Button } from "@/components/ui/button"
import { ChevronDown } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


export function Header() {
  return (
    <header className="bg-[#4A7598] p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/logo.svg"
            alt="Recovery Care Solutions"
            width={180}
            height={60}
          />
        </Link>
        
        <div className="flex items-center gap-4">
          <span className="text-white">Hola, Juan</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                <span>Salir</span>
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>Mensajes</DropdownMenuItem>
              <DropdownMenuItem>Mis estadías</DropdownMenuItem>
              <DropdownMenuItem>Mi cuenta</DropdownMenuItem>
              <DropdownMenuItem>Centro de ayuda</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

