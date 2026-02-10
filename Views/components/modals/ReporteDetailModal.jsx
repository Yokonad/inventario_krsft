import { createPortal } from 'react-dom';
import { formatDate } from '../../utils/helpers';
import { EyeIcon, CheckIcon, TrashDetailIcon } from '../Icons';

/**
 * Full-detail modal for a single report — view info, resolve, or delete.
 */
export default function ReporteDetailModal({
    selectedReporte,
    solucionReporte, setSolucionReporte,
    cambiarEstadoReporte, eliminarReporte, closeReporteDetail,
}) {
    return createPortal(
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeReporteDetail(); }}>
            <div className="modal-card modal-card--large">
                <div className="modal-header">
                    <div className="modal-header-text">
                        <h2 className="modal-title">DETALLE DEL REPORTE</h2>
                        <p className="modal-subtitle">Información completa del problema reportado</p>
                    </div>
                </div>
                {selectedReporte && (
                    <div className="modal-body">
                        {/* Product Info */}
                        <div className="detail-section">
                            <h3 className="section-title">Información del Material</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label className="detail-label">Producto</label>
                                    <div className="detail-value">{selectedReporte.producto_nombre}</div>
                                </div>
                                <div className="detail-item">
                                    <label className="detail-label">SKU</label>
                                    <div className="detail-value">{selectedReporte.producto_sku}</div>
                                </div>
                                <div className="detail-item">
                                    <label className="detail-label">Proyecto</label>
                                    <div className="detail-value">
                                        <span className="project-badge">{selectedReporte.proyecto_nombre}</span>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <label className="detail-label">Estado Actual</label>
                                    <div className="detail-value">
                                        <span className={`status-badge${selectedReporte.estado === 'pendiente' ? ' pending' : selectedReporte.estado === 'revisado' ? ' reviewed' : ' approved'}`}>
                                            {selectedReporte.estado === 'pendiente' ? 'Pendiente' : selectedReporte.estado === 'revisado' ? 'Revisado' : 'Resuelto'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Problem */}
                        <div className="detail-section">
                            <h3 className="section-title">Problema Reportado</h3>
                            <div className="detail-item">
                                <label className="detail-label">Motivo</label>
                                <div className="detail-value detail-value--text">{selectedReporte.motivo}</div>
                            </div>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label className="detail-label">Reportado por</label>
                                    <div className="detail-value">{selectedReporte.reportado_por}</div>
                                </div>
                                <div className="detail-item">
                                    <label className="detail-label">Fecha de Reporte</label>
                                    <div className="detail-value">{formatDate(selectedReporte.created_at)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Solution */}
                        <div className="detail-section">
                            <h3 className="section-title">Solución</h3>
                            <div className="form-group">
                                <label className="form-label">
                                    Descripción de la solución
                                    {selectedReporte.estado === 'resuelto' && <span className="label-badge">(Solo lectura)</span>}
                                </label>
                                <textarea
                                    value={solucionReporte}
                                    onChange={(e) => setSolucionReporte(e.target.value)}
                                    className="textarea-field"
                                    placeholder="Describe cómo se resolvió el problema o acciones tomadas..."
                                    rows="4"
                                    disabled={selectedReporte.estado === 'resuelto'}
                                />
                                {selectedReporte.resuelto_por && (
                                    <div className="solution-meta">
                                        <span>Resuelto por: <strong>{selectedReporte.resuelto_por}</strong></span>
                                        {selectedReporte.resuelto_at && <span> el {formatDate(selectedReporte.resuelto_at)}</span>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="modal-actions">
                            <button onClick={closeReporteDetail} className="btn-secondary">Cerrar</button>
                            <div className="actions-right">
                                {selectedReporte.estado === 'pendiente' && (
                                    <button onClick={() => cambiarEstadoReporte('revisado')} className="btn-warning">
                                        {EyeIcon}
                                        Marcar como Revisado
                                    </button>
                                )}
                                {selectedReporte.estado !== 'resuelto' && (
                                    <button
                                        onClick={() => cambiarEstadoReporte('resuelto')}
                                        className="btn-success"
                                        disabled={!solucionReporte.trim() && !selectedReporte.solucion}
                                    >
                                        {CheckIcon}
                                        Resolver Problema
                                    </button>
                                )}
                                <button onClick={eliminarReporte} className="btn-danger" title="Eliminar este reporte">
                                    {TrashDetailIcon}
                                    Eliminar Reporte
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body,
    );
}
