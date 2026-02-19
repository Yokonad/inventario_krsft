import { formatDate } from '../utils/helpers';
import { DocLinesIcon, EyeIcon, ClockIcon } from './Icons';
import {
    TABLE_CLASSES, REPORTES_CLASSES,
} from '../tokens';
import { reporteBadgeClass } from './utils/classHelpers';

/**
 * Reportes tab with filter buttons and report table.
 * Per rerender-memo — isolated from inventory tab to reduce re-renders.
 * Styles: Tailwind CSS via tokens.js (NO CSS files).
 */
export default function ReportesTab({
    reportes,
    filteredReportes,
    filterReporteEstado, setFilterReporteEstado,
    openReporteDetail,
}) {
    return (
        <div className={TABLE_CLASSES.card}>
            <div className={REPORTES_CLASSES.header}>
                <h3 className={REPORTES_CLASSES.title}>
                    {DocLinesIcon}
                    Reportes de Materiales
                </h3>
                <div className={REPORTES_CLASSES.filters}>
                    <button
                        onClick={() => setFilterReporteEstado('')}
                        className={`${REPORTES_CLASSES.filter_btn}${filterReporteEstado === '' ? ` ${REPORTES_CLASSES.filter_btn_active}` : ''}`}
                    >
                        Todos
                        <span className={REPORTES_CLASSES.filter_badge}>{reportes.length}</span>
                    </button>
                    <button
                        onClick={() => setFilterReporteEstado('pendiente')}
                        className={`${REPORTES_CLASSES.filter_btn} ${REPORTES_CLASSES.filter_btn_pending}${filterReporteEstado === 'pendiente' ? ` ${REPORTES_CLASSES.filter_btn_pending_active}` : ''}`}
                    >
                        Pendientes
                        <span className={REPORTES_CLASSES.filter_badge}>{reportes.filter((r) => r.estado === 'pendiente').length}</span>
                    </button>
                    <button
                        onClick={() => setFilterReporteEstado('revisado')}
                        className={`${REPORTES_CLASSES.filter_btn} ${REPORTES_CLASSES.filter_btn_reviewed}${filterReporteEstado === 'revisado' ? ` ${REPORTES_CLASSES.filter_btn_reviewed_active}` : ''}`}
                    >
                        Revisados
                        <span className={REPORTES_CLASSES.filter_badge}>{reportes.filter((r) => r.estado === 'revisado').length}</span>
                    </button>
                    <button
                        onClick={() => setFilterReporteEstado('resuelto')}
                        className={`${REPORTES_CLASSES.filter_btn} ${REPORTES_CLASSES.filter_btn_resolved}${filterReporteEstado === 'resuelto' ? ` ${REPORTES_CLASSES.filter_btn_resolved_active}` : ''}`}
                    >
                        Resueltos
                        <span className={REPORTES_CLASSES.filter_badge}>{reportes.filter((r) => r.estado === 'resuelto').length}</span>
                    </button>
                </div>
            </div>

            <table className={TABLE_CLASSES.table}>
                <thead className={TABLE_CLASSES.head}>
                    <tr>
                        <th className={TABLE_CLASSES.head_cell}>Producto</th>
                        <th className={TABLE_CLASSES.head_cell}>Proyecto</th>
                        <th className={TABLE_CLASSES.head_cell}>Motivo</th>
                        <th className={TABLE_CLASSES.head_cell}>Reportado por</th>
                        <th className={TABLE_CLASSES.head_cell}>Fecha</th>
                        <th className={TABLE_CLASSES.head_cell_center}>Estado</th>
                        <th className={TABLE_CLASSES.head_cell_center}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredReportes.map((reporte) => (
                        <tr key={reporte.id} className={`${TABLE_CLASSES.row} ${TABLE_CLASSES.row_clickable}`} onClick={() => openReporteDetail(reporte)}>
                            <td className={TABLE_CLASSES.cell}>
                                <div className={TABLE_CLASSES.product_name}>{reporte.producto_nombre}</div>
                                <div className={TABLE_CLASSES.product_sku}>{reporte.producto_sku}</div>
                            </td>
                            <td className={TABLE_CLASSES.cell}>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100">{reporte.proyecto_nombre}</span>
                            </td>
                            <td className={TABLE_CLASSES.cell}>
                                <div className="text-sm text-gray-700 line-clamp-2">{reporte.motivo}</div>
                            </td>
                            <td className={TABLE_CLASSES.cell}>{reporte.reportado_por}</td>
                            <td className={TABLE_CLASSES.cell}>
                                <div className="text-sm text-gray-500">{formatDate(reporte.created_at)}</div>
                            </td>
                            <td className={TABLE_CLASSES.cell_center}>
                                <span className={reporteBadgeClass(reporte.estado)}>
                                    {reporte.estado === 'pendiente' ? 'Pendiente' : reporte.estado === 'revisado' ? 'Revisado' : 'Resuelto'}
                                </span>
                            </td>
                            <td className={TABLE_CLASSES.cell_center} onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={() => openReporteDetail(reporte)}
                                    title="Ver detalles"
                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors duration-150"
                                >
                                    {EyeIcon}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredReportes.length === 0 && (
                        <tr>
                            <td colSpan="7" className={REPORTES_CLASSES.empty_cell}>
                                {ClockIcon}
                                No hay reportes {filterReporteEstado ? `con estado "${filterReporteEstado}"` : 'registrados'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
