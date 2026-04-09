import { useState, useEffect, useRef } from 'react';
import { 
  Box, Rotate3D, ZoomIn, ZoomOut, Maximize2, X, Cuboid, 
  Sun, Moon, RefreshCw, Palette, Info, Paintbrush
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

// Paleta de colores para diferentes tipos de productos
const colorSchemes = {
  default: { 
    color: '#ffffff', 
    metalness: 0.3, 
    roughness: 0.4,
    name: 'Blanco estándar'
  },
  electronic: { 
    color: '#2d5a8e', 
    metalness: 0.1, 
    roughness: 0.3,
    name: 'Azul electrónico'
  },
  mechanical: { 
    color: '#8B4513', 
    metalness: 0.8, 
    roughness: 0.2,
    name: 'Cobre metálico'
  },
  plastic: { 
    color: '#f5f5f5', 
    metalness: 0.0, 
    roughness: 0.5,
    name: 'Plástico blanco'
  },
  chrome: { 
    color: '#C0C0C0', 
    metalness: 1.0, 
    roughness: 0.1,
    name: 'Cromado'
  },
  gold: { 
    color: '#FFD700', 
    metalness: 1.0, 
    roughness: 0.2,
    name: 'Dorado'
  },
  sensor: {
    color: '#e8f4f8',
    metalness: 0.2,
    roughness: 0.4,
    name: 'Sensor blanco'
  }
};

const Product3DViewer = ({ 
  modelUrl, 
  posterUrl, 
  alt = 'Producto 3D',
  onClose,
  productName,
  productCode
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [exposure, setExposure] = useState(1.5);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentScheme, setCurrentScheme] = useState('default');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    loadModelViewerScript()
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  }, []);

  // Detectar tipo de producto y aplicar color sugerido
  useEffect(() => {
    if (productCode) {
      if (productCode.startsWith('48')) {
        setCurrentScheme('sensor');
      } else if (productCode.startsWith('41') || productCode.startsWith('49')) {
        setCurrentScheme('electronic');
      } else if (productCode.startsWith('32') || productCode.startsWith('42')) {
        setCurrentScheme('mechanical');
      }
    }
  }, [productCode]);

  const applyColorScheme = (schemeKey) => {
    setCurrentScheme(schemeKey);
    setShowColorPicker(false);
    
    // Intentar aplicar color al modelo si es posible
    if (modelViewerRef.current) {
      const model = modelViewerRef.current.model;
      if (model && model.materials) {
        const scheme = colorSchemes[schemeKey];
        model.materials.forEach(material => {
          if (material.pbrMetallicRoughness) {
            material.pbrMetallicRoughness.setBaseColorFactor(scheme.color);
            material.pbrMetallicRoughness.setMetallicFactor(scheme.metalness);
            material.pbrMetallicRoughness.setRoughnessFactor(scheme.roughness);
          }
        });
      }
    }
  };

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
      modelViewerRef.current.cameraOrbit = '0deg 75deg 100%';
    }
  };

  const toggleAR = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.activateAR();
    }
  };

  const handleModelLoad = () => {
    setModelLoaded(true);
    // Intentar aplicar color inicial
    setTimeout(() => applyColorScheme(currentScheme), 100);
  };

  // Si no hay modelo 3D
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

  const scheme = colorSchemes[currentScheme];

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-slate-100 via-white to-slate-200 rounded-xl overflow-hidden">
      {/* Header */}
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

      {/* Model Viewer Mejorado */}
      {loaded ? (
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          poster={posterUrl}
          alt={alt}
          camera-controls
          auto-rotate={autoRotate}
          auto-rotate-delay={500}
          rotation-per-second="15deg"
          interaction-prompt="none"
          shadow-intensity="1.5"
          shadow-softness={0.6}
          exposure={exposure}
          environment-image="https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k_HDR.hdr"
          skybox-image="https://modelviewer.dev/shared-assets/environments/spruit_sunrise_1k_HDR.hdr"
          camera-orbit="0deg 75deg 100%"
          min-camera-orbit="auto auto 50%"
          max-camera-orbit="auto auto 200%"
          field-of-view="30deg"
          style={{ width: '100%', height: '100%' }}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
          ar-placement="floor"
          ios-src={modelUrl?.replace('.glb', '.usdz')}
          onLoad={handleModelLoad}
        >
          {/* Slot de carga con imagen */}
          <div slot="poster" className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <div className="relative">
              <img 
                src={posterUrl} 
                alt={alt}
                className="max-w-[200px] max-h-[200px] object-contain opacity-40"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-p3-blue border-t-transparent"></div>
              </div>
            </div>
            <p className="text-gray-600 text-sm font-medium mt-4">Cargando modelo 3D...</p>
          </div>

          {/* Slot de error */}
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

      {/* Controles inferiores */}
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
              onClick={() => setAutoRotate(!autoRotate)}
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
            >
              <Maximize2 size={18} />
              <span className="text-sm font-semibold">AR</span>
            </button>
          </div>
        </div>

        {/* Controles de iluminación y color */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Control de luz */}
          <div className="bg-black/50 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-3">
            <button 
              onClick={() => setExposure(Math.max(0.5, exposure - 0.3))}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
            >
              <Moon size={16} />
            </button>
            <div className="flex flex-col items-center w-20">
              <span className="text-white/60 text-xs">Brillo</span>
              <input 
                type="range" 
                min="0.5" 
                max="3" 
                step="0.1" 
                value={exposure}
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button 
              onClick={() => setExposure(Math.min(3, exposure + 0.3))}
              className="p-1.5 text-white/70 hover:text-white transition-colors"
            >
              <Sun size={16} />
            </button>
          </div>

          {/* Selector de color */}
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="bg-black/50 backdrop-blur-md rounded-xl px-3 py-2 flex items-center gap-2 text-white hover:bg-black/60 transition-colors"
            >
              <Paintbrush size={16} />
              <span className="text-sm">Color</span>
              <div 
                className="w-5 h-5 rounded-full border-2 border-white/50 ml-1"
                style={{ backgroundColor: scheme.color }}
              />
            </button>

            {/* Dropdown de colores */}
            {showColorPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl p-3 min-w-[180px] z-30">
                <p className="text-xs text-gray-500 mb-2 font-medium">Seleccionar material:</p>
                <div className="space-y-1">
                  {Object.entries(colorSchemes).map(([key, scheme]) => (
                    <button
                      key={key}
                      onClick={() => applyColorScheme(key)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                        currentScheme === key 
                          ? 'bg-p3-blue text-white' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div 
                        className="w-5 h-5 rounded-full border border-gray-300"
                        style={{ backgroundColor: scheme.color }}
                      />
                      {scheme.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info del modelo */}
      {modelLoaded && (
        <div className="absolute top-20 right-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
          <div className="flex items-center gap-1">
            <Info size={12} />
            <span>Material: {scheme.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Product3DViewer;
