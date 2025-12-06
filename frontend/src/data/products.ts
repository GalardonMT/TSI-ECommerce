// src/data/products.ts

export type Product = {
  id: string;
  subtitle: string;
  title: string;
  description: string;
  details: string;
  imageSrc: string;
  imageAlt: string;
  href?: string;
  price?: string;
  images?: string[]; // <--- NUEVO: Array opcional de imágenes
};

export const productsData: Product[] = [
  {
    id: "sc13-graphene",
    subtitle: "Recubrimiento Cerámico de Grafeno",
    title: "SC13 SUPER GRAPHENE",
    description: "Resalta el color y la pintura con brillo HDR...",
    details: "Protección de hasta +5 años...",
    imageSrc: "/SC13.jpg",
    imageAlt: "Botella SC13",
    href: "/products/sc13-graphene",
    price: "$15.000",
    // AGREGAMOS LAS IMÁGENES AQUÍ (Usa tus nombres de archivo reales)
    images: ["/SC13.jpg", "/SuperCoat.jpg", "/T05.png", "/1.png"],
  },
  {
    id: "t05-textile",
    subtitle: "Proteccion Textil Nano",
    title: "T05 TEXTILE PROTECTION",
    description: "Potente repelente de manchas...",
    details: "Impide que suciedad, líquidos y moho penetren...",
    imageSrc: "/T05.png",
    imageAlt: "Botella T05",
    href: "/productos/t05-textile",
    price: "$6.000",
    images: ["/T05.png", "/SC13.jpg", "/SuperCoat.jpg"], // Ejemplo
  },
  {
    id: "super-coat",
    subtitle: "Recubrimiento Cerámico Nano",
    title: "SUPER COAT",
    description: "Fácil de aplicar...",
    details: "Brillo profundo y alta hidrofobia...",
    imageSrc: "/SuperCoat.jpg",
    imageAlt: "Botella Super Coat",
    href: "/productos/super-coat",
    price: "$8.000",
    images: ["/SuperCoat.jpg", "/SC13.jpg"], // Ejemplo
  },
  {
    id: "glass-coating",
    subtitle: "Nano Repelente de Lluvia",
    title: "GLASS COATING",
    description: "Alto rendimiento repelente...",
    details: "Mejora visibilidad...",
    imageSrc: "/CoatingGlass.jpg",
    imageAlt: "Aplicador Glass Coating",
    href: "/productos/glass-coating",
    price: "$5.000",
    images: ["/CoatingGlass.jpg"], // Ejemplo
  },
];