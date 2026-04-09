import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Rotate3D, ZoomIn, ZoomOut, Maximize2, X, Cuboid, 
  Sun, Moon, RefreshCw, Palette, Info, Layers, Paintbrush
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

// Entornos de granja
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
    name: 'Taller',
    url: 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/machine_shop_02_2k.hdr',
    thumbnail: '⚙️'
  }
];

// Paleta de colores para refacciones
const colorPalettes = [
  { name: 'Auto', value: null, desc: 'Detectar automáticamente' },
  { name: 'Blanco Puro', value: '#FFFFFF', desc: 'Plástico blanco' },
  { name: 'Blanco Hueso', value: '#F5F5DC', desc: 'Sensor/Equipo' },
  { name: 'Gris Claro', value: '#D3D3D3', desc: 'Metal aluminio' },
  { name: 'Gris Medio', value: '#808080', desc: 'Acero' },
  { name: 'Gris Oscuro', value: '#4A4A4A', desc: 'Metal industrial' },
  { name: 'Negro', value: '#1A1A1A', desc: 'Plástico técnico' },
  { name: 'Azul Claro', value: '#E3F2FD', desc: 'Electrónico' },
  { name: 'Azul Industrial', value: '#1976D2', desc: 'Panel control' },
  { name: 'Beige', value: '#F5F5DC', desc: 'Carcasa equipo' },
  { name: 'Cobre', value: '#B87333', desc: 'Conector/cable' },
  { name: 'Dorado', value: '#D4AF37', desc: 'Contactos' },
  { name: 'Verde Circuito', value: '#2E7D32', desc: 'PCB/Tarjeta' },
  { name: 'Rojo', value: '#C62828', desc: 'Botón/Alerta' },
];

