import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

const WHATSAPP_URL =
  'https://wa.me/524771284661?text=' +
  encodeURIComponent('Hola, me interesa cotizar un producto de 3P.');

// Botón flotante de WhatsApp visible en todo el sitio público.
export default function WhatsAppFloat() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Cotizar por WhatsApp"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg shadow-green-600/30 flex items-center justify-center hover:scale-110 hover:shadow-xl transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <MessageCircle size={28} fill="currentColor" />
    </a>
  );
}
