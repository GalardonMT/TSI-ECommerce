import Hero from "@/components/home/hero";
import FeaturedProduct from "@/components/home/featuredProducts";
import CategoryGrid from "@/components/home/categoryGrid"; 
import Incentives from "@/components/home/incentives";     

export default function Home() {
  return (
    <>
      <Hero />
      
      {/* Sección de Incentivos justo debajo del Hero para dar confianza inmediata */}
      <Incentives />

      {/* Productos Destacados */}
      <FeaturedProduct />

      {/* Categorías al final para seguir navegando */}
      <CategoryGrid />
    </>
  );
}

