import { useState } from 'react';
import { Share2, Link, Check, X, MessageCircle, Facebook, Mail, Twitter } from 'lucide-react';

const ShareButton = ({ product, variant = 'icon', className = '' }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  // Generar URL del producto
  const baseUrl = 'https://anibru300.github.io/website-3p';
  const productUrl = `${baseUrl}/#/marcas/chore-time?producto=${product.codigo}`;
  
  // Textos para compartir
  const shareText = `Mira esta refacción Chore-Time: ${product.nombre} (SKU: ${product.codigo})`;
  const shareTitle = `${product.nombre} - Chore-Time | 3P S.A. DE C.V.`;

  // Web Share API (nativo del navegador)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: productUrl,
        });
      } catch (err) {
        // Usuario canceló o no soportado
        if (err.name !== 'AbortError') {
          console.log('Share failed:', err);
        }
      }
    } else {
      // Fallback: mostrar menú personalizado
      setShowMenu(true);
    }
  };

  // Copiar enlace al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Compartir en WhatsApp
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`${shareText}\n\n${productUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowMenu(false);
  };

  // Compartir en Facebook
  const shareToFacebook = () => {
    const url = encodeURIComponent(productUrl);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowMenu(false);
  };

  // Compartir por email
  const shareToEmail = () => {
    const subject = encodeURIComponent(shareTitle);
    const body = encodeURIComponent(`${shareText}\n\nVer producto: ${productUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShowMenu(false);
  };

  // Compartir en Twitter/X
  const shareToTwitter = () => {
    const text = encodeURIComponent(shareText);
    const url = encodeURIComponent(productUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowMenu(false);
  };

  return (
    <>
      {/* Botón principal */}
      {variant === 'icon' ? (
        <button
          onClick={handleNativeShare}
          className={`p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors ${className}`}
          title="Compartir producto"
          aria-label="Compartir producto"
        >
          <Share2 size={18} />
        </button>
      ) : (
        <button
          onClick={handleNativeShare}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors ${className}`}
        >
          <Share2 size={18} />
          Compartir
        </button>
      )}

      {/* Menú de opciones de compartir (fallback) */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Compartir producto</h3>
              <button 
                onClick={() => setShowMenu(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Info del producto */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="font-medium text-gray-900 line-clamp-2">{product.nombre}</p>
              <p className="text-sm text-gray-500">SKU: {product.codigo}</p>
            </div>

            {/* Opciones de compartir */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <button
                onClick={shareToWhatsApp}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-[#25D366] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="text-white" size={24} />
                </div>
                <span className="text-xs text-gray-600">WhatsApp</span>
              </button>

              <button
                onClick={shareToFacebook}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-[#1877F2] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Facebook className="text-white" size={24} />
                </div>
                <span className="text-xs text-gray-600">Facebook</span>
              </button>

              <button
                onClick={shareToTwitter}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-sky-50 transition-colors group"
              >
                <div className="w-12 h-12 bg-[#1DA1F2] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Twitter className="text-white" size={24} />
                </div>
                <span className="text-xs text-gray-600">Twitter</span>
              </button>

              <button
                onClick={shareToEmail}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="text-white" size={24} />
                </div>
                <span className="text-xs text-gray-600">Email</span>
              </button>
            </div>

            {/* Copiar enlace */}
            <div className="border-t pt-4">
              <p className="text-sm text-gray-500 mb-2">O copia el enlace:</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={productUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600 outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    copied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-p3-blue text-white hover:bg-blue-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check size={18} />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Link size={18} />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton;
