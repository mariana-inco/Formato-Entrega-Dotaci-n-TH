'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

const soloNumerosRegex = /^\d+$/;
const soloLetrasRegex = /^[A-Za-zÀ-ÖØ-öø-ÿÑñ\s]+$/;

const limpiarSoloNumeros = (valor: string) => valor.replace(/[^0-9]/g, '');
const limpiarSoloLetras = (valor: string) =>
  valor
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿÑñ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^\s+/, '');

const esquemasValidacion = z.object({
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  numeroCedula: z
    .string()
    .trim()
    .min(5, 'Mínimo 5 dígitos')
    .max(15, 'Máximo 15 dígitos')
    .regex(soloNumerosRegex, 'Solo se permiten números'),
  nombreTrabajador: z
    .string()
    .trim()
    .min(1, 'El nombre del trabajador es obligatorio')
    .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
  cargo: z
    .string()
    .trim()
    .min(1, 'El cargo es obligatorio')
    .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
  articulos: z
    .array(
      z.object({
        nombreArticulo: z
          .string()
          .trim()
          .min(1, 'El nombre del artículo es obligatorio')
          .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
        talla: z
          .string()
          .trim()
          .min(1, 'La talla es obligatoria')
          .regex(/^[a-záéíóúñ0-9]+$/i, 'Solo se permiten letras y números'),
        color: z
          .string()
          .trim()
          .min(1, 'El color es obligatorio')
          .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
        tipoDeNotacion: z.string().min(1, 'El tipo de dotación es obligatorio'),
      })
    )
    .min(1, 'Debe agregar al menos un artículo'),
  nombreQuienEntrega: z
    .string()
    .trim()
    .min(1, 'El nombre de quien entrega es obligatorio')
    .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
  cargoQuienEntrega: z
    .string()
    .trim()
    .min(1, 'El cargo de quien entrega es obligatorio')
    .regex(soloLetrasRegex, 'Solo se permiten letras, tildes, ñ y espacios'),
  centroDeCosto: z
    .string()
    .trim()
    .min(1, 'El centro de costo es obligatorio')
    .regex(/^[a-záéíóúñ0-9\-\s]+$/i, 'Solo se permiten letras, números, guiones y espacios')
    .refine((val) => val.trim() !== '', 'No se permiten solo espacios'),
});

type DatosFormulario = z.infer<typeof esquemasValidacion>;

