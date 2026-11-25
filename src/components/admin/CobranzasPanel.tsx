import { Fragment, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Search, Users, Wallet } from 'lucide-react';
import { Badge, EmptyState, ErrorState, LoadingState } from '../ui';
import { formatearFechaSimple } from '../../lib/format';
import { formatearImporte, listarCobranzas, mensajeDeError, nombrePeriodo } from '../../lib/facturas';
import type { CobranzaCliente } from '../../types';

type Filtro = 'deudores' | 'pendientes' | 'aldia' | 'todos';

const FILTROS: { id: Filtro; label: string }[] = [
  { id: 'deudores', label: 'Deudores' },
  { id: 'pendientes', label: 'Con facturas pendientes' },
  { id: 'aldia', label: 'Al día' },
  { id: 'todos', label: 'Todos' },
];

function estadoDe(c: CobranzaCliente) {
  if (c.facturasVencidas > 0) return { tone: 'red' as const, texto: 'Deudor' };
  if (c.facturasPendientes > 0) return { tone: 'orange' as const, texto: 'Pendiente' };
  return { tone: 'green' as const, texto: 'Al día' };
}

//Vista de administrador: clientes con sus servicios, facturas, vencimientos y deuda
export default function CobranzasPanel({ onResumen }: { onResumen?: (deudores: number) => void }) {
  const [datos, setDatos] = useState<CobranzaCliente[] | null>(null);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('deudores');
  const [busqueda, setBusqueda] = useState('');
  const [abiertos, setAbiertos] = useState<Set<number>>(new Set());

  const cargar = useCallback(async () => {
    setError('');
    setDatos(null);
    try {
      const lista = await listarCobranzas();
      setDatos(lista);
      onResumen?.(lista.filter((c) => c.facturasVencidas > 0).length);
    } catch (e) {
      setError(mensajeDeError(e, 'No pudimos cargar las cobranzas.'));
    }
  }, [onResumen]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const resumen = useMemo(() => {
    const lista = datos ?? [];
    return {
      deudores: lista.filter((c) => c.facturasVencidas > 0).length,
      deudaVencida: lista.reduce((s, c) => s + c.deudaVencida, 0),
      deudaTotal: lista.reduce((s, c) => s + c.deudaTotal, 0),
      alDia: lista.filter((c) => c.facturasPendientes === 0).length,
    };
  }, [datos]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return (datos ?? []).filter((c) => {
      if (filtro === 'deudores' && c.facturasVencidas === 0) return false;
      if (filtro === 'pendientes' && c.facturasPendientes === 0) return false;
      if (filtro === 'aldia' && c.facturasPendientes > 0) return false;
      if (!texto) return true;
      return [c.nombre, c.dni, c.email ?? '', ...c.servicios.map((s) => s.nombre)].some((v) => v.toLowerCase().includes(texto));
    });
  }, [datos, filtro, busqueda]);

  const alternar = (id: number) =>
    setAbiertos((previo) => {
      const nuevo = new Set(previo);
      if (nuevo.has(id)) nuevo.delete(id);
      else nuevo.add(id);
      return nuevo;
    });

  if (error) {
    return (
      <ErrorState
        message={error}
        action={
          <button type="button" onClick={cargar} className="btn-navy">
            Reintentar
          </button>
        }
      />
    );
  }
  if (datos === null) return <LoadingState label="Calculando cobranzas…" />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador icono={<AlertTriangle size={20} />} etiqueta="Clientes deudores" valor={String(resumen.deudores)} alerta={resumen.deudores > 0} />
        <Indicador icono={<Wallet size={20} />} etiqueta="Deuda vencida" valor={formatearImporte(resumen.deudaVencida)} alerta={resumen.deudaVencida > 0} />
        <Indicador icono={<Wallet size={20} />} etiqueta="Total a cobrar" valor={formatearImporte(resumen.deudaTotal)} />
        <Indicador icono={<CheckCircle2 size={20} />} etiqueta="Clientes al día" valor={`${resumen.alDia} de ${datos.length}`} />
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar clientes">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
              className={`min-h-[40px] rounded-full border px-4 text-sm font-bold transition-colors ${
                filtro === f.id ? 'border-coop-green bg-coop-green text-white' : 'border-coop-line bg-white text-coop-ink hover:bg-coop-ground'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative lg:w-80">
          <label htmlFor="busqueda-cobranzas" className="sr-only">
            Buscar cliente
          </label>
          <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-coop-muted" aria-hidden="true" />
          <input
            id="busqueda-cobranzas"
            type="search"
            placeholder="Buscar por nombre, DNI, email o servicio"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="field pl-10"
          />
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={filtro === 'deudores' ? <CheckCircle2 size={30} /> : <Users size={30} />}
            title={filtro === 'deudores' && !busqueda ? 'No hay clientes deudores' : 'Sin resultados'}
            text={filtro === 'deudores' && !busqueda ? 'Ningún cliente tiene facturas vencidas sin pagar.' : 'Probá con otro filtro o búsqueda.'}
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {visibles.map((c) => {
            const estado = estadoDe(c);
            const abierto = abiertos.has(c.clienteId);
            return (
              <li key={c.clienteId} className="card overflow-hidden">
                <button
                  type="button"
                  onClick={() => alternar(c.clienteId)}
                  aria-expanded={abierto}
                  className="flex w-full flex-col gap-3 p-4 text-left hover:bg-coop-ground/60 sm:p-5 lg:flex-row lg:items-center"
                >
                  <span className="flex min-w-0 flex-1 items-start gap-3">
                    {abierto ? <ChevronDown size={20} className="mt-1 shrink-0" aria-hidden="true" /> : <ChevronRight size={20} className="mt-1 shrink-0" aria-hidden="true" />}
                    <span className="min-w-0">
                      <span className="block truncate text-lg font-bold">{c.nombre || `Cliente #${c.clienteId}`}</span>
                      <span className="block truncate text-sm text-coop-muted">
                        DNI {c.dni}
                        {c.email ? ` · ${c.email}` : ''}
                        {c.telefono ? ` · ${c.telefono}` : ''}
                      </span>
                      <span className="mt-1 block text-sm">
                        {c.servicios.length > 0 ? c.servicios.map((s) => s.nombre).join(' · ') : <em className="text-coop-muted">Sin servicios activos</em>}
                      </span>
                    </span>
                  </span>
                  <span className="grid grid-cols-3 gap-4 pl-8 text-sm lg:w-[430px] lg:pl-0">
                    <span>
                      <span className="block text-xs text-coop-muted">Deuda vencida</span>
                      <span className={`font-bold ${c.deudaVencida > 0 ? 'text-red-700' : ''}`}>{formatearImporte(c.deudaVencida)}</span>
                    </span>
                    <span>
                      <span className="block text-xs text-coop-muted">{c.facturasVencidas > 0 ? 'Atraso máx.' : 'Próx. venc.'}</span>
                      <span className="font-bold">
                        {c.facturasVencidas > 0
                          ? `${c.diasMaxAtraso} ${c.diasMaxAtraso === 1 ? 'día' : 'días'}`
                          : c.proximoVencimiento
                            ? formatearFechaSimple(c.proximoVencimiento)
                            : '—'}
                      </span>
                    </span>
                    <span className="flex items-start justify-end lg:justify-start">
                      <Badge tone={estado.tone}>{estado.texto}</Badge>
                    </span>
                  </span>
                </button>

                {abierto && (
                  <div className="border-t border-coop-line-soft bg-coop-ground/40 p-4 sm:p-5">
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-coop-green">Servicios contratados</h3>
                    {c.servicios.length === 0 ? (
                      <p className="mb-4 text-sm text-coop-muted">Sin servicios activos.</p>
                    ) : (
                      <ul className="mb-5 flex flex-wrap gap-2">
                        {c.servicios.map((s, i) => (
                          <li key={`${s.nombre}-${i}`} className="rounded-full border border-coop-line bg-white px-3 py-1 text-sm">
                            <strong>{s.nombre}</strong>
                            {s.vigenteHasta && <span className="text-coop-muted"> · pagado hasta {formatearFechaSimple(s.vigenteHasta)}</span>}
                          </li>
                        ))}
                      </ul>
                    )}

                    <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-coop-green">Facturas</h3>
                    {c.facturas.length === 0 ? (
                      <p className="text-sm text-coop-muted">Todavía no tiene facturas emitidas.</p>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-coop-line bg-white">
                        <table className="w-full min-w-[620px] border-collapse text-left text-sm">
                          <thead className="bg-coop-ground text-xs uppercase text-coop-muted">
                            <tr>
                              <th className="px-3 py-2">N.º</th>
                              <th className="px-3 py-2">Período</th>
                              <th className="px-3 py-2">Servicios</th>
                              <th className="px-3 py-2">Vencimiento</th>
                              <th className="px-3 py-2 text-right">Importe</th>
                              <th className="px-3 py-2">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {c.facturas.map((f) => (
                              <Fragment key={f.id}>
                                <tr className="border-t border-coop-line-soft">
                                  <td className="px-3 py-2 font-semibold">{f.id}</td>
                                  <td className="px-3 py-2">{nombrePeriodo(f.periodo)}</td>
                                  <td className="px-3 py-2">{f.servicios.join(', ') || '—'}</td>
                                  <td className="px-3 py-2">{formatearFechaSimple(f.fechaVencimiento)}</td>
                                  <td className="px-3 py-2 text-right font-semibold">{formatearImporte(f.montoTotal)}</td>
                                  <td className="px-3 py-2">
                                    {f.estado === 'PAGADA' ? (
                                      <Badge tone="green">Pagada{f.fechaPago ? ` · ${formatearFechaSimple(f.fechaPago.slice(0, 10))}` : ''}</Badge>
                                    ) : f.vencida ? (
                                      <Badge tone="red">Vencida</Badge>
                                    ) : (
                                      <Badge tone="orange">Pendiente</Badge>
                                    )}
                                  </td>
                                </tr>
                              </Fragment>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Indicador({ icono, etiqueta, valor, alerta }: { icono: ReactNode; etiqueta: string; valor: string; alerta?: boolean }) {
  return (
    <div className={`card flex items-center gap-3 p-4 ${alerta ? 'border-red-200 bg-red-50' : ''}`}>
      <span className={`flex h-10 w-10 flex-none items-center justify-center rounded-xl ${alerta ? 'bg-red-100 text-red-700' : 'bg-coop-ground text-coop-muted'}`}>
        {icono}
      </span>
      <div className="min-w-0">
        <div className="truncate font-display text-2xl font-bold leading-none">{valor}</div>
        <div className="mt-1 text-xs text-coop-muted">{etiqueta}</div>
      </div>
    </div>
  );
}
