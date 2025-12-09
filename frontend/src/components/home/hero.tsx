"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const SLIDES = [
  {
    id: 1,
    image: "/1.png", 
    alt: "Detailing auto negro",
    title: "DESCUBRE TODOS\nNUESTROS PRODUCTOS",
    hasButton: true,
    buttonText: "VER CATÁLOGO",
    buttonLink: "/products"
  },
  {
    id: 2,
    background: "bg-neutral-900", 
    alt: "Oferta especial",
    title: "PROTECCIÓN\nCERÁMICA AVANZADA",
    subtitle: "TECNOLOGÍA NANO",
    hasButton: false
  }
];

export default function Hero() {
  const plugin = React.useRef(
    Autoplay({ delay: 10000, stopOnInteraction: false })
  );

  return (
    <section className="relative -translate-y-20 w-full group">
      <Carousel
        plugins={[plugin.current]}
        opts={{
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="h-[600px] md:h-[700px] lg:h-[850px]">
          {SLIDES.map((slide) => (
            <CarouselItem key={slide.id} className="relative w-full h-full">
              
              {/* --- FONDO --- */}
              <div className="absolute inset-0">
                {slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover brightness-[0.60]" // Oscurecer para leer texto
                    priority={slide.id === 1}
                  />
                ) : (
                  <div className={`w-full h-full ${slide.background}`} />
                )}
              </div>

              {/* --- CONTENIDO CENTRADO --- */}
              <div className="relative z-10 h-full flex items-center justify-center">
                <div className="container mx-auto px-4 flex flex-col items-center text-center">
                  
                  {/* Subtítulo */}
                  {slide.subtitle && (
                    <p className="text-white text-sm md:text-base font-bold tracking-[0.3em] mb-6 uppercase opacity-90 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                      {slide.subtitle}
                    </p>
                  )}

                  {/* Título */}
                  <h1 className="text-4xl md:text-6xl lg:text-7xl uppercase text-white leading-[1.1] tracking-wide whitespace-pre-line font-Sansation drop-shadow-lg max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000">
                    {slide.title}
                  </h1>

                  {/* Botón (Cuadrado, sin rounded) */}
                  {slide.hasButton && (
                    <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                      <Link href={slide.buttonLink || '#'}>
                        <button className="bg-white text-black px-10 py-4 text-sm font-bold uppercase tracking-widest hover:bg-amber-200 transition-transform duration-300 hover:scale-105 shadow-xl rounded-none">
                          {slide.buttonText}
                        </button>
                      </Link>
                    </div>
                  )}

                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <CarouselPrevious 
          variant="ghost"
          className="left-4 md:left-10 rounded-none border-none text-white/40 hover:text-white hover:bg-transparent h-20 w-20 [&_svg]:size-16 transition-all" 
        />
        
        <CarouselNext 
          variant="ghost"
          className="right-4 md:right-10 rounded-none border-none text-white/40 hover:text-white hover:bg-transparent h-20 w-20 [&_svg]:size-16 transition-all" 
        />
      
      </Carousel>
    </section>
  );
}