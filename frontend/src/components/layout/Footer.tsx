import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#151515] text-white pt-16 pb-8 mt-auto border-t border-neutral-800">
      
      <div className="container mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
        
        {/* INFORMACIÓN */}
        <div>
          <h2 className="text-base font-bold uppercase tracking-widest mb-6 font-Sansation">Información</h2>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>
              <Link href="/about" className="hover:text-white transition-colors">Sobre Nosotros</Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors">Política de Privacidad</Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">Términos y Condiciones</Link>
            </li>
            <li className="flex items-start gap-2 pt-2">
              {/* Icono Map Pin (Línea -> stroke) */}
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-white fill-none stroke-current">
                <use xlinkHref="/sprites.svg#icon-map-pin" />
              </svg>
              <span>Carretera General San Martín 3047</span>
            </li>
            <li className="opacity-80 leading-relaxed text-xs">
              Horario: Lunes a Viernes, 9:00 - 18:00
            </li>
          </ul>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">Síguenos</p>
            <div className="flex gap-4">
              {/* Iconos Redes (Sólidos -> fill) */}
              <a href="#" className="hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6 fill-current text-white">
                  <use xlinkHref="/sprites.svg#instagram-icon" />
                </svg>
              </a>
              <a href="#" className="hover:opacity-80 transition-opacity">
                <svg className="w-6 h-6 fill-current text-white">
                  <use xlinkHref="/sprites.svg#facebook-icon" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* CONTACTO */}
        <div>
          <h2 className="text-base font-bold uppercase tracking-widest mb-6 font-Sansation">Contacto</h2>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <span className="block text-xs uppercase font-bold text-white mb-1">Email</span>
              <a href="mailto:contacto@ejemplo.com" className="hover:text-white transition-colors">contacto@ejemplo.com</a>
            </li>
            <li>
              <span className="block text-xs uppercase font-bold text-white mb-1">Teléfono</span>
              <a href="tel:+56912345678" className="hover:text-white transition-colors">+56 9 1234 5678</a>
            </li>
          </ul>
        </div>

        {/* SUSCRIBIRSE */}
        <div>
          <h2 className="text-base font-bold uppercase tracking-widest mb-6 font-Sansation">Suscribirse</h2>
          <p className="text-xs text-gray-400 mb-4">Recibe novedades y ofertas exclusivas.</p>
          
          <div className="flex flex-col gap-3">
            <input 
              type="email" 
              placeholder="Ingresa tu correo" 
              className="w-full bg-white text-black px-4 py-3 text-sm outline-none placeholder-gray-500 border-none"
            />
            {/* Botón con el Gris #151515 */}
            <button className="w-full bg-[#151515] border border-white text-white px-4 py-3 font-bold hover:bg-white hover:text-[#151515] transition-colors uppercase text-xs tracking-widest">
              SUSCRIBIRSE
            </button>
          </div>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="container mx-auto px-6 md:px-16 mt-16 pt-8 border-t border-neutral-800 text-center">
        <p className="text-xs text-gray-600">
          &copy; {new Date().getFullYear()} Pro Nano Chile. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}