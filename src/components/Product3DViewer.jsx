import { useState, useEffect, useRef } from 'react';
import { 
  Rotate3D, ZoomIn, ZoomOut, Maximize2, X, Cuboid, 
  Sun, Moon, RefreshCw, Paintbrush, Info, Eye, Image
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

// Entornos de granja disponibles
const farmEnvironments = [
  {
    name: 'Granja Interior',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/farm_field_2k.hdr',
    thumbnail: '🏚️'
  },
  {
    name: 'Nave Avícola',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/kloppenheim_02_2k.hdr',
    thumbnail: '🐔'
  },
  {
    name: 'Exterior Día',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/symmetrical_garden_2k.hdr',
    thumbnail: '☀️'
  },
  {
    name: 'Taller Industrial',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/machine_shop_02_2k.hdr',
    thumbnail: '⚙️'
  }
];

// Colores base para el modelo
const baseColors = [
  { name: 'Original', color: null },
  { name: 'Blanco', color: '#ffffff' },
  { name: 'Gris Claro', color: '#e5e5e5' },
  { name: 'Gris Oscuro', color: '#4a4a4a' },
  { name: 'Azul Claro', color: '#dbeafe' },
  { name: 'Beige', color: '#f5f5dc' },
  { name: 'Cobre', color: '#b87333' },
  { name: 'Plateado', color: '#c0c0c0' },
];

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
  const [exposure, setExposure] = useState(1.2);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentEnv, setCurrentEnv] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const modelViewerRef = useRef(null);

  useEffect(() => {
    loadModelViewerScript()
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  }, []);

  const zoomIn = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.zoom(1.3);
    }
  };

  const zoomOut = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.zoom(0.7);
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
  };

  const applyColor = (color) => {
    if (!modelViewerRef.current || !color) return;
    
    try {
      const model = modelViewerRef.current.model;
      if (model && model.materials) {
        model.materials.forEach(material => {
          if (material.pbrMetallicRoughness) {
            // Convertir hex a RGB
            const r = parseInt(color.slice(1, 3), 255) / 255;
            const g = parseInt(color.slice(3, 5), 255) / 255;
            const b = parseInt(color.slice(5, 7), 255) / 255;
            material.pbrMetallicRoughness.setBaseColorFactor([r, g, b, 1]);
          }
        });
      }
    } catch (e) {
      console.log('No se pudo aplicar color:', e);
    }
    setShowColorPicker(false);
  };

  // Si no hay modelo 3D
  if (!modelUrl) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkOTc0MDgiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyem0tNiA2aC00djJoNHYtMnptMC02di00aC00djRoNHptLTYgNmgtNHYyaDR2LTJ6bTAtNnYtNGgtNHY0aDR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
        <img 
          src={posterUrl} 
          alt={alt}
          className="max-w-full max-h-full object-contain p-8 drop-shadow-2xl"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-amber-900/80 backdrop-blur-sm text-white text-sm p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Cuboid size={18} />
            <span>Vista 3D no disponible para este producto</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl flex items-center justify-center">
        <img 
          src={posterUrl} 
          alt={alt}
          className="max-w-full max-h-full object-contain p-8 drop-shadow-2xl"
        />
      </div>
    );
  }

  const currentEnvironment = farmEnvironments[currentEnv];

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-xl overflow-hidden">
      {/* Patrón de granja en fondo */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iI2Q5NzQwOCIvPjwvc3ZnPg==')]"></div>
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-amber-900/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white p-2 rounded-lg shadow-lg">
              <Cuboid size={20} />
            </div>
            <div className="text-white">
              <p className="font-semibold text-sm">Vista 3D</p>
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

      {/* Model Viewer con entorno de granja */}
      {loaded ? (
        <model-viewer
          ref={modelViewerRef}
          src={modelUrl}
          poster={posterUrl}
          alt={alt}
          camera-controls
          auto-rotate={autoRotate}
          auto-rotate-delay={500}
          rotation-per-second="20deg"
          interaction-prompt="none"
          shadow-intensity="1"
          shadow-softness={0.8}
          exposure={exposure}
          environment-image={currentEnvironment.url}
          skybox-image={currentEnvironment.url}
          camera-orbit="0deg 75deg 95%"
          min-camera-orbit="auto auto 60%"
          max-camera-orbit="auto auto 180%"
          field-of-view="35deg"
          style={{ width: '100%', height: '100%', '--poster-color': 'transparent' }}
          ar
          ar-modes="webxr scene-viewer quick-look"
          ar-scale="fixed"
          ar-placement="floor"
          ios-src={modelUrl?.replace('.glb', '.usdz')}
          onLoad={handleModelLoad}
        >
          {/* Slot de carga */}
          <div slot="poster" className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
            <div className="relative">
              <img 
                src={posterUrl} 
                alt={alt}
                className="max-w-[180px] max-h-[180px] object-contain opacity-60 drop-shadow-xl"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-500 border-t-transparent"></div>
              </div>
            </div>
            <p className="text-amber-800 text-sm font-medium mt-4">Cargando modelo 3D...</p>
          </div>

          {/* Slot de error */}
          <div slot="error" className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
            <img 
              src={posterUrl} 
              alt={alt}
              className="max-w-full max-h-full object-contain p-8 drop-shadow-2xl"
            />
          </div>
        </model-viewer>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mb-4"></div>
          <p className="text-amber-800 font-medium">Inicializando visor 3D...</p>
        </div>
      )}

      {/* Controles inferiores */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3">
        {/* Controles principales */}
        <div className="flex items-center justify-center gap-2">
          <div className="bg-amber-900/80 backdrop-blur-md rounded-2xl px-3 py-2 flex items-center gap-1">
            <button 
              onClick={zoomOut}
              className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Alejar"
            >
              <ZoomOut size={18} />
            </button>
            
            <button 
              onClick={resetView}
              className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Resetear vista"
            >
              <RefreshCw size={18} />
            </button>

            <button 
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl transition-colors ${autoRotate ? 'bg-amber-500 text-white' : 'text-white hover:bg-white/20'}`}
              title={autoRotate ? "Detener rotación" : "Auto-rotar"}
            >
              <Rotate3D size={18} />
            </button>
            
            <button 
              onClick={zoomIn}
              className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors"
              title="Acercar"
            >
              <ZoomIn size={18} />
            </button>

            <div className="w-px h-5 bg-white/30 mx-1"></div>

            <button 
              onClick={toggleAR}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-lg"
            >
              <Maximize2 size={16} />
              <span className="text-xs font-semibold">AR</span>
            </button>
          </div>
        </div>

        {/* Controles secundarios */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Control de luz */}
          <div className="bg-amber-900/70 backdrop-blur-md rounded-xl px-2 py-1.5 flex items-center gap-2">
            <button 
              onClick={() => setExposure(Math.max(0.3, exposure - 0.2))}
              className="p-1 text-white/70 hover:text-white transition-colors"
            >
              <Moon size={14} />
            </button>
            <div className="flex flex-col items-center w-16">
              <span className="text-white/70 text-[10px]">LUZ</span>
              <input 
                type="range" 
                min="0.3" 
                max="3" 
                step="0.1" 
                value={exposure}
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button 
              onClick={() => setExposure(Math.min(3, exposure + 0.2))}
              className="p-1 text-white/70 hover:text-white transition-colors"
            >
              <Sun size={14} />
            </button>
          </div>

          {/* Selector de entorno */}
          <div className="bg-amber-900/70 backdrop-blur-md rounded-xl px-2 py-1.5 flex items-center gap-1">
            <span className="text-white/70 text-[10px] mr-1">ENTORNO</span>
            {farmEnvironments.map((env, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentEnv(idx)}
                className={`p-1.5 rounded-lg transition-all ${
                  currentEnv === idx 
                    ? 'bg-amber-500 text-white scale-110' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title={env.name}
              >
                <span className="text-lg">{env.thumbnail}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info del entorno */}
      <div className="absolute top-20 right-4 bg-amber-900/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
        <div className="flex items-center gap-1">
          <Info size={12} />
          <span>{currentEnvironment.name}</span>
        </div>
      </div>
    </div>
  );
};

export default Product3DViewer;
