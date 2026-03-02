import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { ExclamationTriangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function ReportModal({
    reportingProduct, reportMotivo, setReportMotivo,
    confirmReport, closeReportModal,
}) {
    return (
        <Modal open={true} onClose={closeReportModal} size="md">
            <div className="text-center mb-4">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-amber-100">
                    <ExclamationTriangleIcon className="size-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Reportar Material</h3>
                <p className="text-sm text-gray-500">Material no recibido en obra</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 mb-4">
                <p className="text-sm font-bold text-gray-900">{reportingProduct?.nombre}</p>
                <p className="text-xs text-gray-600">Proyecto: {reportingProduct?.nombre_proyecto}</p>
            </div>
            <form onSubmit={confirmReport}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del reporte</label>
                <textarea value={reportMotivo} onChange={(e) => setReportMotivo(e.target.value)} rows="4" required
                    placeholder="Describe el problema..."
                    className="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary mb-4" />
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={closeReportModal} className="flex-1">Cancelar</Button>
                    <Button variant="warning" type="submit" className="flex-1 gap-2">
                        <DocumentTextIcon className="size-4" /> Enviar Reporte
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
