"use client";

import { useState, useEffect } from "react";
import ProductList, { ProductFrontend } from "@/components/products/productList";
import FilterSidebar from "@/components/products/sideBar";

export default function ProductsPage() {
  // ESTADOS
  const [products, setProducts] = useState<ProductFrontend[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("default");

  // CARGAR DATOS DE DJANGO
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Categorías
        const resCat = await fetch("http://127.0.0.1:8000/api/inventario/categoria/");
        const dataCat = await resCat.json();
        const catNames = dataCat.map((c: any) => c.nombre);
        setCategories(catNames);

        // Productos
        const resProd = await fetch("http://127.0.0.1:8000/api/inventario/producto/");
        const dataProd = await resProd.json();
        
        // Procesar datos (Mapeo de Django a React)
        const formattedProducts = dataProd.map((item: any) => {
           let imagenUrl = "https://via.placeholder.com/300"; // Placeholder por defecto
           
           if (item.imagenes && item.imagenes.length > 0) {
             const ruta = item.imagenes[0].image || "";

             if (ruta.startsWith('http') || ruta.startsWith('data:')) {
               imagenUrl = ruta;
             } 
      
             else if (ruta.length > 300) {
               imagenUrl = `data:image/jpeg;base64,${ruta}`;
             }
            
             else {
               imagenUrl = `http://127.0.0.1:8000${ruta.startsWith('/') ? '' : '/'}${ruta}`;
             }
           }

           return {
             id: item.id_producto,
             title: item.nombre,
             price: item.precio, 
             imageSrc: imagenUrl,
             imageAlt: item.nombre,
             category: item.categoria_nombre || "Sin Categoría", 
           };
        });

        setProducts(formattedProducts);
        setLoading(false);

      } catch (error) {
        console.error("Error conectando con Django:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // LÓGICA DE FILTRADO Y ORDEN 
  const processedProducts = products
    .filter(product => {
      // Si no hay filtros, mostrar todo
      if (selectedCategories.length === 0) return true;
      // Comparamos con la categoría real de Django
      return selectedCategories.includes(product.category);
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price; 
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

  const handleFilterChange = (category: string | null) => {
    if (category === null) {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  if (loading) return <div className="text-center py-24"></div>;

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
        
        {/* --- Columna Izquierda (Sidebar) --- */}
        <FilterSidebar
          categories={categories} // Viene de la API ahora
          selectedCategories={selectedCategories}
          onFilterChange={handleFilterChange}
        />

        {/* --- Columna Derecha (Lista) --- */}
        <div className="w-full lg:w-3/4">
          <ProductList products={processedProducts} />
        </div>
      </div>
    </div>
  );
}