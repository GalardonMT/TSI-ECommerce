"use client";
import { useState } from "react";
import { productsData, type Product } from '@/data/products';
import ProductList from "@/components/products/productList";
import SideBar from "@/components/products/sideBar"; 

export default function ProductPage() {
  const [selectedCategory,  setSelectedCategory] = useState([]);

  return (  
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-left mb-12">Productos</h1>
      <div className=" flex-col lg:flex-row gap-8">
        {/* --- Columna izquierda --- */}
        <SideBar />

        {/* --- Columna derecha --- */}
        <div className="w-full lg:w-3/4">
          <ProductList />
        </div>
      </div>
    </div>
  );
}