const opcionesDotacion = [
  'Dotación de ingreso',
  'Dotación trimestral abril',
  'Dotación trimestral agosto ',
  'Dotacion trimestral diciembre',
];

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
  const [camposArticuloTemporal, setCamposArticuloTemporal] = useState({
    nombreArticulo: '',
    talla: '',
    color: '',
    tipoDeNotacion: '',
  });

  const registrarCampoFiltrado = <T extends keyof DatosFormulario>(
    nombre: T,
    limpiador: (valor: string) => string
  ) => {
    const registro = register(nombre);

    return {
      ...registro,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const manejarAgregarArticulo = (e: React.FormEvent) => {
    e.preventDefault();

    const erroresArticulo: Record<string, boolean> = {};
    if (!camposArticuloTemporal.nombreArticulo.trim()) erroresArticulo.nombreArticulo = true;
    if (!camposArticuloTemporal.talla.trim()) erroresArticulo.talla = true;
    if (!camposArticuloTemporal.color.trim()) erroresArticulo.color = true;
    if (!camposArticuloTemporal.tipoDeNotacion) erroresArticulo.tipoDeNotacion = true;

    if (Object.keys(erroresArticulo).length > 0) {
      alert('Por favor, complete todos los campos del artículo.');
      return;
    }

    // Si la validación es correcta, agregar el artículo
    agregarArticulo({
      nombreArticulo: limpiarSoloLetras(camposArticuloTemporal.nombreArticulo).trim(),
      talla: camposArticuloTemporal.talla.trim(),
      color: limpiarSoloLetras(camposArticuloTemporal.color).trim(),
      tipoDeNotacion: camposArticuloTemporal.tipoDeNotacion,
    });

    // Limpiar campos temporales
    setCamposArticuloTemporal({
      nombreArticulo: '',
      talla: '',
      color: '',
      tipoDeNotacion: '',
    });

    setMostrarFormularioArticulo(false);
  };

  const manejarEnvio = (datos: DatosFormulario) => {
    console.log('Datos del formulario:', datos);
    alert('Formulario enviado correctamente. Revisa la consola para ver los datos.');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow">
        {/* Encabezado */}
        <div className="border-b-4 border-blue-600 p-6 bg-gray-50">
          <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b">
            <div>
              <h2 className="text-2xl font-bold text-red-600">DROMOS</h2>
            </div>
            <div className="text-center">
              <p className="font-bold text-gray-800">GESTIÓN DE TALENTO HUMANO</p>
              <p className="font-bold text-gray-800">ENTREGA DE DOTACIÓN DE LEY</p>
            </div>
            <div className="text-right text-sm">
              <p>
                <span className="font-semibold">Código:</span> GTH-F011
              </p>
              <p>
                <span className="font-semibold">Fecha:</span> 2025-09-17
              </p>
              <p>
                <span className="font-semibold">Versión:</span> 07
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit(manejarEnvio)} className="p-6 space-y-8">
          {/* Sección 1: Información General */}
          <div className="border rounded-lg p-6 bg-blue-50 border-blue-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-300">
              1. INFORMACIÓN GENERAL
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Registre los datos principales del trabajador que recibe la dotación.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Fecha <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  {...register('fecha')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fecha && <p className="text-red-600 text-sm mt-1">{errors.fecha.message}</p>}
              </div>

              {/* Número de cédula */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Número de cédula <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="Solo números enteros"
                  {...registroNumeroCedula}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.numeroCedula && (
                  <p className="text-red-600 text-sm mt-1">{errors.numeroCedula.message}</p>
                )}
              </div>

              {/* Nombre del trabajador */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre del trabajador <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...registroNombreTrabajador}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.nombreTrabajador && (
                  <p className="text-red-600 text-sm mt-1">{errors.nombreTrabajador.message}</p>
                )}
              </div>

              {/* Cargo */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cargo <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...registroCargo}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.cargo && <p className="text-red-600 text-sm mt-1">{errors.cargo.message}</p>}
              </div>
            </div>
          </div>

          {/* Sección 2: Detalle de Dotación */}
          <div className="border rounded-lg p-6 bg-green-50 border-green-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-green-300">
              2. DETALLE DE DOTACIÓN
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Registre los artículos de dotación que serán entregados al trabajador.
            </p>

            {/* Formulario para agregar artículos */}
            {!mostrarFormularioArticulo ? (
              <button
                type="button"
                onClick={() => setMostrarFormularioArticulo(true)}
                className="mb-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
              >
                + Agregar artículo
              </button>
            ) : (
              <div className="mb-6 p-4 bg-white border border-blue-300 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Nombre del artículo */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre del artículo <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={camposArticuloTemporal.nombreArticulo}
                      onChange={(e) =>
                        setCamposArticuloTemporal((prev) => ({
                          ...prev,
                          nombreArticulo: limpiarSoloLetras(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Talla */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Talla <span className="text-red-600">*</span>
                    </label>
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={camposArticuloTemporal.color}
                      onChange={(e) =>
                        setCamposArticuloTemporal((prev) => ({
                          ...prev,
                          color: limpiarSoloLetras(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Tipo de dotación */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de dotación <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={camposArticuloTemporal.tipoDeNotacion}
                      onChange={(e) =>
                        setCamposArticuloTemporal((prev) => ({
                          ...prev,
                          tipoDeNotacion: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccione una opción</option>
                      {opcionesDotacion.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={manejarAgregarArticulo}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
                  >
                    Agregar artículo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormularioArticulo(false);
                      setCamposArticuloTemporal({
                        nombreArticulo: '',
                        talla: '',
                        color: '',
                        tipoDeNotacion: '',
                      });
                    }}
                    className="px-4 py-2 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Tabla de artículos */}
            {articulosFields.length > 0 ? (
              <div className="overflow-x-auto border border-gray-300 rounded-lg">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                        ENTREGA DE
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                        TALLA
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-800">
                        COLOR
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-800">
                        ACCIONES
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {articulosFields.map((articulo, indice) => (
                      <tr key={articulo.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {articulo.nombreArticulo}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {articulo.talla}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-gray-700">
                          {articulo.color}
                        </td>
                        <td className="border border-gray-300 px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => eliminarArticulo(indice)}
                            className="px-3 py-1 bg-red-600 text-white font-semibold text-sm rounded hover:bg-red-700 transition"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-white border border-gray-300 rounded-lg text-center text-gray-600">
                No hay artículos agregados.
              </div>
            )}

            {errors.articulos && (
              <p className="text-red-600 text-sm mt-2">{errors.articulos.message}</p>
            )}
          </div>

          {/* Sección 3: Información de Entrega */}
          <div className="border rounded-lg p-6 bg-purple-50 border-purple-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-purple-300">
              3. INFORMACIÓN DE ENTREGA
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Registre los datos de la persona responsable de entregar la dotación.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre de quien entrega */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nombre de quien entrega <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...registroNombreQuienEntrega}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.nombreQuienEntrega && (
                  <p className="text-red-600 text-sm mt-1">{errors.nombreQuienEntrega.message}</p>
                )}
              </div>

              {/* Cargo de quien entrega */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Cargo de quien entrega <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...registroCargoQuienEntrega}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.cargoQuienEntrega && (
                  <p className="text-red-600 text-sm mt-1">{errors.cargoQuienEntrega.message}</p>
                )}
              </div>

              {/* Centro de costo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Centro de costo <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  {...register('centroDeCosto')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {errors.centroDeCosto && (
                  <p className="text-red-600 text-sm mt-1">{errors.centroDeCosto.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-center">
            <button
              type="submit"
              className="px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 transition"
            >
              Enviar Formulario
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Home() {
  return <FormularioEntregaDotacion />;
}
