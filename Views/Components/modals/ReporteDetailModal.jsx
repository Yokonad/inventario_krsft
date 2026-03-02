/**
 * ReporteDetailModal – View/resolve/delete report detail (Tailwind, Modal UI).
 */
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { formatDate } from '../../utils/helpers';
import { EyeIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';

const ESTADO_VARIANT = { pendiente: 'amber', revisado: 'blue', resuelto: 'emerald' };
const ESTADO_LABEL = { pendiente: 'Pendiente', revisado: 'Revisado', resuelto: 'Resuelto' };

export default function ReporteDetailModal({
    selectedReporte, solucionReporte, setSolucionReporte,
    cambiarEstadoReporte, eliminarReporte, closeReporteDetail,
}) {
    return (
        <Modal
            open={true}
            onClose={closeReporteDetail}
            title="DETALLE DEL REPORTE"
            size="lg"
            footer={
                <div className="flex w-full items-center justify-between">
                    <Button variant="secondary" onClick={closeReporteDetail}>Cerrar</Button>
                    <div className="flex gap-2">
                        {selectedReporte?.estado === 'pendiente' && (
                            <Button variant="warning" onClick={() => cambiarEstadoReporte('revisado')} className="gap-2">
                                <EyeIcon className="size-4" /> Marcar como Revisado
                            </Button>
                        )}
                        {selectedReporte?.estado !== 'resuelto' && (
                            <Button variant="success" onClick={() => cambiarEstadoReporte('resuelto')} className="gap-2"
                                disabled={!solucionReporte.trim() && !selectedReporte?.solucion}>
                                <CheckCircleIcon className="size-4" /> Resolver
                            </Button>
                        )}
                        <Button variant="danger" onClick={eliminarReporte} className="gap-2">
                            <TrashIcon className="size-4" /> Eliminar
                        </Button>
                    </div>
                </div>
            }
        >
            {selectedReporte && (
                <div className="space-y-6">
                    {/* Material Info */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3">Información del Material</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-gray-500 mb-0.5">Producto</p><p className="text-sm font-medium text-gray-900">{selectedReporte.producto_nombre}</p></div>
                            <div><p className="text-xs text-gray-500 mb-0.5">SKU</p><p className="text-sm font-medium text-gray-900">{selectedReporte.producto_sku}</p></div>
                            <div><p className="text-xs text-gray-500 mb-0.5">Proyecto</p><Badge variant="primary">{selectedReporte.proyecto_nombre}</Badge></div>
                            <div><p className="text-xs text-gray-500 mb-0.5">Estado</p><Badge variant={ESTADO_VARIANT[selectedReporte.estado]}>{ESTADO_LABEL[selectedReporte.estado]}</Badge></div>
                        </div>
                    </div>

                    {/* Problema */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3">Problema Reportado</h3>
                        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700 mb-3">{selectedReporte.motivo}</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-gray-500 mb-0.5">Reportado por</p><p className="text-sm text-gray-900">{selectedReporte.reportado_por}</p></div>
                            <div><p className="text-xs text-gray-500 mb-0.5">Fecha</p><p className="text-sm text-gray-900">{formatDate(selectedReporte.created_at)}</p></div>
                        </div>
                    </div>

                    {/* Solución */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide text-gray-700 mb-3">Solución</h3>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción de la solución
                            {selectedReporte.estado === 'resuelto' && <span className="ml-2 text-xs text-gray-400">(Solo lectura)</span>}
                        </label>
                        <textarea value={solucionReporte} onChange={(e) => setSolucionReporte(e.target.value)} rows="4"
                            disabled={selectedReporte.estado === 'resuelto'} placeholder="Describe cómo se resolvió..."
                            className="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500" />
                        {selectedReporte.resuelto_por && (
                            <p className="mt-1 text-xs text-gray-500">
                                Resuelto por: <strong>{selectedReporte.resuelto_por}</strong>
                                {selectedReporte.resuelto_at && <> el {formatDate(selectedReporte.resuelto_at)}</>}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </Modal>
    );
}
