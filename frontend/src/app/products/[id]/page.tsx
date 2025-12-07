"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
// import { productsData } from "@/data/products"; // <--- YA NO USAMOS ESTO

// Definimos el tipo de datos que esperamos usar en tu diseño
type ProductDetail = {
  id: number;
  title: string;
  description: string;
  price: string; // Lo guardaremos como string formateado ($15.000)
  imageSrc: string;
  imageAlt: string;
  details: string;
  stock: number;
  gallery: string[]; // Para las miniaturas
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  // ESTADOS
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"description" | "shipping">("description");

  // EFECTO: PEDIR DATOS A DJANGO
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/inventario/producto/${id}/`);
        
        if (!res.ok) throw new Error("Producto no encontrado");
        
        const data = await res.json();

        // 1. Procesar Imágenes (Principal y Galería)
        let processedImages: string[] = [];
        
        if (data.imagenes && data.imagenes.length > 0) {
          processedImages = data.imagenes.map((img: any) => {
             const ruta = img.image;
             return ruta.startsWith('http') 
               ? ruta 
               : `http://127.0.0.1:8000${ruta.startsWith('/') ? '' : '/'}${ruta}`;
          });
        } else {
          processedImages = ["https://via.placeholder.com/600"]; // Placeholder si no hay fotos
        }

        // 2. Formatear Precio (Django manda número, tu diseño espera texto bonito)
        const precioFormateado = new Intl.NumberFormat('es-CL', { 
            style: 'currency', 
            currency: 'CLP' 
        }).format(data.precio);

        // 3. Mapear datos de Django a TU estructura
        setProduct({
            id: data.id_producto,
            title: data.nombre,
            description: data.descripcion || "Sin descripción corta.",
            price: precioFormateado,
            imageSrc: processedImages[0], // La primera es la principal
            imageAlt: data.nombre,
            details: data.descripcion || "No hay detalles adicionales.", // Usamos la misma descripción para 'details'
            stock: data.stock_disponible,
            gallery: processedImages // Guardamos todas para las miniaturas
        });

      } catch (error) {
        console.error(error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // ESTADO DE CARGA (Para que no se rompa mientras busca)
  if (loading) {
    return <div className="text-center py-20">Cargando producto...</div>;
  }

  // SI NO EXISTE
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
          <div className="relative w-full aspect-square bg-gray-200 overflow-hidden flex items-center justify-center">
            {product.imageSrc ? (
              <Image
                src={product.imageSrc}
                alt={product.imageAlt}
                fill
                className="object-cover object-center" 
                priority
                unoptimized={true} // Agregado para permitir imagenes externas/django
              />
            ) : (
              <span className="text-gray-400 text-sm">Sin imagen disponible</span>
            )}
          </div>
          
          {/* 2. MINIATURAS (Ahora dinámicas según las fotos que tenga el producto) */}
          <div className="grid grid-cols-4 gap-4 w-full">
            {product.gallery.map((imgUrl, index) => (
              <button 
                key={index} 
                className="relative aspect-square bg-gray-200 overflow-hidden border-2 border-transparent hover:border-black transition-all flex items-center justify-center"
                // Aquí podrías agregar un onClick para cambiar la imagen principal si quisieras
              >
                 <Image
                    src={imgUrl}
                    alt={`Vista ${index + 1}`}
                    fill
                    className="object-cover object-center"
                    unoptimized={true}
                  />
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
          {/* Mostramos el stock real de Django */}
          <p className="mt-4 text-sm text-gray-500">Stock disponible: {product.stock}</p>
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