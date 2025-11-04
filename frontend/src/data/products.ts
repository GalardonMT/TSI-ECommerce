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
    href: "/productos/sc13-graphene",
    price: "$15.000",
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
  },
];