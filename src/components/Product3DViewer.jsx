import { useState, useEffect, useRef } from 'react';
import { 
  Box, Rotate3D, ZoomIn, ZoomOut, Maximize2, X, Cuboid, 
  Sparkles, Sun, Moon, RefreshCw, Expand, Shrink, Palette
} from 'lucide-react';

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
  productName,
  isExpanded = false,
  onToggleExpand
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [exposure, setExposure] = useState(1.2);
  const [autoRotate, setAutoRotate] = useState(true);
  const [shadowIntensity, setShadowIntensity] = useState(1);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    loadModelViewerScript()
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  }, []);

  // Funciones de control
  const zoomIn = () => {
    if (modelViewerRef.current) {
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
      modelViewerRef.current.fieldOfView = '30deg';
    }
  };

  const toggleAR = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.activateAR();
    }
  };

  const toggleAutoRotate = () => {
    setAutoRotate(!autoRotate);
    if (modelViewerRef.current) {
      modelViewerRef.current.autoRotate = !autoRotate;
    }
  };

  // Si no hay modelo 3D, mostrar imagen 2D con mensaje
  if (!modelUrl) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex items-center justify-center">
        <img 
          src={posterUrl} 
          alt={alt}
          className="max-w-full max-h-full object-contain p-8"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Box size={18} />
            <span>Vista 3D no disponible para este producto</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
        <img 
          src={posterUrl} 
          alt={alt}
          className="max-w-full max-h-full object-contain p-8"
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-50 via-gray-100 to-slate-200 rounded-xl overflow-hidden">
      {/* Header con info mejorado */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-p3-blue/90 backdrop-blur-sm text-white p-2 rounded-lg">
              <Cuboid size={20} />
            </div>
            <div className="text-white">
              <p className="font-semibold text-sm">Vista 3D Interactiva</p>
              <p className="text-xs text-white/80">Arrastra para rotar • Scroll para zoom</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onToggleExpand && (
              <button 
                onClick={onToggleExpand}
                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
                title={isExpanded ? "Contraer" : "Expandir"}
              >
                {isExpanded ? <Shrink size={18} /> : <Expand size={18} />}
              </button>
            )}
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
      </div>

      {/* Model Viewer con mejor iluminación */}
      {loaded ? (
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          poster={posterUrl}
          alt={alt}
          camera-controls
          auto-rotate={autoRotate}
          auto-rotate-delay={1000}
          rotation-per-second="20deg"
          interaction-prompt="none"
          shadow-intensity={shadowIntensity}
          shadow-softness={0.8}
          exposure={exposure}
          environment-image="neutral"
          skybox-image=""
          camera-orbit="0deg 75deg 105%"
          min-camera-orbit="auto auto 60%"
          max-camera-orbit="auto auto 150%"
          field-of-view="30deg"
          style={{ width: '100%', height: '100%' }}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
          ar-placement="floor"
          ios-src={modelUrl?.replace('.glb', '.usdz')}
        >
          {/* Loading slot mejorado */}
          <div slot="poster" className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <img 
              src={posterUrl} 
              alt={alt}
              className="max-w-[60%] max-h-[60%] object-contain opacity-30 mb-4"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-p3-blue border-t-transparent"></div>
              <p className="text-gray-600 text-sm font-medium">Cargando modelo 3D...</p>
            </div>
          </div>

          {/* Error slot */}
          <div slot="error" className="w-full h-full flex items-center justify-center bg-gray-100">
            <img 
              src={posterUrl} 
              alt={alt}
              className="max-w-full max-h-full object-contain p-8"
            />
          </div>
        </model-viewer>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-p3-blue border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Inicializando visor 3D...</p>
        </div>
      )}

      {/* Controles inferiores mejorados */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3">
        {/* Controles principales */}
        <div className="flex items-center justify-center gap-2">
          <div className="bg-black/70 backdrop-blur-md rounded-2xl px-4 py-2 flex items-center gap-2">
            <button 
              onClick={zoomOut}
              className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Alejar"
            >
              <ZoomOut size={20} />
            </button>
            
            <button 
              onClick={resetView}
              className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Resetear vista"
            >
              <RefreshCw size={20} />
            </button>

            <button 
              onClick={toggleAutoRotate}
              className={`p-2.5 rounded-xl transition-colors ${autoRotate ? 'bg-p3-blue text-white' : 'text-white hover:bg-white/20'}`}
              title={autoRotate ? "Detener rotación" : "Auto-rotar"}
            >
              <Rotate3D size={20} />
            </button>
            
            <button 
              onClick={zoomIn}
              className="p-2.5 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Acercar"
            >
              <ZoomIn size={20} />
            </button>

            <div className="w-px h-6 bg-white/30 mx-1"></div>

            <button 
              onClick={toggleAR}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg"
              title="Ver en Realidad Aumentada"
            >
              <Maximize2 size={18} />
              <span className="text-sm font-semibold">Ver en AR</span>
            </button>
          </div>
        </div>

        {/* Controles de iluminación */}
        <div className="flex items-center justify-center gap-2">
          <div className="bg-black/50 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-3">
            <button 
              onClick={() => setExposure(Math.max(0.5, exposure - 0.2))}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
            >
              <Moon size={16} />
            </button>
            <div className="flex flex-col items-center">
              <span className="text-white/60 text-xs">Luz</span>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={exposure}
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button 
              onClick={() => setExposure(Math.min(3, exposure + 0.2))}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
            >
              <Sun size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewer;
