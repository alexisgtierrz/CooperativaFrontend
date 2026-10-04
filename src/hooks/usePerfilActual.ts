import { useCallback, useEffect, useState } from 'react';
import { ApiError, apiJson } from '../lib/api';
import type { PerfilActual } from '../types';

interface Estado {
  data: PerfilActual | null;
  loading: boolean;
  error: string;
  status: number | null;
}

/** GET /api/clientes/perfil-actual (lo usan Perfil, Vencimientos y Reclamos) */
export function usePerfilActual() {
  const [state, setState] = useState<Estado>({ data: null, loading: true, error: '', status: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let cancelado = false;
    apiJson<PerfilActual>('/clientes/perfil-actual')
      .then((data) => {
        if (!cancelado) setState({ data, loading: false, error: '', status: 200 });
      })
      .catch((err: unknown) => {
        if (cancelado) return;
        const status = err instanceof ApiError ? err.status : null;
        const error =
          status === 404
            ? 'No se encontró información de asociado para este usuario.'
            : status === 401 || status === 403
              ? 'Tu sesión expiró. Volvé a iniciar sesión.'
              : 'No pudimos conectarnos con el servidor. Probá de nuevo en unos minutos.';
        console.error('Error al obtener el perfil:', err);
        setState({ data: null, loading: false, error, status });
      });
    return () => {
      cancelado = true;
    };
  }, [version]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: '' }));
    setVersion((v) => v + 1);
  }, []);

  return { ...state, reload };
}
