import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  radius: number; // in meters
  onChange: (lat: number, lng: number) => void;
}

const MapEvents = ({ setPos }: { setPos: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      setPos(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

export default function MapPicker({ latitude, longitude, radius, onChange }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const toast = useRef<Toast>(null);

  useEffect(() => {
    if (latitude && longitude) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const defaultCenter: [number, number] = [10.4806, -66.9036]; // Caracas, Venezuela

  const searchLocation = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);
        setPosition([newLat, newLng]);
        onChange(newLat, newLng);
      } else {
        toast.current?.show({ severity: 'warn', summary: 'No encontrado', detail: 'No se encontraron resultados para la búsqueda.' });
      }
    } catch (e) {
      toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Fallo al buscar la ubicación.' });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <Toast ref={toast} />
      <div className="flex gap-2">
        <div className="relative flex-1">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <InputText value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar lugar (Ej: Muelle Haticos, Maracaibo)" style={{ paddingLeft: '2.5rem' }} className="w-full" onKeyDown={(e) => e.key === 'Enter' && searchLocation()} />
        </div>
        <Button icon="pi pi-search" loading={searching} onClick={searchLocation} />
      </div>
      <div style={{ height: '400px', width: '100%', position: 'relative', zIndex: 0 }}>
        <MapContainer 
          center={position || defaultCenter} 
          zoom={position ? 15 : 6} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          {position && <ChangeView center={position} zoom={16} />}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents setPos={(lat, lng) => { setPosition([lat, lng]); onChange(lat, lng); }} />
          {position && (
            <>
              <Marker position={position} />
              <Circle center={position} radius={radius || 100} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.2 }} />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
