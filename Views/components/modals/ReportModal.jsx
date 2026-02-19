import { createPortal } from 'react-dom';
import { ModalReportWarningIcon, FileIcon } from '../Icons';
import { MODAL_CLASSES, FORM_CLASSES, INPUT_CLASSES, BUTTON_CLASSES } from '../../tokens';

/**
 * Modal for reporting a material problem (missing at construction site).
 * Styles: Tailwind CSS via tokens.js (NO CSS files).
 */
export default function ReportModal({
    reportingProduct,
    reportMotivo, setReportMotivo,
    confirmReport, closeReportModal,
}) {
    return createPortal(
        <div className={MODAL_CLASSES.overlay} onClick={(e) => { if (e.target === e.currentTarget) closeReportModal(); }}>
            <div className={MODAL_CLASSES.report}>
                <div className={MODAL_CLASSES.report_icon}>
                    {ModalReportWarningIcon}
                </div>
                <h3 className={MODAL_CLASSES.report_title}>Reportar Material</h3>
                <p className={MODAL_CLASSES.report_subtitle}>Material no recibido en obra</p>
                <div className={MODAL_CLASSES.report_product}>
                    <div className={MODAL_CLASSES.report_product_name}>{reportingProduct?.nombre}</div>
                    <div className={MODAL_CLASSES.report_product_project}>Proyecto: {reportingProduct?.nombre_proyecto}</div>
                </div>
                <form onSubmit={confirmReport}>
                    <div className={FORM_CLASSES.group}>
                        <label className={FORM_CLASSES.label}>Motivo del reporte</label>
                        <textarea
                            value={reportMotivo}
                            onChange={(e) => setReportMotivo(e.target.value)}
                            className={INPUT_CLASSES.textarea}
                            placeholder="Describe el problema (ej: Material no llegó a obra, se necesita verificar si está en inventario o no se compró)"
                            rows="4"
                            required
                        />
                    </div>
                    <div className={MODAL_CLASSES.report_actions}>
                        <button type="button" onClick={closeReportModal} className={BUTTON_CLASSES.secondary}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}
