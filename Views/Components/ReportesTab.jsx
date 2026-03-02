/**
 * ReportesTab – Reportes section with filter buttons and table (Tailwind, cyan accent).
 */
import { formatDate } from '../utils/helpers';
import { EyeIcon, ClockIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Badge from './ui/Badge';

const ESTADO_VARIANT = { pendiente: 'amber', revisado: 'blue', resuelto: 'emerald' };
const ESTADO_LABEL = { pendiente: 'Pendiente', revisado: 'Revisado', resuelto: 'Resuelto' };

export default function ReportesTab({
    reportes, filteredReportes,
    filterReporteEstado, setFilterReporteEstado,
    openReporteDetail,
}) {
    if (reportes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <ClockIcon className="size-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-1">Sin Reportes</h3>
                <p className="text-sm text-gray-500">No hay reportes de materiales registrados</p>
            </div>
        );
    }

    const filters = [
        { key: '', label: 'Todos', count: reportes.length },
        { key: 'pendiente', label: 'Pendientes', count: reportes.filter(r => r.estado === 'pendiente').length },
        { key: 'revisado', label: 'Revisados', count: reportes.filter(r => r.estado === 'revisado').length },
        { key: 'resuelto', label: 'Resueltos', count: reportes.filter(r => r.estado === 'resuelto').length },
    ];

    return (
        <div className="space-y-4">
            {/* Header + Filters */}
            <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                        <DocumentTextIcon className="size-5 text-primary" />
                        Reportes de Materiales
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {filters.map(f => (
                            <button
                                key={f.key}
                                onClick={() => setFilterReporteEstado(f.key)}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                                    filterReporteEstado === f.key
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {f.label}
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                    filterReporteEstado === f.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
                                }`}>{f.count}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border-2 border-gray-300 shadow-md">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                    <thead className="text-left">
                        <tr>
                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">Producto</th>
                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">Proyecto</th>
                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">Motivo</th>
                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">Reportado por</th>
                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">Fecha</th>
                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 text-center">Estado</th>
                            <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredReportes.length === 0 ? (
                            <tr><td colSpan="7" className="px-4 py-10 text-center text-sm text-gray-400">No hay reportes para este estado</td></tr>
                        ) : filteredReportes.map((r) => (
                            <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openReporteDetail(r)}>
                                <td className="whitespace-nowrap px-4 py-3">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{r.producto_nombre}</p>
                                        <p className="text-xs text-gray-500">{r.producto_sku}</p>
                                    </div>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{r.proyecto_nombre}</td>
                                <td className="px-4 py-3"><p className="text-sm text-gray-700 max-w-[200px] truncate">{r.motivo}</p></td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{r.reportado_por}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{formatDate(r.created_at)}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-center">
                                    <Badge variant={ESTADO_VARIANT[r.estado] || 'gray'}>{ESTADO_LABEL[r.estado] || r.estado}</Badge>
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => openReporteDetail(r)} className="rounded p-2 text-primary hover:bg-primary-50 transition-colors" title="Ver detalles">
                                        <EyeIcon className="size-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
