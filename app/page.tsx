'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

const soloNumerosRegex = /^\d+$/;
const soloLetrasRegex = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ\s]+$/;

const limpiarSoloNumeros = (valor: string) => valor.replace(/[^0-9]/g, '');
const limpiarSoloLetras = (valor: string) =>
  valor
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '');

const esquemasValidacion = z.object({
  fecha: z.string().min(1, 'La fecha es requerida'),
  numeroCedula: z
    .string()
    .trim()
    .min(5, 'Mínimo 5 dígitos')
    .max(15, 'Máximo 15 dígitos')
    .regex(soloNumerosRegex, 'Solo se permiten números'),
  nombreTrabajador: z
    .string()
    .trim()
    .min(1, 'El nombre del trabajador es requerido')
    .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
  cargo: z
    .string()
    .trim()
    .min(1, 'El cargo es requerido')
    .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
  articulos: z
    .array(
      z.object({
        nombreArticulo: z
          .string()
          .trim()
          .min(1, 'El nombre del artículo es requerido')
          .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
        talla: z
          .string()
          .trim()
          .min(1, 'La talla es requerida')
          .regex(/^[a-záéíóúñ0-9]+$/i, 'Solo se permiten letras y números'),
        color: z
          .string()
          .trim()
          .min(1, 'El color es requerido')
          .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
        tipoDeNotacion: z.string().min(1, 'El tipo de dotación es requerido'),
      })
    )
    .min(1, 'Debe agregar al menos un artículo'),
  nombreQuienEntrega: z
    .string()
    .trim()
    .min(1, 'El nombre de quien entrega es requerido')
    .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
  cargoQuienEntrega: z
    .string()
    .trim()
    .min(1, 'El cargo de quien entrega es requerido')
    .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
  centroDeCosto: z
    .string()
    .trim()
    .min(1, 'El centro de costo es requerido')
    .regex(/^[a-záéíóúñ0-9\-\s]+$/i, 'Solo se permiten letras, números, guiones y espacios')
    .refine((val) => val.trim() !== '', 'No se permiten solo espacios'),
});

type DatosFormulario = z.infer<typeof esquemasValidacion>;

const opcionesDotacion = [
  'Dotación de ingreso',
  'Dotación trimestral abril',
  'Dotación trimestral agosto',
  'Dotación trimestral diciembre',
];

const camposArticuloIniciales = {
  nombreArticulo: '',
  talla: '',
  color: '',
  tipoDeNotacion: '',
};

type CamposArticuloTemporal = typeof camposArticuloIniciales;
type ArticuloFormulario = DatosFormulario['articulos'][number];

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:text-sm';

const actionButtonClass =
  'inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto';

const secondaryButtonClass =
  'inline-flex w-full items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto';

const submitButtonClass =
  'ml-auto inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto';

function Seccion({
  titulo,
  descripcion,
  children,
}: {
  titulo: string;
  descripcion: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          {titulo}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{descripcion}</p>
      </div>
      {children}
    </section>
  );
}