// Detectar tipo de producto por código
const detectProductType = (code) => {
  if (!code) return 'default';
  const prefix = code.substring(0, 2);
  const types = {
    '48': { color: '#F5F5DC', name: 'Sensor', metal: 0.1, rough: 0.3 },
    '41': { color: '#E3F2FD', name: 'Tarjeta', metal: 0.2, rough: 0.4 },
    '49': { color: '#E3F2FD', name: 'Control', metal: 0.2, rough: 0.4 },
    '32': { color: '#D3D3D3', name: 'Motor', metal: 0.8, rough: 0.2 },
    '42': { color: '#B87333', name: 'Mecánico', metal: 0.6, rough: 0.3 },
    '68': { color: '#FFFFFF', name: 'Tubo', metal: 0.0, rough: 0.5 },
    '51': { color: '#C0C0C0', name: 'Cable', metal: 0.9, rough: 0.1 },
  };
  return types[prefix] || { color: '#F5F5DC', name: 'Estándar', metal: 0.3, rough: 0.4 };
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
  const [exposure, setExposure] = useState(1.3);
  const [autoRotate, setAutoRotate] = useState(true);
  const [currentEnv, setCurrentEnv] = useState(0);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [currentColor, setCurrentColor] = useState(null);
  const [appliedColor, setAppliedColor] = useState(null);
  const [colorApplied, setColorApplied] = useState(false);
  const modelViewerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    loadModelViewerScript()
      .then(() => setLoaded(true))
      .catch(() => setError(true));
  }, []);

  // Detectar color automático al cargar
  useEffect(() => {
    if (productCode) {
      const detected = detectProductType(productCode);
      setCurrentColor(detected.color);
    }
  }, [productCode]);

  // Función para aplicar color al modelo - intenta múltiples métodos
  const applyColorToModel = useCallback(async (colorHex) => {
    if (!modelViewerRef.current || !colorHex) return false;
    
    try {
      const model = modelViewerRef.current.model;
      if (!model) return false;

      // Convertir hex a RGB array
      const r = parseInt(colorHex.slice(1, 3), 16) / 255;
      const g = parseInt(colorHex.slice(3, 5), 16) / 255;
      const b = parseInt(colorHex.slice(5, 7), 16) / 255;
      const rgba = [r, g, b, 1.0];

      let applied = false;

      // Método 1: Intentar acceder a materiales directamente
      if (model.materials && model.materials.length > 0) {
        model.materials.forEach((material, idx) => {
          try {
            if (material.pbrMetallicRoughness) {
              const pbr = material.pbrMetallicRoughness;
              if (pbr.baseColorFactor) {
                pbr.baseColorFactor.set(rgba);
                applied = true;
              }
            }
            // También intentar con baseColorTexture si existe
            if (material.pbrMetallicRoughness && material.pbrMetallicRoughness.baseColorTexture) {
              // No podemos modificar texturas fácilmente
            }
          } catch (e) {
            console.log(`Material ${idx} no pudo modificarse:`, e);
          }
        });
      }

      // Método 2: Intentar acceder a la escena de Three.js interna
      if (!applied) {
        const scene = modelViewerRef.current[$]?.scene;
        if (scene) {
          scene.traverse((child) => {
            if (child.isMesh && child.material) {
              try {
                if (Array.isArray(child.material)) {
                  child.material.forEach(mat => {
                    mat.color.setHex(parseInt(colorHex.slice(1), 16));
                  });
                } else {
                  child.material.color.setHex(parseInt(colorHex.slice(1), 16));
                }
                applied = true;
              } catch (e) {}
            }
          });
        }
      }

      return applied;
    } catch (e) {
      console.log('Error aplicando color:', e);
      return false;
    }
  }, []);

  // Handler cuando el modelo carga
  const handleModelLoad = async () => {
    setModelLoaded(true);
    
    // Esperar un momento para que el modelo se inicialice completamente
    setTimeout(async () => {
      if (currentColor) {
        const success = await applyColorToModel(currentColor);
        if (success) {
          setAppliedColor(currentColor);
          setColorApplied(true);
        }
      }
    }, 500);
  };

  // Handler para cambiar color manualmente
  const handleColorChange = async (palette) => {
    setCurrentColor(palette.value);
    setShowColorPicker(false);
    
    if (palette.value) {
      const success = await applyColorToModel(palette.value);
      if (success) {
        setAppliedColor(palette.value);
        setColorApplied(true);
      }
    }
  };

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
      modelViewerRef.current.cameraOrbit = '0deg 75deg 95%';
    }
  };

  const toggleAR = () => {
    if (modelViewerRef.current) {
      modelViewerRef.current.activateAR();
    }
  };

  const productType = detectProductType(productCode);
  const currentPalette = colorPalettes.find(p => p.value === currentColor) || colorPalettes[0];
  const currentEnvironment = farmEnvironments[currentEnv];

  if (!modelUrl) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden flex items-center justify-center">
        <img 
          src={posterUrl} 
          alt={alt}
          className="max-w-full max-h-full object-contain p-8 drop-shadow-2xl"
        />
        <div className="absolute bottom-4 left-4 right-4 bg-amber-900/80 backdrop-blur-sm text-white text-sm p-4 rounded-xl">
          <div className="flex items-center gap-2">
            <Cuboid size={18} />
            <span>Vista 3D no disponible</span>
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

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100 rounded-xl overflow-hidden">
      {/* Patrón de fondo */}
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
              <p className="text-xs text-white/80">{productType.name} {colorApplied && '• Color aplicado'}</p>
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

      {/* Model Viewer */}
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
          shadow-intensity="1.2"
          shadow-softness={0.7}
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
          {/* Poster con imagen mientras carga */}
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
            <p className="text-amber-600 text-xs mt-1">Detectando: {productType.name}</p>
          </div>

          {/* Error */}
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

      {/* Controles */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-3">
        {/* Controles principales */}
        <div className="flex items-center justify-center gap-2">
          <div className="bg-amber-900/80 backdrop-blur-md rounded-2xl px-3 py-2 flex items-center gap-1">
            <button onClick={zoomOut} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Alejar">
              <ZoomOut size={18} />
            </button>
            <button onClick={resetView} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Resetear">
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-xl transition-colors ${autoRotate ? 'bg-amber-500 text-white' : 'text-white hover:bg-white/20'}`}
            >
              <Rotate3D size={18} />
            </button>
            <button onClick={zoomIn} className="p-2 text-white hover:bg-white/20 rounded-xl transition-colors" title="Acercar">
              <ZoomIn size={18} />
            </button>
            <div className="w-px h-5 bg-white/30 mx-1"></div>
            <button onClick={toggleAR} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-all shadow-lg">
              <Maximize2 size={16} />
              <span className="text-xs font-semibold">AR</span>
            </button>
          </div>
        </div>

        {/* Controles secundarios */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Luz */}
          <div className="bg-amber-900/70 backdrop-blur-md rounded-xl px-2 py-1.5 flex items-center gap-2">
            <button onClick={() => setExposure(Math.max(0.3, exposure - 0.2))} className="p-1 text-white/70 hover:text-white">
              <Moon size={14} />
            </button>
            <div className="flex flex-col items-center w-16">
              <span className="text-white/70 text-[10px]">LUZ</span>
              <input 
                type="range" 
                min="0.3" max="3" step="0.1" 
                value={exposure}
                onChange={(e) => setExposure(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <button onClick={() => setExposure(Math.min(3, exposure + 0.2))} className="p-1 text-white/70 hover:text-white">
              <Sun size={14} />
            </button>
          </div>

          {/* Entorno */}
          <div className="bg-amber-900/70 backdrop-blur-md rounded-xl px-2 py-1.5 flex items-center gap-1">
            <span className="text-white/70 text-[10px] mr-1">ENTORNO</span>
            {farmEnvironments.map((env, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentEnv(idx)}
                className={`p-1.5 rounded-lg transition-all ${currentEnv === idx ? 'bg-amber-500 text-white scale-110' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
                title={env.name}
              >
                <span className="text-lg">{env.thumbnail}</span>
              </button>
            ))}
          </div>

          {/* Color */}
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="bg-amber-900/70 backdrop-blur-md rounded-xl px-2 py-1.5 flex items-center gap-2 text-white hover:bg-amber-900/80 transition-colors"
            >
              <Palette size={14} />
              <span className="text-xs">COLOR</span>
              <div 
                className="w-4 h-4 rounded-full border border-white/50"
                style={{ backgroundColor: currentPalette.value || '#ccc' }}
              />
            </button>

            {showColorPicker && (
              <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-2xl p-3 min-w-[220px] max-h-[300px] overflow-y-auto z-30">
                <p className="text-xs text-gray-500 mb-2 font-medium">Tipo: {productType.name}</p>
                <div className="space-y-1">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.name}
                      onClick={() => handleColorChange(palette)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-colors ${
                        currentColor === palette.value 
                          ? 'bg-amber-500 text-white' 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div 
                        className="w-5 h-5 rounded-full border border-gray-300 flex-shrink-0"
                        style={{ backgroundColor: palette.value || '#ddd' }}
                      />
                      <div className="text-left">
                        <div className="font-medium">{palette.name}</div>
                        <div className="text-[10px] opacity-70">{palette.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info del modelo */}
      <div className="absolute top-20 right-4 flex flex-col gap-2">
        <div className="bg-amber-900/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
          <div className="flex items-center gap-1">
            <Info size={12} />
            <span>{currentEnvironment.name}</span>
          </div>
        </div>
        {colorApplied && appliedColor && (
          <div className="bg-green-600/80 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs">
            <div className="flex items-center gap-1">
              <Paintbrush size={12} />
              <span>Color: {currentPalette.name}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product3DViewer;
