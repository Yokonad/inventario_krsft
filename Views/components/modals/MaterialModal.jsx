import { createPortal } from 'react-dom';
import { CATEGORIES, ZONES, LEVELS, POSITIONS } from '../../utils/constants';

/**
 * Modal for creating/editing inventory materials.
 * Per bundle-dynamic-imports — rendered via createPortal.
 */
export default function MaterialModal({
    form, updateForm,
    computedLocationCode,
    isEditing, saveMaterial, closeModal,
}) {
    return createPortal(
        <div className="modal-overlay">
            <div className="modal-card">
                <div className="modal-header">
                    <div className="modal-header-text">
                        <h2 className="modal-title">NUEVO MATERIAL</h2>
                        <p className="modal-subtitle">Registra un nuevo material para control de stock y ubicación ZNP.</p>
                    </div>
                </div>
                <div className="modal-body">
                    <form onSubmit={saveMaterial}>
                        <h3 className="section-title">Información General</h3>
                        <div className="form-group">
                            <label className="form-label">Nombre del Material</label>
                            <input value={form.nombre} onChange={(e) => updateForm('nombre', e.target.value)} type="text" className="input-field" placeholder="Ej: Laptop HP Pavilion" required />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="form-label">Categoría</label>
                                <select value={form.categoria} onChange={(e) => updateForm('categoria', e.target.value)} className="input-field" required>
                                    <option value="">Seleccionar...</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Unidad</label>
                                <input value={form.unidad} onChange={(e) => updateForm('unidad', e.target.value)} type="text" className="input-field" placeholder="Ej: UND, KG, M, LT" required />
                            </div>
                        </div>
                        <div className="form-group form-group--spaced">
                            <label className="form-label">Cantidad</label>
                            <input value={form.cantidad} onChange={(e) => updateForm('cantidad', Number(e.target.value))} type="number" min="0" className="input-field" required />
                        </div>

                        <h3 className="section-title section-title--border">Ubicación (Sistema ZNP)</h3>
                        <div className="znp-box">
                            <div className="form-row form-row--compact">
                                <div className="form-group">
                                    <label className="form-label form-label--small">Zona</label>
                                    <select value={form.zona} onChange={(e) => updateForm('zona', e.target.value)} className="input-field input-field--compact">
                                        {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label--small">Nivel</label>
                                    <select value={form.nivel} onChange={(e) => updateForm('nivel', Number(e.target.value))} className="input-field input-field--compact">
                                        {LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label--small">Posición</label>
                                    <select value={form.posicion} onChange={(e) => updateForm('posicion', Number(e.target.value))} className="input-field input-field--compact">
                                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="location-preview">
                                <div className="location-label">CÓDIGO DE UBICACIÓN</div>
                                <div className="location-code location-code--large">{computedLocationCode}</div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="button" onClick={closeModal} className="btn-secondary is-danger">Cancelar</button>
                            <button type="submit" className="btn-primary">Guardar Material</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body,
    );
}
