export default function Footer() {
    return (
    <footer className="w-full h-96 bg-black text-white px-4 py-10 mt-auto">
        <div className="mb-4 grid grid-cols-3 gap-4 container mx-auto text-left">
          <div>
            <h2 className="text-2xl font-bold mb-2">Información</h2>
            <ul className="space-y-3">
              <li>
                <a href="">Sobre Nosotros</a>
              </li>
              <li>
                <a href="">Política de Privacidad</a>
              </li>
              <li>
                <a href="">Términos y Condiciones</a>
              </li>
              <li>
                <a href="">Carretera general San Martin 3047 </a>
                {/* Mover a Sprites.svg */}
                <svg className="inline-block" width="17" height="20" viewBox="0 0 17 20" xmlns="http://www.w3.org/2000/svg">
                  <use xlinkHref="/sprites.svg#icon-map-pin" width="17" height="20" stroke="white" strokeWidth="1"/>
                </svg>
              </li>
              <li>
                Horario de atención: Lunes a Viernes, 9:00 - 18:00
              </li>
            </ul>
          </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Contacto</h2>
            <ul className="space-y-3">
                <li>
                  <a href="mailto:contacto@ejemplo.com">contacto@ejemplo.com</a>
                </li>
                <li>
                  <a href="tel:+56912345678">+56 9 1234 5678</a>
                </li>
                <li>
                  Síguenos en redes sociales
                </li>
                <li>
                  <svg className="inline-block" width="40" height="40" viewBox="0 0 46 46" xmlns="http://www.w3.org/2000/svg">
                    <use xlinkHref="/sprites.svg#instagram-icon" stroke="white" strokeWidth="1"/>
                  </svg>
                  <svg className="inline-block ml-4" width="40" height="40" viewBox="0 0 27 46" xmlns="http://www.w3.org/2000/svg">
                    <use xlinkHref="/sprites.svg#facebook-icon" stroke="white" strokeWidth="1"/>
                  </svg>
                </li>
            </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-12">Suscribirse</h2>
          <button className="w-96 h-14 bg-white text-black px-4 py-2 hover:bg-gray-200 transition">Ingresa tu correo</button>
        </div>
      </div>
      <div className="container my-20 mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} Pro Nano Chile.</p>
      </div>
    </footer>
  );
}