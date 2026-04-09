import { useState, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, X, 
  Rotate3D, Film, Download
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
  const [showControls, setShowControls] = useState(true);
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

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 text-white p-2 rounded-lg shadow-lg">
              <Film size={20} />
            </div>
            <div className="text-white">
              <p className="font-semibold text-sm">Vista 360°</p>
              <p className="text-xs text-white/80">Video del producto</p>
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

      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        className="w-full h-full object-contain"
        autoPlay
        muted
        loop
        playsInline
        onClick={togglePlay}
      />

      {/* Controles */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <div className="flex items-center justify-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors text-white"
          >
            <Maximize size={20} />
          </button>
        </div>

        <p className="text-white/60 text-xs text-center mt-3">
          El video se repite automáticamente • Haz clic para pausar
        </p>
      </div>

      {/* Badge de 360° */}
      <div className="absolute top-20 right-4 bg-amber-500/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs font-semibold">
        <div className="flex items-center gap-1">
          <Rotate3D size={14} />
          <span>360° Video</span>
        </div>
      </div>
    </div>
  );
};

export default ProductVideoViewer;
