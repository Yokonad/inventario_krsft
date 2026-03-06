/**
 * MaterialModal – Create/Edit material with ZNP location (Tailwind, Modal UI).
 */
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { CATEGORIES, ZONES, LEVELS, POSITIONS } from '../../utils/constants';

export default function MaterialModal({
    form, updateForm, computedLocationCode,
    isEditing, saveMaterial, closeModal,
}) {
    return (
        <Modal
            open={true}
            onClose={closeModal}
            title={isEditing ? 'EDITAR MATERIAL' : 'NUEVO MATERIAL'}
            size="lg"
            hideClose
            footer={
                <>
                    <button type="button" onClick={closeModal}
                        className="rounded-full bg-red-500 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 transition-colors">
                        Cancelar
                    </button>
                    <Button variant="primary" type="submit" form="material-form">Guardar Material</Button>
                </>
            }
        >
            <p className="text-sm text-gray-500 mb-4">Registra un nuevo material para control de stock y ubicación ZNP.</p>
            <form onSubmit={saveMaterial} id="material-form">
                {/* Información General */}
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-gray-200" /> Información General <span className="h-px flex-1 bg-gray-200" />
                </h3>
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Tipo de Material</label>
                        <input value={form.nombre} onChange={(e) => updateForm('nombre', e.target.value)} type="text" placeholder="Ej: bridas s.o., codos sw, válvulas"
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Especificación Técnica</label>
                        <input value={form.descripcion} onChange={(e) => updateForm('descripcion', e.target.value)} type="text" placeholder="Ej: bridas s.o. de 2&quot; x 150 lb."
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-0.5">Categoría <span className="text-red-500">*</span></label>
                            <select value={form.categoria} onChange={(e) => updateForm('categoria', e.target.value)} required
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary">
                                <option value="">Seleccionar...</option>
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-0.5">Unidad <span className="text-red-500">*</span></label>
                            <input value={form.unidad} onChange={(e) => updateForm('unidad', e.target.value)} type="text" required placeholder="UND, KG, M, LT"
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Cantidad <span className="text-red-500">*</span></label>
                        <input value={form.cantidad} onChange={(e) => updateForm('cantidad', Number(e.target.value))} type="number" min="0" required
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-0.5">Precio Total (S/)</label>
                        <input value={form.precio} onChange={(e) => updateForm('precio', e.target.value)} type="number" min="0" step="0.01" placeholder="0.00"
                            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary" />
                        {form.precio > 0 && form.cantidad > 1 && (
                            <p className="mt-1 text-xs text-gray-500">
                                Precio unitario: <span className="font-semibold text-primary-700">S/ {(form.precio / form.cantidad).toFixed(2)}</span>
                            </p>
                        )}
                        {form.precio > 0 && form.cantidad === 1 && (
                            <p className="mt-1 text-xs text-gray-500">
                                Precio unitario: <span className="font-semibold text-primary-700">S/ {Number(form.precio).toFixed(2)}</span>
                            </p>
                        )}
                    </div>
                </div>

                {/* Ubicación ZNP */}
                <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3 flex items-center gap-2">
                    <span className="h-px flex-1 bg-gray-200" /> Ubicación (Sistema ZNP) <span className="h-px flex-1 bg-gray-200" />
                </h3>
                <div className="rounded-lg border border-primary-100 bg-primary-50/50 p-4">
                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-0.5">Zona</label>
                            <select value={form.zona} onChange={(e) => updateForm('zona', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary">
                                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-0.5">Nivel</label>
                            <select value={form.nivel} onChange={(e) => updateForm('nivel', Number(e.target.value))}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary">
                                {LEVELS.map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-0.5">Posición</label>
                            <select value={form.posicion} onChange={(e) => updateForm('posicion', Number(e.target.value))}
                                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:ring-primary">
                                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="rounded bg-white border border-primary-200 p-3 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Código de Ubicación</p>
                        <p className="text-xl font-bold text-primary-700 font-mono">{computedLocationCode}</p>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
