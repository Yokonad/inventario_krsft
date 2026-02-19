import { createPortal } from 'react-dom';
import { ZONES, LEVELS, POSITIONS } from '../../utils/constants';
import { PinLargeIcon, BoxSmallIcon, LocationPinIcon } from '../Icons';
import {
    MODAL_CLASSES, FORM_CLASSES, INPUT_CLASSES, ZNP_CLASSES,
    BADGE_CLASSES,
} from '../../tokens';

/**
 * Modal for assigning ZNP location to reserved items.
 * Styles: Tailwind CSS via tokens.js (NO CSS files).
 */
export default function LocationModal({
    selectedReservedItem,
    locationForm, updateLocationForm,
    computedReservedLocationCode,
    saveLocation, closeLocationModal,
}) {
    return createPortal(
        <div className={MODAL_CLASSES.overlay}>
            <div className={MODAL_CLASSES.card_compact}>
                <div className={MODAL_CLASSES.header_warning}>
                    <h2 className={MODAL_CLASSES.title_warning}>
                        {PinLargeIcon}
                        Asignar Ubicación ZNP
                    </h2>
                </div>
                <div className={MODAL_CLASSES.body}>
                    {/* Material info card */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                            {BoxSmallIcon}
                            Material
                        </div>
                        <div className="font-semibold text-gray-900 text-base">{selectedReservedItem?.nombre}</div>
                        <div className="text-sm text-gray-500 mt-0.5">
                            Proyecto: <span className="font-medium text-gray-700">{selectedReservedItem?.nombre_proyecto}</span>
                        </div>
                    </div>
                    <form onSubmit={saveLocation}>
                        <h3 className={FORM_CLASSES.section_title}>Código de Ubicación (Sistema ZNP)</h3>
                        <div className={ZNP_CLASSES.box_spaced}>
                            <div className={FORM_CLASSES.row_compact}>
                                <div className={FORM_CLASSES.group}>
                                    <label className={FORM_CLASSES.label_small}>Zona (A-E)</label>
                                    <select
                                        value={locationForm.zona}
                                        onChange={(e) => updateLocationForm('zona', e.target.value)}
                                        className={INPUT_CLASSES.compact}
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                                    </select>
                                </div>
                                <div className={FORM_CLASSES.group}>
                                    <label className={FORM_CLASSES.label_small}>Nivel (1-4)</label>
                                    <select
                                        value={locationForm.nivel}
                                        onChange={(e) => updateLocationForm('nivel', Number(e.target.value))}
                                        className={INPUT_CLASSES.compact}
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div className={FORM_CLASSES.group}>
                                    <label className={FORM_CLASSES.label_small}>Posición (1-8)</label>
                                    <select
                                        value={locationForm.posicion}
                                        onChange={(e) => updateLocationForm('posicion', Number(e.target.value))}
                                        className={INPUT_CLASSES.compact}
                                        required
                                    >
                                        <option value="">Seleccionar...</option>
                                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mt-3 text-center">
                                <div className="text-xs text-gray-400 mb-1">Código Final</div>
                                <div className={BADGE_CLASSES.location_code_xl}>{computedReservedLocationCode}</div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-5">
                            <button type="button" onClick={closeLocationModal} className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors duration-200 cursor-pointer border-0">
                                Cancelar
                            </button>
                            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 transition-colors duration-200 cursor-pointer border-0">
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
