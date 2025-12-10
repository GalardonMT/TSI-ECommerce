"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { addCartItem } from "@/app/api/cart/addItem";

type ProductDetail = {
  id: number;
  title: string;
  description: string;
  price: string;
  imageSrc: string;
  imageAlt: string;
  details: string;
  stock: number;
  gallery: string[];
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "shipping">("description");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleAddToCart = async () => {
    if (!product) return;
    setAddError(null);
    setAdding(true);
    try {
      const resp = await addCartItem(product.id, 1);
      if (!resp.ok) {
        const detail = resp.data?.detail || "No se pudo agregar al carrito";
        setAddError(detail);
      } else {
        setProduct((prev) => (prev ? { ...prev, stock: Math.max(0, prev.stock - 1) } : prev));
      }
    } catch (err) {
      setAddError("Error de conexión al agregar al carrito");
    } finally {
      setAdding(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/inventario/producto/${id}/`);
        
        if (!res.ok) throw new Error("Producto no encontrado");
        
        const data = await res.json();

        let processedImages: string[] = [];
        
        if (data.imagenes && data.imagenes.length > 0) {
          processedImages = data.imagenes.map((img: any) => {
             const ruta = img.image || "";
            
             if (ruta.startsWith('http') || ruta.startsWith('data:')) {
               return ruta;
             } 
             else if (ruta.length > 300) {
               return `data:image/jpeg;base64,${ruta}`;
             }
             return `http://127.0.0.1:8000${ruta.startsWith('/') ? '' : '/'}${ruta}`;
          });
        } else {
          processedImages = ["/placeholder.png"]; 
        }

        const precioFormateado = new Intl.NumberFormat('es-CL', { 
            style: 'currency', 
            currency: 'CLP' 
        }).format(data.precio);

        setProduct({
            id: data.id_producto,
            title: data.nombre,
            description: data.descripcion || "Sin descripción corta.",
            price: precioFormateado,
            imageSrc: processedImages[0], 
            imageAlt: data.nombre,
            details: data.descripcion || "No hay detalles adicionales.",
            stock: data.stock_disponible,
            gallery: processedImages 
        });
        
        setSelectedImage(processedImages[0]);

      } catch (error) {
        console.error(error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="text-center py-20">Cargando producto...</div>;
  }

  if (!product) {
    return <div className="text-center py-20">Producto no encontrado</div>;
  }

  // Usamos la imagen seleccionada o la principal si falla algo
  const currentImage = selectedImage || product.imageSrc;

  return (
    <div className="container mx-auto py-12 px-4 md:px-8">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        
        {/* COLUMNA IZQUIERDA */}
        <div className="flex flex-col gap-4">
          
          {/* 1. IMAGEN PRINCIPAL */}
          <div className="relative w-full aspect-square bg-gray-200 overflow-hidden flex items-center justify-center">
            {currentImage ? (
              <Image
                src={currentImage}
                alt={product.imageAlt}
                fill
                className="object-cover object-center" 
                priority
                unoptimized={true} 
              />
            ) : (
              <span className="text-gray-400 text-sm">Sin imagen disponible</span>
            )}
          </div>
          
          {/* 2. MINIATURAS */}
          <div className="grid grid-cols-4 gap-4 w-full">
            {product.gallery.map((imgUrl, index) => (
              <button 
                key={index} 
                onClick={() => setSelectedImage(imgUrl)} // Hacemos clicable la miniatura
                className={`relative aspect-square bg-gray-200 overflow-hidden border-2 transition-all flex items-center justify-center ${
                    selectedImage === imgUrl ? "border-black" : "border-transparent hover:border-black"
                }`}
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
            {addError && (
              <p className="text-sm text-red-600 mb-1">{addError}</p>
            )}
            <button
              disabled={adding || product.stock <= 0}
              onClick={handleAddToCart}
              className="w-full py-3 px-6 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
            >
              {adding ? "Agregando..." : product.stock <= 0 ? "Sin stock" : "Agregar al carro"}
            </button>
            <button className="w-full py-3 px-6 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors shadow-sm">
              Comprar ahora
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">Stock disponible: {product.stock}</p>
        </div>
      </div>

      {/* --- SECCIÓN INFERIOR - TABS --- */}
      <div className="mt-12">
        
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

        <div className="min-h-[100px]">
          
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