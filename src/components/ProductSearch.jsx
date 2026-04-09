import { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Package } from 'lucide-react';
import { choreTimeProducts } from '../data/choreTimeProducts';

const ProductSearch = ({ onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      const searchTerm = query.toLowerCase().trim();
      const filtered = choreTimeProducts.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm) ||
        p.codigo.toLowerCase().includes(searchTerm) ||
        p.categoria.toLowerCase().includes(searchTerm)
      );
      setResults(filtered.slice(0, 8));
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleSelect = (product) => {
    window.location.hash = `#/marcas/chore-time?producto=${product.codigo}`;
    setQuery('');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? <mark key={i} className="bg-yellow-200 text-gray-900">{part}</mark> : part
    );
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar productos por nombre, código o categoría..."
          className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-p3-red/50 focus:border-p3-red dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 max-h-[60vh] overflow-y-auto z-50">
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {results.length} producto{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          {results.map((product) => (
            <button
              key={product.codigo}
              onClick={() => handleSelect(product)}
              className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-gray-200 flex-shrink-0">
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="w-14 h-14 object-contain"
                  loading="lazy"
                  onError={(e) => { 
                    e.target.style.display = 'none'; 
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <Package className="hidden w-8 h-8 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {highlightMatch(product.nombre, query)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  SKU: {highlightMatch(product.codigo, query)}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                  {product.categoria}
                </p>
              </div>
              <ArrowRight className="text-gray-400 flex-shrink-0" size={18} />
            </button>
          ))}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700">
            <a
              href="#/marcas/chore-time"
              onClick={() => { if (onClose) onClose(); }}
              className="text-sm text-p3-red hover:text-p3-red-dark font-medium flex items-center justify-center gap-2"
            >
              Ver todos los productos
              <ArrowRight size={14} />
            </a>
          </div>
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 text-center z-50">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400">No se encontraron productos</p>
          <p className="text-sm text-gray-400 mt-1">Intenta con otro término</p>
        </div>
      )}
    </div>
  );
};

export default ProductSearch;
