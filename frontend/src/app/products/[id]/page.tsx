"use client";

import { useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { productsData } from "@/data/products";

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const product = productsData.find((p) => p.id === id);

  const [activeTab, setActiveTab] = useState<"description" | "shipping">("description");

  if (!product) {
    return <div className="text-center py-20">Producto no encontrado</div>;
  }

  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      
      {/* --- SECCIÓN SUPERIOR --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="flex flex-col gap-4">
          
          {/* 1. IMAGEN PRINCIPAL */}
          <div className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
            {product.imageSrc ? (
              <Image
                src={product.imageSrc}
                alt={product.imageAlt}
                fill
                className="object-cover object-center" 
                priority
              />
            ) : (
              <span className="text-gray-400 text-sm">Sin imagen disponible</span>
            )}
          </div>
          
          {/* 2. MINIATURAS */}
          <div className="grid grid-cols-4 gap-4 w-full">
            {[1, 2, 3, 4].map((item) => (
              <button 
                key={item} 
                className="relative aspect-square bg-gray-200 rounded-md overflow-hidden border-2 border-transparent hover:border-black transition-all flex items-center justify-center"
              >
                {product.imageSrc ? (
                  <Image
                    src={product.imageSrc}
                    alt={`Vista ${item}`}
                    fill
                    className="object-cover object-center"
                  />
                ) : (
                  <span className="text-gray-300 text-xs">•</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA - INFORMACIÓN */}
        <div className="flex flex-col">
          <h1 className="text-3xl md:text-4xl font-normal text-gray-900 mb-2">
            {product.title}
          </h1>
          
          <p className="text-gray-500 text-sm mb-6">
            {product.description}
          </p>

          <div className="text-2xl font-bold text-gray-900 mb-8">
            {product.price}
          </div>

          <div className="space-y-3">
            <button className="w-full py-3 px-6 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Agregar al carro
            </button>
            <button className="w-full py-3 px-6 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors shadow-sm">
              Comprar ahora
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">Stock disponible: 10</p>
        </div>
      </div>

      {/* --- SECCIÓN INFERIOR - TABS --- */}
      <div className="mt-12">
        
        {/* Encabezados de los Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-4 px-6 text-sm font-medium transition-colors relative ${
              activeTab === "description"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Descripción y Detalles
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-4 px-6 text-sm font-medium transition-colors relative ${
              activeTab === "shipping"
                ? "text-black border-b-2 border-black"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Envíos
          </button>
        </div>

        {/* Contenido de los Tabs */}
        <div className="min-h-[100px]">
          
          {/* Contenido - Descripción */}
          {activeTab === "description" && (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 text-base leading-relaxed">
                {product.details}
              </p>
              <ul className="list-disc pl-5 mt-4 text-gray-500 text-sm space-y-1">
                <li>Garantía de calidad StorkCar.</li>
                <li>Envío seguro a todo el país.</li>
              </ul>
            </div>
          )}

          {/* Contenido - Envíos */}
          {activeTab === "shipping" && (
            <div className="text-gray-600 text-base">
              <p>Por definir</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}