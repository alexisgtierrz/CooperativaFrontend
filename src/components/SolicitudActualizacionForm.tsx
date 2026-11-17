import { useMemo, useState, type FormEvent } from 'react';
import type { Barrio, DatosCliente, DatosClienteEnvio, Localidad } from '../types';

interface Props {
  //Valores con los que arranca el formulario
  inicial: DatosCliente;
  localidades: Localidad[];
  barrios: Barrio[];
  submitLabel: string;
  enviando?: boolean;
  //Prefijo para los id de los campos
  idPrefix?: string;
  onSubmit: (datos: DatosClienteEnvio) => void;
  onCancel: () => void;
}

//Formulario de datos editables del cliente: lo usa el cliente (pedir cambios) y el admin (corregir antes de confirmar)
export default function SolicitudActualizacionForm({
  inicial,
  localidades,
  barrios,
  submitLabel,
  enviando = false,
  idPrefix = 'sol',
  onSubmit,
  onCancel,
}: Props) {
  const [nombre, setNombre] = useState(inicial.nombre ?? '');
  const [apellido, setApellido] = useState(inicial.apellido ?? '');
  const [telefono, setTelefono] = useState(inicial.telefono ?? '');
  const [calle, setCalle] = useState(inicial.calle ?? '');
  const [numero, setNumero] = useState(inicial.numero != null ? String(inicial.numero) : '');
  const [piso, setPiso] = useState(inicial.piso ?? '');
  const [departamento, setDepartamento] = useState(inicial.departamento ?? '');
  const [observaciones, setObservaciones] = useState(inicial.observaciones ?? '');
  const [barrioId, setBarrioId] = useState(inicial.barrioId != null ? String(inicial.barrioId) : '');
  const [localidadId, setLocalidadId] = useState(() => {
    if (inicial.localidadId != null) return String(inicial.localidadId);
    const barrio = barrios.find((b) => b.id === inicial.barrioId);
    return barrio?.localidad?.id != null ? String(barrio.localidad.id) : '';
  });
  const [error, setError] = useState('');

  const barriosFiltrados = useMemo(
    () => barrios.filter((b) => !localidadId || b.localidad?.id === Number(localidadId)),
    [barrios, localidadId],
  );

  const cambiarLocalidad = (valor: string) => {
    setLocalidadId(valor);
    //Si el barrio elegido no pertenece a la nueva localidad, se limpia
    const barrio = barrios.find((b) => String(b.id) === barrioId);
    if (barrio && valor && barrio.localidad?.id !== Number(valor)) setBarrioId('');
  };

  const enviar = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const hayDomicilio = calle.trim() !== '' || numero.trim() !== '' || barrioId !== '';
    if (hayDomicilio && (calle.trim() === '' || numero.trim() === '' || barrioId === '')) {
      setError('Para cambiar el domicilio completá calle, número y barrio.');
      return;
    }
    setError('');
    onSubmit({
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      telefono: telefono.trim() || null,
      calle: calle.trim() || null,
      numero: numero.trim() ? Number(numero) : null,
      piso: piso.trim() || null,
      departamento: departamento.trim() || null,
      observaciones: observaciones.trim() || null,
      barrioId: barrioId ? Number(barrioId) : null,
    });
  };

  const id = (campo: string) => `${idPrefix}-${campo}`;

  return (
    <form onSubmit={enviar} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={id('nombre')} className="field-label">
          Nombre
        </label>
        <input id={id('nombre')} className="field" value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={100} />
      </div>
      <div>
        <label htmlFor={id('apellido')} className="field-label">
          Apellido
        </label>
        <input id={id('apellido')} className="field" value={apellido} onChange={(e) => setApellido(e.target.value)} required maxLength={100} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={id('telefono')} className="field-label">
          Teléfono
        </label>
        <input
          id={id('telefono')}
          type="tel"
          className="field"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          maxLength={50}
        />
      </div>

      <h3 className="mt-2 border-b border-coop-line-soft pb-2 text-sm font-bold uppercase tracking-wider text-coop-green sm:col-span-2">
        Domicilio de servicio
      </h3>
      <div>
        <label htmlFor={id('calle')} className="field-label">
          Calle
        </label>
        <input id={id('calle')} className="field" value={calle} onChange={(e) => setCalle(e.target.value)} />
      </div>
      <div>
        <label htmlFor={id('numero')} className="field-label">
          Número
        </label>
        <input
          id={id('numero')}
          className="field"
          type="number"
          inputMode="numeric"
          min={0}
          value={numero}
          onChange={(e) => setNumero(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={id('piso')} className="field-label">
          Piso <span className="text-xs font-normal text-coop-muted">(opcional)</span>
        </label>
        <input id={id('piso')} className="field" value={piso} onChange={(e) => setPiso(e.target.value)} />
      </div>
      <div>
        <label htmlFor={id('departamento')} className="field-label">
          Departamento <span className="text-xs font-normal text-coop-muted">(opcional)</span>
        </label>
        <input id={id('departamento')} className="field" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
      </div>
      <div>
        <label htmlFor={id('localidad')} className="field-label">
          Localidad
        </label>
        <select id={id('localidad')} className="field" value={localidadId} onChange={(e) => cambiarLocalidad(e.target.value)}>
          <option value="">Seleccione una localidad...</option>
          {localidades.map((l) => (
            <option key={l.id} value={l.id}>
              {l.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={id('barrio')} className="field-label">
          Barrio
        </label>
        <select id={id('barrio')} className="field" value={barrioId} onChange={(e) => setBarrioId(e.target.value)}>
          <option value="">Seleccione un barrio...</option>
          {barriosFiltrados.map((b) => (
            <option key={b.id} value={b.id}>
              {b.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={id('observaciones')} className="field-label">
          Observaciones <span className="text-xs font-normal text-coop-muted">(opcional)</span>
        </label>
        <input id={id('observaciones')} className="field" value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 sm:col-span-2">
          {error}
        </p>
      )}

      <div className="mt-2 flex flex-col-reverse gap-3 border-t border-coop-line-soft pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="btn-outline">
          Cancelar
        </button>
        <button type="submit" disabled={enviando} className="btn-primary">
          {enviando ? 'Enviando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
