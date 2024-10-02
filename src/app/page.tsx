'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, ChevronLeft, ChevronRight, X } from 'lucide-react'

interface Slide {
  title: string;
  description: string;
  image: string;
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Registrarme / Iniciar sesión</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Bienvenido a Recovery Care Solutions</h3>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            placeholder="Email"
          />
        </div>
        <button className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition duration-300">
          Continuar
        </button>
      </div>
    </div>
  )
}

const Component: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState<number>(0)
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const sliderRef = useRef<HTMLDivElement>(null)
  const dragStartX = useRef<number>(0)
  const dragStartY = useRef<number>(0)
  const draggedDistance = useRef<number>(0)
  const isDragging = useRef<boolean>(false)

  const slides: Slide[] = [
    {
      title: '¡Conectamos pacientes con casas de recuperación en todo el mundo!',
      description: 'Encuentra el lugar perfecto para tu recuperación, adaptado a tus necesidades y preferencias específicas.',
      image: '/0.png'
    },
    {
      title: 'Cuidado personalizado para cada paciente',
      description: 'Nuestros servicios se adaptan a tus necesidades médicas específicas para una recuperación óptima.',
      image: '/0.png'
    },
    {
      title: 'Red global de centros de recuperación',
      description: 'Accede a una amplia red de centros de recuperación de alta calidad en todo el mundo.',
      image: '/0.png'
    },
    {
      title: 'Apoyo durante todo el proceso',
      description: 'Te acompañamos en cada paso, desde la planificación hasta la recuperación completa.',
      image: '/placeholder.svg?height=400&width=400'
    }
  ]

  const totalSlides = slides.length

  useEffect(() => {
    const timer = setInterval(() => {
      if (!isDragging.current) {
        nextSlide()
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides)
    }
  }

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true)
      setCurrentSlide((prevSlide) => (prevSlide - 1 + totalSlides) % totalSlides)
    }
  }

  useEffect(() => {
    if (isTransitioning && sliderRef.current) {
      const transitionEndHandler = () => {
        setIsTransitioning(false)
        if (currentSlide === totalSlides - 1) {
          sliderRef.current!.style.transition = 'none'
          setCurrentSlide(0)
          setTimeout(() => {
            sliderRef.current!.style.transition = 'transform 0.5s ease-in-out'
          }, 50)
        } else if (currentSlide === 0) {
          sliderRef.current!.style.transition = 'none'
          setCurrentSlide(totalSlides - 1)
          setTimeout(() => {
            sliderRef.current!.style.transition = 'transform 0.5s ease-in-out'
          }, 50)
        }
      }

      sliderRef.current.addEventListener('transitionend', transitionEndHandler)
      return () => {
        sliderRef.current?.removeEventListener('transitionend', transitionEndHandler)
      }
    }
  }, [currentSlide, isTransitioning, totalSlides])

  const getSlides = (): Slide[] => {
    return [
      slides[slides.length - 1],
      ...slides,
      slides[0]
    ]
  }

  const handleDragStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    isDragging.current = true
    if ('touches' in e) {
      dragStartX.current = e.touches[0].clientX
      dragStartY.current = e.touches[0].clientY
    } else {
      dragStartX.current = e.clientX
      dragStartY.current = e.clientY
    }
    draggedDistance.current = 0
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'none'
    }
  }

  const handleDragMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging.current) return
    let clientX: number, clientY: number
    if ('touches' in e) {
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }
    const deltaX = clientX - dragStartX.current
    const deltaY = clientY - dragStartY.current
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      e.preventDefault()
      draggedDistance.current = deltaX
      if (sliderRef.current) {
        const translateX = -((currentSlide + 1) * 100) + (draggedDistance.current / sliderRef.current.offsetWidth) * 100
        sliderRef.current.style.transform = `translateX(${translateX}%)`
      }
    }
  }

  const handleDragEnd = () => {
    isDragging.current = false
    if (sliderRef.current) {
      sliderRef.current.style.transition = 'transform 0.5s ease-in-out'
    }
    if (Math.abs(draggedDistance.current) > 100) {
      if (draggedDistance.current > 0) {
        prevSlide()
      } else {
        nextSlide()
      }
    } else {
      if (sliderRef.current) {
        sliderRef.current.style.transform = `translateX(-${(currentSlide + 1) * 100}%)`
      }
    }
  }

  return (
    <div className="bg-sky-100 min-h-screen">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sky-600 rounded-md"></div>
            <span className="text-sky-600 font-semibold">Recovery Care Solutions</span>
          </div>
          <div className="flex space-x-4">
            <button 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
              onClick={() => setIsModalOpen(true)}
            >
              Registrarse
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md">Iniciar sesión</button>
          </div>
        </div>
      </header>
      <nav className="bg-slate-800 text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <span className="font-medium">Escoge el motivo médico de tu viaje</span>
            <div className="flex space-x-6">
              {['Cirugía plástica', 'Cirugía bariátrica', 'Implante capilar', 'Salud mental', 'Rehabilitación', 'Otro'].map((item) => (
                <button key={item} className="text-sm hover:text-sky-300">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="grid grid-cols-4 gap-4 flex-grow mr-4">
            {[
              { label: 'Lugar', placeholder: '¿Dónde deseas recuperarte?' },
              { label: 'Llegada', placeholder: 'Agrega fecha' },
              { label: 'Salida', placeholder: 'Agrega fecha' },
              { label: 'Quién', placeholder: 'Agrega pacientes' }
            ].map(({ label, placeholder }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-300 focus:ring focus:ring-sky-200 focus:ring-opacity-50"
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
          <button className="p-2 bg-sky-600 text-white rounded-full hover:bg-sky-700">
            <Search className="w-6 h-6" />
          </button>
        </div>
        <div className="relative overflow-hidden">
          <div 
            ref={sliderRef}
            className="flex touch-pan-y"
            style={{ transform: `translateX(-${(currentSlide + 1) * 100}%)` }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
          >
            {getSlides().map((slide, index) => (
              <div key={index} className="w-full flex-shrink-0">
                <div className="flex items-center">
                  <div className="w-1/2 pr-8">
                    <h1 className="text-4xl font-bold text-slate-800 mb-4">
                      {slide.title}
                    </h1>
                    <p className="text-lg text-gray-600 mb-6">
                      {slide.description}
                    </p>
                    <Link href="/ver-mas" className="px-6 py-3 bg-sky-600 text-white rounded-md hover:bg-sky-700 inline-block">
                      Ver más
                    </Link>
                  </div>
                  <div className="w-1/2">
                    <Image
                      src={slide.image}
                      alt={`Slide ${index}`}
                      width={400}
                      height={400}
                      className="rounded-lg"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button 
            onClick={prevSlide} 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md hover:bg-opacity-75"
          >
            <ChevronLeft className="w-6 h-6 text-sky-600" />
          </button>
          <button 
            onClick={nextSlide} 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 p-2 rounded-full shadow-md hover:bg-opacity-75"
          >
            <ChevronRight className="w-6 h-6 text-sky-600" />
          </button>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-2 mb-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full ${
                  currentSlide === index ? 'bg-sky-600' : 'bg-sky-300'
                }`}
              />
            ))}
          </div>
        </div>
      </main>
      <RegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}

export default Component