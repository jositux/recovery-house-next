"use client"

import Image from "next/image"
import styles from "./care-divider-section.module.css"

export function CareDividerSection() {
  return (
    <section className={`${styles.Care} relative overflow-hidden`}>
     
      {/* Images */}
      <div className="container mx-auto relative">
        {/* Hands image */}
        <div className="absolute left-[5%] top-0 w-20 h-20 md:w-24 md:h-24">
          <div className="relative w-full h-full">
            <Image
              src="/assets/care/0.jpg?height=100&width=100"
              alt="Caring hands"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Smiling man image */}
        <div className="absolute left-[25%] top-[20%] w-32 h-32 md:w-40 md:h-40">
          <div className="relative w-full h-full">
            <Image
              src="/assets/care/1.jpg?height=200&width=200"
              alt="Happy senior man"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Wheelchair interaction image */}
        <div className="absolute left-[45%] top-[10%] w-48 h-40 md:w-64 md:h-48">
          <div className="relative w-full h-full">
            <Image
              src="/assets/care/2.jpg?height=300&width=400"
              alt="People interacting"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Medical care image */}
        <div className="absolute right-[20%] top-[5%] w-24 h-24 md:w-32 md:h-32">
          <div className="relative w-full h-full">
            <Image
              src="/assets/care/3.jpg?height=150&width=150"
              alt="Medical care"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Patient care image */}
        <div className="absolute right-[5%] top-[40%] w-28 h-28 md:w-36 md:h-36">
          <div className="relative w-full h-full">
            <Image
              src="/assets/care/4.jpg?height=180&width=180"
              alt="Patient care"
              fill
              className="object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

