"use client";

import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';

type SearchProduct = {
  id: number;
  title: string;
  price: number;
  imageSrc: string;
  category: string;
};

type Category = {
  id_categoria: number;
  nombre: string;
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  
  const [openSearch, setOpenSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<SearchProduct[]>([]);
  const [filteredResults, setFilteredResults] = useState<SearchProduct[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [isProductsHover, setIsProductsHover] = useState(false);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProductsOpen, setMobileProductsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchToggleRef = useRef<HTMLButtonElement>(null);
  const cartRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isStuck, setIsStuck] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/inventario/categoria/')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setIsStuck(true);
      else setIsStuck(false);
    };
    if (!isHome) setIsStuck(true);
    else window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  useEffect(() => {
    if (openSearch && allProducts.length === 0) {
      setLoadingSearch(true);
      fetch('http://127.0.0.1:8000/api/inventario/producto/')
        .then(res => res.json())
        .then(data => {
          const formatted = data.map((item: any) => {
            let img = "https://via.placeholder.com/150";
            if (item.imagenes?.length > 0) {
              const r = item.imagenes[0].image;
              img = r.startsWith('http') ? r : `http://127.0.0.1:8000${r.startsWith('/')?'':'/'}${r}`;
            }
            return {
              id: item.id_producto,
              title: item.nombre,
              price: item.precio,
              imageSrc: img,
              category: item.categoria_nombre
            };
          });
          setAllProducts(formatted);
          setLoadingSearch(false);
        })
        .catch(err => setLoadingSearch(false));
    }
  }, [openSearch]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResults([]);
      return;
    }
    const lowerTerm = searchTerm.toLowerCase();
    const results = allProducts.filter(p => 
      p.title.toLowerCase().includes(lowerTerm) || 
      p.category?.toLowerCase().includes(lowerTerm)
    );
    setFilteredResults(results.slice(0, 5));
  }, [searchTerm, allProducts]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) setMobileMenuOpen(false);
    }
    if (open || mobileMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, mobileMenuOpen]);

  useEffect(() => {
    if (openSearch && searchInputRef.current) searchInputRef.current.focus();
  }, [openSearch]);

  return (
    <>
      <header 
        className={`fixed top-0 left-0 w-full z-50 transition-colors duration-500 ease-in-out h-18 ${
          isStuck ? 'bg-[#151515]/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        } text-white`}
      >
        <div className="w-full px-6 lg:px-16 h-full flex justify-between lg:grid lg:grid-cols-3 items-center max-w-[1920px] mx-auto">
            
            <div className="flex items-center">
                <button 
                    className="lg:hidden mr-4"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <svg className="w-8 h-8 stroke-current fill-none">
                        <use xlinkHref="/sprites.svg#icon-menu" />
                    </svg>
                </button>

                <nav className="hidden lg:flex justify-start items-center gap-8 text-base font-medium tracking-wide">
                    <Link href="/" className="hover:text-gray-300 transition-colors">Inicio</Link>
                    
                    <div 
                        className="relative h-full flex items-center"
                        onMouseEnter={() => setIsProductsHover(true)}
                        onMouseLeave={() => setIsProductsHover(false)}
                    >
                        <button className="flex items-center gap-1 hover:text-gray-300 transition-colors py-6">
                            Productos
                            <svg className={`w-4 h-4 transition-transform stroke-current fill-none ${isProductsHover ? 'rotate-180' : ''}`}>
                                <use xlinkHref="/sprites.svg#icon-chevron-down" />
                            </svg>
                        </button>

                        <div className={`absolute top-full left-0 bg-white text-gray-800 shadow-xl min-w-[200px] py-2 transition-all duration-200 origin-top ${isProductsHover ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                            <div className="flex flex-col">
                                <Link href="/products" className="px-5 py-2 hover:bg-gray-100 font-bold hover:text-[#151515] transition-colors text-left border-b border-gray-100 text-sm">Ver todo</Link>
                                {categories.map((cat) => (
                                    <button key={cat.id_categoria} onClick={() => router.push(`/products`)} className="px-5 py-2 hover:bg-gray-100 hover:text-[#151515] transition-colors text-left text-sm">
                                        {cat.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Link href="/contacto" className="hover:text-gray-300 transition-colors">Contacto</Link>
                </nav>
            </div>

            <div className="flex justify-center">
                <Link href="/" className="text-3xl md:text-4xl font-bold tracking-[0.2em] font-Sansation whitespace-nowrap hover:opacity-90 transition-opacity">
                    PRO NANO
                </Link>
            </div>

            <div className="flex justify-end items-center gap-4 lg:gap-6">
                
                <button ref={searchToggleRef} onClick={() => setOpenSearch(true)} className="hover:text-gray-300 transition-transform hover:scale-105">
                    <svg className="w-6 h-6 stroke-current fill-none"><use xlinkHref="/sprites.svg#icon-search" /></svg>
                </button>
                
                <div className="relative hidden lg:block" ref={dropdownRef}>
                    <button onClick={() => setOpen(!open)} className="hover:text-gray-300 transition-transform hover:scale-105 flex items-center">
                         <svg className="w-6 h-6 stroke-current fill-none"><use xlinkHref="/sprites.svg#icon-user" /></svg>
                         {user && <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-black transform translate-x-1 -translate-y-1"></span>}
                    </button>
                    {open && (
                        <div className="absolute right-0 mt-6 w-72 bg-white text-gray-800 rounded shadow-xl p-5 z-50 text-left">
                             <form className="space-y-3">
                                {user ? (
                                    <>
                                        <div className="text-sm border-b pb-2 mb-2">Conectado como <br/><span className="font-bold">{user.email}</span></div>
                                        <button type="button" onClick={() => {setUser(null); setOpen(false);}} className="w-full text-left text-sm hover:text-red-600 transition font-semibold">Cerrar Sesión</button>
                                    </>
                                ) : (
                                    <>
                                        <div><label className="text-xs font-bold uppercase text-gray-500">Email</label><input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full border-b border-gray-300 focus:border-[#151515] py-1 outline-none text-sm"/></div>
                                        <div><label className="text-xs font-bold uppercase text-gray-500">Contraseña</label><input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full border-b border-gray-300 focus:border-[#151515] py-1 outline-none text-sm"/></div>
                                        <button type="button" onClick={async()=>{setLoggingIn(true); try{setUser({email});setOpen(false);}catch{} setLoggingIn(false);}} className="w-full bg-[#151515] text-white text-sm font-bold py-2 mt-2 hover:bg-zinc-800 transition">INICIAR SESIÓN</button>
                                        <div className="text-xs text-center mt-2 text-gray-500"><Link href="/register" className="hover:underline font-medium">Crear cuenta</Link></div>
                                    </>
                                )}
                             </form>
                        </div>
                    )}
                </div>

                <button onClick={() => setCartOpen(true)} className="hover:text-gray-300 transition-transform hover:scale-105 relative">
                     <svg className="w-6 h-6 stroke-current fill-none"><use xlinkHref="/sprites.svg#icon-cart" /></svg>
                </button>
            </div>
        </div>

        <div ref={searchRef} className={`absolute top-0 left-0 w-full bg-white text-black shadow-xl z-40 transition-transform duration-300 ease-out ${openSearch ? 'translate-y-0' : '-translate-y-full'}`}>
             <div className="container mx-auto px-4 py-6 flex flex-col items-center">
                 <div className="flex items-center w-full max-w-3xl relative">
                    <div className="relative w-full">
                        <input ref={searchInputRef} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="buscar en nuestra tienda" className="w-full border border-gray-300 py-2 pl-5 pr-10 text-sm outline-none focus:border-[#151515] transition-colors placeholder-gray-400 font-normal bg-transparent"/>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"><svg className="w-4 h-4 stroke-current fill-none"><use xlinkHref="/sprites.svg#icon-search" /></svg></div>
                    </div>
                    <button onClick={()=>{setOpenSearch(false); setSearchTerm('')}} className="ml-4 text-gray-400 hover:text-[#151515] transition-colors"><svg className="w-5 h-5 stroke-current fill-none"><use xlinkHref="/sprites.svg#icon-close" /></svg></button>
                 </div>
                 {searchTerm && (
                    <div className="w-full max-w-5xl mt-8 grid grid-cols-2 md:grid-cols-5 gap-6 animate-in fade-in slide-in-from-top-4">
                        {filteredResults.length > 0 ? filteredResults.map((prod) => (
                            <Link key={prod.id} href={`/products/${prod.id}`} onClick={()=>setOpenSearch(false)} className="group text-left transition-opacity duration-200 hover:opacity-60">
                                <div className="aspect-square bg-gray-100 mb-2 relative overflow-hidden">
                                    <Image src={prod.imageSrc} alt={prod.title} fill className="object-cover" unoptimized={true}/>
                                </div>
                                <div className="text-sm font-medium line-clamp-2 leading-tight text-black group-hover:text-gray-600">{prod.title}</div>
                                <div className="text-sm text-gray-500 mt-1">${prod.price.toLocaleString("es-CL")}</div>
                            </Link>
                        )) : (<div className="col-span-full text-center text-gray-400 py-8 text-sm">No encontramos resultados.</div>)}
                    </div>
                 )}
             </div>
        </div>
      </header>
      
      <div ref={mobileMenuRef} className={`fixed top-0 left-0 h-full w-80 bg-white text-black z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="flex flex-col h-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <span className="font-bold text-xl font-Sansation tracking-widest">MENÚ</span>
                <button onClick={() => setMobileMenuOpen(false)}><svg className="w-6 h-6 stroke-current fill-none"><use xlinkHref="/sprites.svg#icon-close" /></svg></button>
            </div>
            <nav className="flex-1 overflow-y-auto p-6 space-y-6 text-lg font-medium">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">Inicio</Link>
                <div>
                    <button onClick={() => setMobileProductsOpen(!mobileProductsOpen)} className="flex items-center justify-between w-full hover:text-gray-600">
                        Productos
                        <svg className={`w-4 h-4 transition-transform stroke-current fill-none ${mobileProductsOpen ? 'rotate-180' : ''}`}><use xlinkHref="/sprites.svg#icon-chevron-down" /></svg>
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${mobileProductsOpen ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="flex flex-col space-y-4 pl-4 text-base text-gray-600 border-l border-gray-200 ml-1">
                            <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="font-bold text-black">Ver Todo</Link>
                            {categories.map((cat) => (
                                <button key={cat.id_categoria} onClick={() => {router.push('/products'); setMobileMenuOpen(false)}} className="text-left hover:text-black">
                                    {cat.nombre}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <Link href="/contacto" onClick={() => setMobileMenuOpen(false)} className="block hover:text-gray-600">Contacto</Link>
                
                <div className="pt-6 border-t border-gray-100 mt-6">
                    {user ? (
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Hola, {user.email}</p>
                            <button onClick={() => {setUser(null); setMobileMenuOpen(false);}} className="text-red-600 text-base">Cerrar sesión</button>
                        </div>
                    ) : (
                        <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                            <svg className="w-5 h-5 stroke-current fill-none"><use xlinkHref="/sprites.svg#icon-user" /></svg>
                            Iniciar Sesión
                        </Link>
                    )}
                </div>
            </nav>
         </div>
      </div>

      <div ref={cartRef} className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
         <div className="h-full flex flex-col p-6">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold font-Sansation tracking-wide text-black">CARRITO</h2>
                <button onClick={() => setCartOpen(false)} className="text-black"><svg className="w-6 h-6 stroke-current fill-none"><use xlinkHref="/sprites.svg#icon-close" /></svg></button>
            </div>
            <div className="flex-1 flex items-center justify-center text-gray-400 text-base font-medium">Tu carrito está vacío.</div>
            <button onClick={()=>router.push('/cart')} className="w-full bg-[#151515] text-white py-3 font-bold tracking-widest hover:bg-zinc-800 transition text-base">VER CARRITO</button>
         </div>
      </div>
    </>
  );
}