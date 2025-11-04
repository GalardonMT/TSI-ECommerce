import React from 'react';
import Image from "next/image";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

// Array con la información de los slides 
const SLIDES = [
  {
    id: 1,
    image: "/1.png",
    alt: "Info slide 1",
    title: "Descubre todos nuestros productos"
  },
  {
    id: 2,
    background: "bg-neutral-800",
    alt: "Info slide 2",
    title: "Hola"
  }
];

export default function Hero() {
  return (
    <section className="relative -translate-y-20 w-full">
      <Carousel
      opts={{loop: true}}
      className="w-full"
      >
        <CarouselContent className="h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px]">
          {SLIDES.map((slide) => (
            <CarouselItem 
              key={slide.id} 
              className="relative h-[400px] sm:h-[500px] lg:h-[600px] xl:h-[700px]"
            >
              {/* Fondo */}
              <div className="absolute inset-0">
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    priority={slide.id === 1}
                  />
                ) : (
                  // Fondo por defecto si es que no tiene imagen 
                  <div className={`w-full h-full ${slide.background}`} />
                )}
              </div>

              {/* Contenido del slide */}
              <div className="relative z-10 h-full flex items-center">
                <div className="container px-4 sm:px-6 lg:px-8">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold uppercase text-white text-left leading-tight">
                    {slide.title.split(' ').map((word, i, arr) => (
                      <React.Fragment key={i}>
                        {word}
                        {i < arr.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h1>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  )
}