function Campo({
  label,
  error,
  required = true,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-rose-600"> *</span> : null}
      </label>
      {children}
      {error ? <p className="mt-1 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}

function TarjetaArticuloMovil({
  articulo,
  onEliminar,
}: {
  articulo: ArticuloFormulario;
  onEliminar: () => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">
            Artículo
          </p>
          <h3 className="mt-1 truncate text-base font-semibold text-slate-900">
            {articulo.nombreArticulo}
          </h3>
        </div>

        <button
          type="button"
          onClick={onEliminar}
          className="shrink-0 rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
        >
          Eliminar
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Talla
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{articulo.talla}</dd>
        </div>

        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Color
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{articulo.color}</dd>
        </div>

        <div className="col-span-2 rounded-xl bg-slate-50 p-3">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Tipo
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{articulo.tipoDeNotacion}</dd>
        </div>
      </dl>
    </article>
  );
}

function FormularioEntregaDotacion() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DatosFormulario>({
    resolver: zodResolver(esquemasValidacion),
    defaultValues: {
      articulos: [],
    },
  });

  const { fields: articulosFields, append: agregarArticulo, remove: eliminarArticulo } = useFieldArray({
    control,
    name: 'articulos',
  });

  const [mostrarFormularioArticulo, setMostrarFormularioArticulo] = useState(false);
  const [camposArticuloTemporal, setCamposArticuloTemporal] =
    useState<CamposArticuloTemporal>(camposArticuloIniciales);

  const registrarCampoFiltrado = <T extends keyof DatosFormulario>(
    nombre: T,
    limpiador: (valor: string) => string
  ) => {
    const registro = register(nombre);

    return {
      ...registro,
      onChange: (e: ChangeEvent<HTMLInputElement>) => {
        const valorFiltrado = limpiador(e.target.value);
        if (valorFiltrado !== e.target.value) {
          e.target.value = valorFiltrado;
        }

        registro.onChange(e);
      },
    };
  };

  const registroNumeroCedula = registrarCampoFiltrado('numeroCedula', limpiarSoloNumeros);
  const registroNombreTrabajador = registrarCampoFiltrado('nombreTrabajador', limpiarSoloLetras);
  const registroCargo = registrarCampoFiltrado('cargo', limpiarSoloLetras);
  const registroNombreQuienEntrega = registrarCampoFiltrado(
    'nombreQuienEntrega',
    limpiarSoloLetras
  );
  const registroCargoQuienEntrega = registrarCampoFiltrado('cargoQuienEntrega', limpiarSoloLetras);

  const manejarAgregarArticulo = (e: FormEvent) => {
    e.preventDefault();

    const { nombreArticulo, talla, color, tipoDeNotacion } = camposArticuloTemporal;
    const camposIncompletos =
      !nombreArticulo.trim() || !talla.trim() || !color.trim() || !tipoDeNotacion;

    if (camposIncompletos) {
      alert('Por favor, complete todos los campos del artículo.');
      return;
    }

    agregarArticulo({
      nombreArticulo: limpiarSoloLetras(nombreArticulo).trim(),
      talla: talla.trim(),
      color: limpiarSoloLetras(color).trim(),
      tipoDeNotacion,
    });

    setCamposArticuloTemporal(camposArticuloIniciales);
    setMostrarFormularioArticulo(false);
  };

  const manejarEnvio = () => {
    alert('Formulario enviado correctamente.');
  };

  return (
    <main className="min-h-screen bg-stone-100 px-3 py-4 text-slate-900 sm:px-4 md:px-6 md:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500 sm:text-sm">
                DROMOS
              </p>
              <p className="text-sm text-slate-600">Gestión de talento humano</p>
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl md:text-3xl">
                Entrega de dotación de ley
              </h1>
            </div>

            <dl className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3 md:text-right">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                <dt className="inline font-medium text-slate-800">Código:</dt>
                <dd className="inline"> GTH-F011</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                <dt className="inline font-medium text-slate-800">Fecha:</dt>
                <dd className="inline"> 2025-09-17</dd>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
                <dt className="inline font-medium text-slate-800">Versión:</dt>
                <dd className="inline"> 07</dd>
              </div>
            </dl>
          </div>
        </header>

        <form onSubmit={handleSubmit(manejarEnvio)} noValidate className="space-y-6">
          <Seccion
            titulo="Información general"
            descripcion="Registre los datos principales del trabajador."
          >
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <Campo label="Fecha" error={errors.fecha?.message}>
                <input type="date" {...register('fecha')} className={inputClass} />
              </Campo>

              <Campo label="Número de cédula" error={errors.numeroCedula?.message}>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="Solo números"
                  {...registroNumeroCedula}
                  className={inputClass}
                />
              </Campo>

              <Campo label="Nombre del trabajador" error={errors.nombreTrabajador?.message}>
                <input type="text" {...registroNombreTrabajador} className={inputClass} />
              </Campo>

              <Campo label="Cargo" error={errors.cargo?.message}>
                <input type="text" {...registroCargo} className={inputClass} />
              </Campo>
            </div>
          </Seccion>

          <Seccion
            titulo="Detalle de dotación"
            descripcion="Agregue los artículos que se entregarán."
          >
            <div className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => setMostrarFormularioArticulo((valor) => !valor)}
                  className={actionButtonClass}
                >
                  {mostrarFormularioArticulo ? 'Cerrar formulario' : '+ Agregar artículo'}
                </button>
                <p className="text-sm text-slate-500 sm:max-w-xl">
                  Puede registrar varios artículos antes de enviar.
                </p>
              </div>

              {mostrarFormularioArticulo ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Campo label="Nombre del artículo">
                      <input
                        type="text"
                        value={camposArticuloTemporal.nombreArticulo}
                        onChange={(e) =>
                          setCamposArticuloTemporal((prev) => ({
                            ...prev,
                            nombreArticulo: limpiarSoloLetras(e.target.value),
                          }))
                        }
                        className={inputClass}
                      />
                    </Campo>

                    <Campo label="Talla">
                      <input
                        type="text"
                        placeholder="Ej: S, M, L, XL, 38, 40"
                        value={camposArticuloTemporal.talla}
                        onChange={(e) =>
                          setCamposArticuloTemporal((prev) => ({
                            ...prev,
                            talla: e.target.value,
                          }))
                        }
                        className={inputClass}
                      />
                    </Campo>

                    <Campo label="Color">
                      <input
                        type="text"
                        value={camposArticuloTemporal.color}
                        onChange={(e) =>
                          setCamposArticuloTemporal((prev) => ({
                            ...prev,
                            color: limpiarSoloLetras(e.target.value),
                          }))
                        }
                        className={inputClass}
                      />
                    </Campo>

                    <Campo label="Tipo de dotación">
                      <select
                        value={camposArticuloTemporal.tipoDeNotacion}
                        onChange={(e) =>
                          setCamposArticuloTemporal((prev) => ({
                            ...prev,
                            tipoDeNotacion: e.target.value,
                          }))
                        }
                        className={inputClass}
                      >
                        <option value="">Seleccione una opción</option>
                        {opcionesDotacion.map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                      </select>
                    </Campo>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={manejarAgregarArticulo}
                      className={actionButtonClass}
                    >
                      Agregar artículo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarFormularioArticulo(false);
                        setCamposArticuloTemporal(camposArticuloIniciales);
                      }}
                      className={secondaryButtonClass}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : null}

              {articulosFields.length > 0 ? (
                <>
                  <div className="space-y-3 md:hidden">
                    {articulosFields.map((articulo, indice) => (
                      <TarjetaArticuloMovil
                        key={articulo.id}
                        articulo={articulo}
                        onEliminar={() => eliminarArticulo(indice)}
                      />
                    ))}
                  </div>

                  <div className="hidden w-full overflow-x-auto rounded-2xl border border-slate-200 md:block">
                    <table className="w-full min-w-[920px] table-fixed border-collapse text-sm">
                      <colgroup>
                        <col className="w-[24%]" />
                        <col className="w-[14%]" />
                        <col className="w-[18%]" />
                        <col className="w-[30%]" />
                        <col className="w-[14%]" />
                      </colgroup>
                      <thead className="bg-slate-50 text-left text-slate-600">
                        <tr>
                          <th className="px-4 py-3 font-medium">Artículo</th>
                          <th className="px-4 py-3 font-medium">Talla</th>
                          <th className="px-4 py-3 font-medium">Color</th>
                          <th className="px-4 py-3 font-medium">Tipo</th>
                          <th className="px-4 py-3 text-center font-medium">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 bg-white">
                        {articulosFields.map((articulo, indice) => (
                          <tr key={articulo.id} className="align-top">
                            <td className="break-words px-4 py-3 text-slate-700">{articulo.nombreArticulo}</td>
                            <td className="break-words px-4 py-3 text-slate-700">{articulo.talla}</td>
                            <td className="break-words px-4 py-3 text-slate-700">{articulo.color}</td>
                            <td className="break-words px-4 py-3 text-slate-700">{articulo.tipoDeNotacion}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => eliminarArticulo(indice)}
                                className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No hay artículos agregados.
                </div>
              )}

              {errors.articulos ? (
                <p className="text-sm text-rose-600">{errors.articulos.message}</p>
              ) : null}
            </div>
          </Seccion>

          <Seccion
            titulo="Información de entrega"
            descripcion="Registre los datos de la persona que entrega la dotación."
          >
            <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
              <Campo label="Nombre de quien entrega" error={errors.nombreQuienEntrega?.message}>
                <input type="text" {...registroNombreQuienEntrega} className={inputClass} />
              </Campo>

              <Campo label="Cargo de quien entrega" error={errors.cargoQuienEntrega?.message}>
                <input type="text" {...registroCargoQuienEntrega} className={inputClass} />
              </Campo>

              <Campo
                label="Centro de costo"
                error={errors.centroDeCosto?.message}
                required={false}
              >
                <input type="text" {...register('centroDeCosto')} className={inputClass} />
              </Campo>
            </div>
          </Seccion>

          <div className="flex">
            <button type="submit" className={submitButtonClass}>
              Enviar formulario
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function Home() {
  return <FormularioEntregaDotacion />;
}
