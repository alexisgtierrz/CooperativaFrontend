import { useEffect, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { MapPin, Search } from 'lucide-react';

// Con Vite, Leaflet no encuentra solo las imágenes del pin: armamos el ícono a mano.
const iconoPin = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  shadowSize: [41, 41],
});

export interface Coordenadas {
  lat: number;
  lng: number;
}

// Si todavía no hay ubicación, el mapa arranca centrado en Villa María.
const CENTRO_POR_DEFECTO: Coordenadas = { lat: -32.4075, lng: -63.2402 };
// Si el formulario no tiene localidad elegida, se busca acá
const LOCALIDAD_POR_DEFECTO = 'Villa María';
const PROVINCIA = 'Córdoba';

export interface DireccionFormulario {
  calle: string;
  numero: string;
  localidad: string;
}

type ResultadoNominatim = { lat: string; lon: string };

async function geocodificar(params: Record<string, string>): Promise<ResultadoNominatim[]> {
  const query = new URLSearchParams({ format: 'json', limit: '1', countrycodes: 'ar', ...params });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`, {
    headers: { 'Accept-Language': 'es' },
  });
  return response.json();
}

interface Props {
  value: Coordenadas | null;
  onChange: (coordenadas: Coordenadas) => void;
  /** Devuelve la dirección escrita en el formulario, para buscarla en el mapa */
  obtenerDireccion: () => DireccionFormulario;
}

/** Al tocar el mapa, mueve el pin a ese punto */
function ClickEnMapa({ onPick }: { onPick: (c: Coordenadas) => void }) {
  useMapEvents({
    click: (e) => onPick({ lat: e.latlng.lat, lng: e.latlng.lng }),
  });
  return null;
}

/** Cuando la ubicación cambia desde afuera (búsqueda o GPS), centra el mapa ahí */
function CentrarEn({ coordenadas }: { coordenadas: Coordenadas | null }) {
  const map = useMap();
  useEffect(() => {
    if (coordenadas) map.setView(coordenadas, Math.max(map.getZoom(), 17));
  }, [coordenadas, map]);
  return null;
}

export default function SelectorUbicacion({ value, onChange, obtenerDireccion }: Props) {
  const [buscando, setBuscando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  // Solo recentramos cuando la ubicación viene de una búsqueda o del GPS, no cuando el usuario arrastra el pin
  const [centrarEn, setCentrarEn] = useState<Coordenadas | null>(value);

  const moverYCentrar = (c: Coordenadas) => {
    onChange(c);
    setCentrarEn(c);
  };

  const buscarDireccion = async () => {
    const { calle, numero, localidad } = obtenerDireccion();
    if (!calle.trim()) {
      setMensaje('Primero completá calle y número.');
      return;
    }
    const ciudad = localidad.trim() || LOCALIDAD_POR_DEFECTO;
    setBuscando(true);
    setMensaje(null);
    try {
      // Nominatim (OpenStreetMap): geocoding gratis, sin API key.
      // Primero buscamos con los datos separados (más preciso); si no encuentra, probamos con texto libre.
      let resultados = await geocodificar({
        street: `${numero} ${calle}`.trim(),
        city: ciudad,
        state: PROVINCIA,
        country: 'Argentina',
      });
      if (resultados.length === 0) {
        resultados = await geocodificar({ q: `${calle} ${numero}, ${ciudad}, ${PROVINCIA}, Argentina` });
      }
      if (resultados.length === 0) {
        setMensaje('No encontramos esa dirección. Marcá la casa tocando el mapa.');
        return;
      }
      moverYCentrar({ lat: Number(resultados[0].lat), lng: Number(resultados[0].lon) });
      setMensaje('Revisá que el pin esté sobre la casa. Si no, arrastralo.');
    } catch {
      setMensaje('No se pudo buscar la dirección. Marcá la casa tocando el mapa.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={buscarDireccion} disabled={buscando} className="btn-navy">
          <Search className="h-4 w-4" aria-hidden />
          {buscando ? 'Buscando...' : 'Buscar dirección en el mapa'}
        </button>
      </div>

      {/* "isolate" evita que el mapa quede por encima del header fijo al scrollear */}
      <div className="isolate overflow-hidden rounded-xl border border-coop-line-strong">
        <MapContainer center={value ?? CENTRO_POR_DEFECTO} zoom={value ? 17 : 14} style={{ height: 320 }} scrollWheelZoom>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickEnMapa onPick={onChange} />
          <CentrarEn coordenadas={centrarEn} />
          {value && (
            <Marker
              position={value}
              icon={iconoPin}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = (e.target as L.Marker).getLatLng();
                  onChange({ lat, lng });
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="space-y-1 text-sm text-coop-muted">
        {mensaje && <p>{mensaje}</p>}
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {value
            ? `Ubicación marcada: ${value.lat.toFixed(6)}, ${value.lng.toFixed(6)}`
            : 'Tocá el mapa sobre la casa del cliente, o buscá la dirección.'}
        </p>
      </div>
    </div>
  );
}
