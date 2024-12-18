"use client"

//import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Home } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
//import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
//import { LoginForm } from "@/components/forms/LoginForm"

export function Header() {
  //const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  
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
          <Button 
            variant="secondary" 
            className="bg-gray-800 text-white hover:bg-gray-700"
            asChild
          >
            <Link href="/register">Registrarse</Link>
          </Button>
          <Button 
            variant="secondary" 
            className="bg-gray-800 text-white hover:bg-gray-700"
            asChild
            /*onClick={() => setIsLoginDialogOpen(true)}*/
          >
            <Link href="/login">Ingresar</Link>
          </Button>
          {/*
          <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Iniciar sesión</DialogTitle>
              </DialogHeader>
              <LoginForm /> 
            </DialogContent>
          </Dialog>*/}
          <Button 
            variant="secondary" 
            className="bg-gray-800 text-white hover:bg-gray-700"
            asChild
          >
            <Link href="/register-property" className="flex items-center gap-2">
              Registra tu propiedad
              <Home className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

