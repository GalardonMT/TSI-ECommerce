"use client"; 

import { useState } from "react";
import { productsData, type Product } from '@/data/products';
import ProductList from "@/components/products/productList";
import FilterSidebar from "@/components/products/sideBar"; 

function parsePrice(priceStr: string | undefined): number {
  if (!priceStr) return 0;
  return parseFloat(priceStr.replace('$', '').replace(/\./g, ''));
}

export default function ProductsPage() { 

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("default");
  const categories = Array.from(new Set(productsData.map(p => p.subtitle)));

  // Filtra y ordena la lista de productos
  const processedProducts = productsData
    .filter(product => {
      // Lógica del Filtro
      if (selectedCategories.length === 0) {
        return true; // Muestra todos si no hay filtro
      }
      return selectedCategories.includes(product.subtitle);
    })
    .sort((a, b) => {
      // Lógica de Orden
      switch (sortOption) {
        case 'price-asc':
          return parsePrice(a.price) - parsePrice(b.price);
        case 'price-desc':
          return parsePrice(b.price) - parsePrice(a.price);
        default:
          return 0; // Orden por defecto
      }
    });

  const handleFilterChange = (category: string | null) => {
    
    if (category === null) {
      setSelectedCategories([]);
      return;
    }

    // Lógica para marcar/desmarcar el checkbox específico
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category) // Quitar
        : [...prev, category]              // Añadir
    );
  };

  return ( 
    <div className="container mx-auto py-16 px-4">
      
      {/* Título y Dropdown de Orden */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold text-left">Productos</h1>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="border border-gray-300 rounded-md p-2 text-sm"
        >
          <option value="default">Más Popular</option>
          <option value="price-asc">Precio: Menor a Mayor</option>
          <option value="price-desc">Precio: Mayor a Menor</option>
        </select>
      </div>

      {/* Layout de 2 Columnas */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* --- Columna Izquierda --- */}
        <FilterSidebar
          categories={categories}
          selectedCategories={selectedCategories}
          onFilterChange={handleFilterChange}
        />

        {/* --- Columna Derecha --- */}
        <div className="w-full lg:w-3/4">
          <ProductList products={processedProducts} />
        </div>
      </div>
    </div>
  );
}