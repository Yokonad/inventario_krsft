import { createPortal } from 'react-dom';
import { ModalReportWarningIcon, FileIcon } from '../Icons';

/**
 * Modal for reporting a material problem (missing at construction site).
 */
export default function ReportModal({
    reportingProduct,
    reportMotivo, setReportMotivo,
    confirmReport, closeReportModal,
}) {
    return createPortal(
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeReportModal(); }}>
            <div className="modal-report">
                <div className="modal-report-icon">
                    {ModalReportWarningIcon}
                </div>
                <h3 className="modal-report-title">Reportar Material</h3>
                <p className="modal-report-subtitle">Material no recibido en obra</p>
                <div className="modal-report-product">
                    <div className="report-product-name">{reportingProduct?.nombre}</div>
                    <div className="report-product-project">Proyecto: {reportingProduct?.nombre_proyecto}</div>
                </div>
                <form onSubmit={confirmReport}>
                    <div className="form-group">
                        <label className="form-label">Motivo del reporte</label>
                        <textarea
                            value={reportMotivo}
                            onChange={(e) => setReportMotivo(e.target.value)}
                            className="textarea-field"
                            placeholder="Describe el problema (ej: Material no llegó a obra, se necesita verificar si está en inventario o no se compró)"
                            rows="4"
                            required
                        />
                    </div>
                    <div className="modal-report-actions">
                        <button type="button" onClick={closeReportModal} className="btn-report-cancel">Cancelar</button>
                        <button type="submit" className="btn-report-confirm">
                            {FileIcon}
                            Enviar Reporte
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}
