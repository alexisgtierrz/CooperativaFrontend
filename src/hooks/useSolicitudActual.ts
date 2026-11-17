import { useCallback, useEffect, useState } from 'react';
import { obtenerMiSolicitud } from '../lib/solicitudes';
import type { SolicitudActualizacion } from '../types';

/** Última solicitud de actualización de datos del cliente autenticado (GET /api/solicitudes-actualizacion/mia) */
export function useSolicitudActual() {
  const [solicitud, setSolicitud] = useState<SolicitudActualizacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;
    obtenerMiSolicitud()
      .then((data) => {
        if (!cancelado) setSolicitud(data);
      })
      .catch((err: unknown) => {
        console.error('Error al consultar la solicitud de actualización:', err);
        if (!cancelado) setSolicitud(null);
      })
      .finally(() => {
        if (!cancelado) setLoading(false);
      });
    return () => {
      cancelado = true;
    };
  }, [version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);

  return { solicitud, loading, recargar };
}
