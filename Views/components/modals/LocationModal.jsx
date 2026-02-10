import { createPortal } from 'react-dom';
import { ZONES, LEVELS, POSITIONS } from '../../utils/constants';
import { PinLargeIcon, BoxSmallIcon, LocationPinIcon } from '../Icons';

/**
 * Modal for assigning ZNP location to reserved items.
 */
export default function LocationModal({
    selectedReservedItem,
    locationForm, updateLocationForm,
    computedReservedLocationCode,
    saveLocation, closeLocationModal,
}) {
    return createPortal(
        <div className="modal-overlay">
            <div className="modal-card modal-card--compact">
                <div className="modal-header modal-header--warning">
                    <h2 className="modal-title modal-title--warning">
                        {PinLargeIcon}
                        Asignar Ubicación ZNP
                    </h2>
                </div>
                <div className="modal-body">
                    <div className="material-card">
                        <div className="material-label">
                            {BoxSmallIcon}
                            Material
                        </div>
                        <div className="material-name">{selectedReservedItem?.nombre}</div>
                        <div className="material-project">Proyecto: <span>{selectedReservedItem?.nombre_proyecto}</span></div>
                    </div>
                    <form onSubmit={saveLocation}>
                        <h3 className="section-title">Código de Ubicación (Sistema ZNP)</h3>
                        <div className="znp-box znp-box--spaced">
                            <div className="form-row form-row--compact">
                                <div className="form-group">
                                    <label className="form-label form-label--small">Zona (A-E)</label>
                                    <select value={locationForm.zona} onChange={(e) => updateLocationForm('zona', e.target.value)} className="input-field input-field--compact" required>
                                        <option value="">Seleccionar...</option>
                                        {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label--small">Nivel (1-4)</label>
                                    <select value={locationForm.nivel} onChange={(e) => updateLocationForm('nivel', Number(e.target.value))} className="input-field input-field--compact" required>
                                        <option value="">Seleccionar...</option>
                                        {LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label form-label--small">Posición (1-8)</label>
                                    <select value={locationForm.posicion} onChange={(e) => updateLocationForm('posicion', Number(e.target.value))} className="input-field input-field--compact" required>
                                        <option value="">Seleccionar...</option>
                                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="location-final">
                                <div className="location-label location-label--warning">Código Final</div>
                                <div className="location-code location-code--xlarge">{computedReservedLocationCode}</div>
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={closeLocationModal} className="btn-secondary is-danger">Cancelar</button>
                            <button type="submit" className="btn-warning">
                                {LocationPinIcon}
                                Guardar Ubicación
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body,
    );
}
