import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-[#151515] text-white pt-16 pb-8 mt-auto border-t border-neutral-800">
      <div className="container mx-auto px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-12 text-left justify-items-center">
        
        {/* INFORMACIÓN */}
        <div className="w-full max-w-xs"> 
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
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-white fill-none stroke-current">
                <use xlinkHref="/sprites.svg#icon-map-pin" />
              </svg>
              <span>Carretera General San Martín 3047</span>
            </li>
            <li className="opacity-80 leading-relaxed text-xs">
              {/* Horario: Lunes a Viernes, 9:00 - 18:00 */}
            </li>
          </ul>

          <div className="mt-8">
            <p className="text-xs font-bold uppercase tracking-wider text-white mb-4">Síguenos</p>
            <div className="flex gap-4">
              <a 
                href="https://www.instagram.com/pronanochile/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:opacity-80 transition-opacity"
              >
                <svg className="w-6 h-6 fill-current text-white">
                  <use xlinkHref="/sprites.svg#instagram-icon" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* CONTACTO */}
        <div className="w-full max-w-xs">
          <h2 className="text-base font-bold uppercase tracking-widest mb-6 font-Sansation">Contacto</h2>
          <ul className="space-y-4 text-sm text-gray-400">
            <li>
              <span className="block text-xs uppercase font-bold text-white mb-1">Perla Cid</span>
              <a href="mailto:Perla.cid@pronanochile.cl" className="hover:text-white transition-colors">Perla.cid@pronanochile.cl</a>
            </li>
            <li>
              <span className="block text-xs uppercase font-bold text-white mb-1">Felipe Saffie</span>
              <a href="mailto:Felipe.saffie@pronanochile.cl" className="hover:text-white transition-colors">Felipe.saffie@pronanochile.cl</a>
            </li>
            <li>
              <span className="block text-xs uppercase font-bold text-white mb-1">Contacto General</span>
              <a href="mailto:Contacto@pronanochile.cl" className="hover:text-white transition-colors">Contacto@pronanochile.cl</a>
            </li>
          </ul>
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