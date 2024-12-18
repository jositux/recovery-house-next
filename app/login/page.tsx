"use client"

import Image from "next/image"
import { LoginForm } from "@/components/forms/LoginForm"

export default function LoginPage() {

  return (
    <div className="bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto flex justify-center sm:w-full sm:max-w-md">
      <Image
                src="/assets/logo2.svg"
                alt="Recovery Care Solutions"
                width={180}
                height={80}
              />
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

