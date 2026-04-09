import { useState } from 'react';
import { Calculator, Wind, Info, ArrowRight } from 'lucide-react';

const VentilationCalculator = () => {
  const [dimensions, setDimensions] = useState({
    length: '',
    width: '',
    height: '',
    birdType: 'broiler', // broiler, layer, breeder
    birdCount: '',
    maxTemp: ''
  });
  const [result, setResult] = useState(null);

  const birdTypes = {
    broiler: { name: 'Pollo de Engorda', cfmPerBird: 3.5 },
    layer: { name: 'Ponedora', cfmPerBird: 4.0 },
    breeder: { name: 'Reproductora', cfmPerBird: 5.0 }
  };

  const calculate = (e) => {
    e.preventDefault();
    
    const length = parseFloat(dimensions.length);
    const width = parseFloat(dimensions.width);
    const height = parseFloat(dimensions.height);
    const birdCount = parseInt(dimensions.birdCount);
    const maxTemp = parseFloat(dimensions.maxTemp);

    if (!length || !width || !height || !birdCount) return;

    // Volumen del galpón
    const volume = length * width * height;

    // CFM necesario según cantidad de aves
    const cfmPerBird = birdTypes[dimensions.birdType].cfmPerBird;
    let totalCFM = birdCount * cfmPerBird;

    // Ajuste por temperatura máxima
    if (maxTemp > 30) {
      totalCFM = totalCFM * 1.2; // 20% más si hace mucho calor
    }

    // Cambios de aire por minuto
    const airChanges = totalCFM / volume;

    // Ventiladores necesarios (suponiendo ventiladores de 20,000 CFM cada uno)
    const fanCapacity = 20000;
    const fansNeeded = Math.ceil(totalCFM / fanCapacity);

    setResult({
      volume: volume.toFixed(0),
      totalCFM: totalCFM.toFixed(0),
      airChanges: airChanges.toFixed(1),
      fansNeeded,
      cfmPerFan: fanCapacity
    });
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-4">
            <Calculator size={20} />
            <span className="font-semibold">Herramienta Técnica</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Calculadora de Ventilación
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Calcula los requerimientos de ventilación para tu galpón avícola. 
            Obtén el CFM necesario y la cantidad de ventiladores recomendados.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Wind className="text-p3-blue" />
              Datos del Galpón
            </h3>

            <form onSubmit={calculate} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Largo (m)
                  </label>
                  <input
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({...dimensions, length: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-blue focus:border-p3-blue outline-none"
                    placeholder="100"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ancho (m)
                  </label>
                  <input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({...dimensions, width: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-blue focus:border-p3-blue outline-none"
                    placeholder="15"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alto (m)
                  </label>
                  <input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({...dimensions, height: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-blue focus:border-p3-blue outline-none"
                    placeholder="4"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Ave
                </label>
                <select
                  value={dimensions.birdType}
                  onChange={(e) => setDimensions({...dimensions, birdType: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-blue focus:border-p3-blue outline-none"
                >
                  {Object.entries(birdTypes).map(([key, value]) => (
                    <option key={key} value={key}>{value.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad de Aves
                </label>
                <input
                  type="number"
                  value={dimensions.birdCount}
                  onChange={(e) => setDimensions({...dimensions, birdCount: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-blue focus:border-p3-blue outline-none"
                  placeholder="30,000"
                  required
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura Máxima Esperada (°C)
                </label>
                <input
                  type="number"
                  value={dimensions.maxTemp}
                  onChange={(e) => setDimensions({...dimensions, maxTemp: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-p3-blue focus:border-p3-blue outline-none"
                  placeholder="32"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-p3-blue hover:bg-blue-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
              >
                <Calculator size={20} />
                Calcular Ventilación
              </button>
            </form>
          </div>

          {/* Resultados */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">
              Resultados
            </h3>

            {result ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-p3-blue">{result.totalCFM}</p>
                    <p className="text-sm text-gray-600">CFM Total Requerido</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">{result.fansNeeded}</p>
                    <p className="text-sm text-gray-600">Ventiladores Necesarios</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Volumen del Galpón:</span>
                    <span className="font-semibold">{result.volume} m³</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">Cambios de Aire/Min:</span>
                    <span className="font-semibold">{result.airChanges}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-600">CFM por Ventilador:</span>
                    <span className="font-semibold">{result.cfmPerFan.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                  <Info className="text-amber-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-amber-800">
                    Esta es una estimación técnica. Para un diseño preciso considera 
                    factores como altitud, humedad y tipo de equipamiento. 
                    <a href="#contacto" className="font-semibold underline">Contáctanos</a> para asesoría especializada.
                  </p>
                </div>

                <a
                  href="https://wa.me/524771284661?text=Hola,%20realicé%20un%20cálculo%20de%20ventilación%20y%20quiero%20cotizar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  Solicitar Cotización
                  <ArrowRight size={18} />
                </a>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <Calculator size={64} className="mb-4 opacity-30" />
                <p>Ingresa los datos del galpón para calcular</p>
                <p className="text-sm">la ventilación necesaria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentilationCalculator;
