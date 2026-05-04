import React, { useRef, useState, useEffect } from 'react';
import { Button } from 'primereact/button';

export default function CameraCapture({ onCapture, onCancel }: { onCapture: (dataUrl: string, location: {lat: number, lng: number} | null) => void, onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    // Start camera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        activeStream = s;
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => {
        console.error("Error accessing camera", err);
        alert("No se pudo acceder a la cámara. Por favor, asegúrese de otorgar permisos.");
      });

    // Get Location
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => {
        console.error("Error getting location", err);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      setCapturing(true);
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6); // Compress to 60%
        
        // Cleanup stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        onCapture(dataUrl, location);
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-sm aspect-[3/4] flex justify-center items-center shadow-inner border-2 border-gray-100">
        {!stream && <span className="text-white opacity-50 flex flex-col items-center gap-2"><i className="pi pi-spin pi-spinner text-3xl"></i><span>Iniciando Cámara...</span></span>}
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      
      {location ? (
         <small className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full"><i className="pi pi-map-marker mr-1"></i> GPS Listo ({location.lat.toFixed(5)}, {location.lng.toFixed(5)})</small>
      ) : (
         <small className="text-orange-500 font-bold bg-orange-50 px-3 py-1 rounded-full"><i className="pi pi-spin pi-spinner mr-1"></i> Adquiriendo señal GPS...</small>
      )}
      
      <div className="flex gap-4 w-full mt-2">
        <Button label="Cancelar" icon="pi pi-times" severity="secondary" outlined className="flex-1 rounded-xl" onClick={() => {
            if (stream) { stream.getTracks().forEach(track => track.stop()); }
            onCancel();
        }} />
        <Button label="Capturar Asistencia" icon="pi pi-camera" className="flex-1 rounded-xl shadow-lg bg-indigo-600 border-none" loading={capturing} onClick={takePhoto} disabled={!stream || !location} />
      </div>
    </div>
  );
}
