import { useState, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, X, 
  Rotate3D, Film, AlertCircle
} from 'lucide-react';

const ProductVideoViewer = ({ 
  videoUrl, 
  posterUrl, 
  alt = 'Producto',
  onClose,
  productName,
  productCode
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  if (!videoUrl) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden flex items-center justify-center">
        <img 
          src={posterUrl} 
          alt={alt}
          className="max-w-full max-h-full object-contain p-8 drop-shadow-2xl"
        />
      </div>
    );
  }

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleVideoError = () => {
    console.log('Error cargando video:', videoUrl);
    setVideoError(true);
  };

  // Si hay error cargando el video, mostrar la imagen con mensaje
  if (videoError) {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl overflow-hidden flex flex-col items-center justify-center p-6">
        <img 
          src={posterUrl} 
          alt={alt}
          className="max-w-full max-h-[70%] object-contain drop-shadow-2xl mb-4"
        />
        <div className="bg-amber-100 border border-amber-300 rounded-xl p-4 max-w-sm text-center">
          <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
          <p className="text-amber-800 font-medium text-sm">Video 360° no disponible</p>
          <p className="text-amber-600 text-xs mt-1">El video está siendo procesado o no es accesible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {/* Video - Capa base */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="absolute inset-0 w-full h-full object-contain z-0"
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        onError={handleVideoError}
        onClick={togglePlay}
      />

      {/* Header flotante - z-10 */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/70 to-transparent p-3 pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2">
            <div className="bg-amber-600 text-white p-1.5 rounded-lg shadow-lg">
              <Film size={16} />
            </div>
            <div className="text-white">
              <p className="font-semibold text-xs">Vista 360°</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Controles inferiores - z-10 */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center justify-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          >
            <Maximize size={18} />
          </button>
        </div>

        <p className="text-white/60 text-[10px] text-center mt-2">
          Video en loop • Haz clic para pausar
        </p>
      </div>

      {/* Badge de 360° */}
      <div className="absolute top-14 right-3 z-10 bg-amber-500/90 backdrop-blur-sm rounded-lg px-2 py-1 text-white text-[10px] font-semibold">
        <div className="flex items-center gap-1">
          <Rotate3D size={12} />
          <span>360°</span>
        </div>
      </div>
    </div>
  );
};

export default ProductVideoViewer;
