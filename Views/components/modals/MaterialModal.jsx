import { createPortal } from 'react-dom';
import { CATEGORIES, ZONES, LEVELS, POSITIONS } from '../../utils/constants';
import {
    MODAL_CLASSES, FORM_CLASSES, INPUT_CLASSES, ZNP_CLASSES,
    BUTTON_CLASSES, BADGE_CLASSES,
} from '../../tokens';

/**
 * Modal for creating/editing inventory materials.
 * Per bundle-dynamic-imports — rendered via createPortal.
 * Styles: Tailwind CSS via tokens.js (NO CSS files).
 */
export default function MaterialModal({
    form, updateForm,
    computedLocationCode,
    isEditing, saveMaterial, closeModal,
}) {
    return createPortal(
        <div className={MODAL_CLASSES.overlay}>
            <div className={MODAL_CLASSES.card}>
                <div className={MODAL_CLASSES.header}>
                    <div className={MODAL_CLASSES.header_text}>
                        <h2 className={MODAL_CLASSES.title}>{isEditing ? 'EDITAR MATERIAL' : 'NUEVO MATERIAL'}</h2>
                        <p className={MODAL_CLASSES.subtitle}>Registra un nuevo material para control de stock y ubicación ZNP.</p>
                    </div>
                </div>
                <div className={MODAL_CLASSES.body}>
                    <form onSubmit={saveMaterial}>
                        <h3 className={FORM_CLASSES.section_title}>Información General</h3>
                        <div className={FORM_CLASSES.group}>
                            <label className={FORM_CLASSES.label}>Nombre del Material</label>
                            <input
                                value={form.nombre}
                                onChange={(e) => updateForm('nombre', e.target.value)}
                                type="text"
                                className={INPUT_CLASSES.base}
                                placeholder="Ej: Laptop HP Pavilion"
                                required
                            />
                        </div>
                        <div className={FORM_CLASSES.row}>
                            <div className={FORM_CLASSES.group}>
                                <label className={FORM_CLASSES.label}>Categoría</label>
                                <select
                                    value={form.categoria}
                                    onChange={(e) => updateForm('categoria', e.target.value)}
                                    className={INPUT_CLASSES.base}
                                    required
                                >
                                    <option value="">Seleccionar...</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className={FORM_CLASSES.group}>
                                <label className={FORM_CLASSES.label}>Unidad</label>
                                <input
                                    value={form.unidad}
                                    onChange={(e) => updateForm('unidad', e.target.value)}
                                    type="text"
                                    className={INPUT_CLASSES.base}
                                    placeholder="Ej: UND, KG, M, LT"
                                    required
                                />
                            </div>
                        </div>
                        <div className={FORM_CLASSES.group_spaced}>
                            <label className={FORM_CLASSES.label}>Cantidad</label>
                            <input
                                value={form.cantidad}
                                onChange={(e) => updateForm('cantidad', Number(e.target.value))}
                                type="number"
                                min="0"
                                className={INPUT_CLASSES.base}
                                required
                            />
                        </div>

                        <h3 className={FORM_CLASSES.section_title_border}>Ubicación (Sistema ZNP)</h3>
                        <div className={ZNP_CLASSES.box}>
                            <div className={FORM_CLASSES.row_compact}>
                                <div className={FORM_CLASSES.group}>
                                    <label className={FORM_CLASSES.label_small}>Zona</label>
                                    <select
                                        value={form.zona}
                                        onChange={(e) => updateForm('zona', e.target.value)}
                                        className={INPUT_CLASSES.compact}
                                    >
                                        {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                                    </select>
                                </div>
                                <div className={FORM_CLASSES.group}>
                                    <label className={FORM_CLASSES.label_small}>Nivel</label>
                                    <select
                                        value={form.nivel}
                                        onChange={(e) => updateForm('nivel', Number(e.target.value))}
                                        className={INPUT_CLASSES.compact}
                                    >
                                        {LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className={FORM_CLASSES.group}>
                                    <label className={FORM_CLASSES.label_small}>Posición</label>
                                    <select
                                        value={form.posicion}
                                        onChange={(e) => updateForm('posicion', Number(e.target.value))}
                                        className={INPUT_CLASSES.compact}
                                    >
                                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className={ZNP_CLASSES.preview}>
                                <div className={ZNP_CLASSES.preview_label}>CÓDIGO DE UBICACIÓN</div>
                                <div className={BADGE_CLASSES.location_code_xl}>{computedLocationCode}</div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-5">
                            <button type="button" onClick={closeModal} className={BUTTON_CLASSES.danger}>Cancelar</button>
                            <button type="submit" className={BUTTON_CLASSES.primary}>Guardar Material</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body,
    );
}
