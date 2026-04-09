import { useState, useEffect, useRef } from 'react';
import { Box, Rotate3D, ZoomIn, ZoomOut, Maximize2, X, Cuboid } from 'lucide-react';

// Cargar Google Model Viewer desde CDN
const loadModelViewerScript = () => {
  return new Promise((resolve, reject) => {
    if (window.customElements && window.customElements.get('model-viewer')) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const Product3DViewer = ({ 
  modelUrl, 
  posterUrl, 
  alt = 'Producto 3D',
  onClose,
  productName 
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [showAR, setShowAR] = useState(false);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    loadModelViewerScript()
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  }, []);

  // Funciones de control
  const zoomIn = () => {
    if (modelViewerRef.current) {
      const currentZoom = modelViewerRef.current.getCameraOrbit();
      modelViewerRef.current.zoom(1.2);
    }
  };

  const zoomOut = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.zoom(0.8);
    }
  };

  const resetView = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.resetTurntableRotation();
      modelViewerRef.current.cameraOrbit = '0deg 75deg 105%';
    }
  };

  const toggleAR = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.activateAR();
    }
  };

  // Si no hay modelo 3D, mostrar imagen 2D con mensaje
  if (!modelUrl) {
    return (
      <div className="relative w-full h-full bg-gray-50 rounded-xl overflow-hidden">
        <img 
          src={posterUrl} 
          alt={alt}
          className="w-full h-full object-contain"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white text-sm p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Box size={18} />
            <span>Vista 3D no disponible para este producto</span>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full bg-gray-50 rounded-xl flex items-center justify-center">
        <img 
          src={posterUrl} 
          alt={alt}
          className="max-w-full max-h-full object-contain"
        />
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-100 to-gray-200 rounded-xl overflow-hidden">
      {/* Header con info */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Cuboid size={20} />
            <span className="font-medium">Vista 3D</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Model Viewer */}
      {loaded ? (
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          poster={posterUrl}
          alt={alt}
          camera-controls
          auto-rotate
          auto-rotate-delay={2000}
          rotation-per-second="30deg"
          interaction-prompt="none"
          shadow-intensity="1"
          exposure="1"
          camera-orbit="0deg 75deg 105%"
          min-camera-orbit="auto auto 50%"
          max-camera-orbit="auto auto 150%"
          style={{ width: '100%', height: '100%' }}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
          ar-placement="floor"
          ios-src={modelUrl?.replace('.glb', '.usdz')}
        >
          {/* Loading slot */}
          <div slot="poster" className="w-full h-full flex items-center justify-center bg-gray-100">
            <img 
              src={posterUrl} 
              alt={alt}
              className="max-w-full max-h-full object-contain opacity-50"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-p3-red"></div>
            </div>
          </div>

          {/* Error slot */}
          <div slot="error" className="w-full h-full flex items-center justify-center bg-gray-100">
            <img 
              src={posterUrl} 
              alt={alt}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </model-viewer>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-p3-red"></div>
        </div>
      )}

      {/* Controles */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2">
        <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-3">
          <button 
            onClick={zoomOut}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Alejar"
          >
            <ZoomOut size={20} />
          </button>
          
          <button 
            onClick={resetView}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Resetear vista"
          >
            <Rotate3D size={20} />
          </button>
          
          <button 
            onClick={zoomIn}
            className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
            title="Acercar"
          >
            <ZoomIn size={20} />
          </button>

          <div className="w-px h-6 bg-white/30"></div>

          <button 
            onClick={toggleAR}
            className="flex items-center gap-2 px-3 py-1.5 bg-p3-red text-white rounded-full hover:bg-p3-red-dark transition-colors"
            title="Ver en AR"
          >
            <Maximize2 size={16} />
            <span className="text-sm font-medium">AR</span>
          </button>
        </div>
      </div>

      {/* Instrucciones */}
      <div className="absolute bottom-16 left-4 right-4 text-center">
        <p className="text-white/80 text-xs bg-black/50 inline-block px-3 py-1 rounded-full">
          Arrastra para rotar • Scroll para zoom • Doble clic para reset
        </p>
      </div>
    </div>
  );
};

export default Product3DViewer;
