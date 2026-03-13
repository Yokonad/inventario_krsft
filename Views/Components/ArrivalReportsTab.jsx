import { memo, useMemo } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import Badge from './ui/Badge';
import Button from './ui/Button';

const STATUS_BADGE = {
  pendiente:  { variant: 'amber',   label: 'Pendiente' },
  respondido: { variant: 'blue',    label: 'Respondido' },
};

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'respondido', label: 'Respondidos' },
];

/**
 * ArrivalReportsTab – Tab content showing cross-module arrival reports from Proyectos.
 * @param {{ reports: Array, filterStatus: string, onFilterChange: (v: string) => void, onOpenRespond: (report) => void }} props
 */
function ArrivalReportsTab({ reports, filterStatus, onFilterChange, onOpenRespond }) {
  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Estado:</span>
        {STATUS_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => onFilterChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filterStatus === opt.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="rounded-lg border-2 border-gray-200 bg-white p-12 text-center shadow-sm">
          <ClipboardDocumentListIcon className="mx-auto size-12 text-gray-300" />
          <h3 className="mt-3 text-sm font-semibold text-gray-700">No hay reportes de llegada</h3>
          <p className="mt-1 text-xs text-gray-400">Los reportes aparecerán cuando los supervisores reporten materiales faltantes</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border-2 border-gray-200 bg-white shadow-sm">
          <table className="w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Proyecto</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Reportado por</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Fecha</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Items</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Estado</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.map(report => {
                const st = STATUS_BADGE[report.status] || STATUS_BADGE.pendiente;
                return (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 font-medium">#{report.id}</td>
                    <td className="px-4 py-3 text-gray-700">{report.project_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-700">{report.reported_by_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-700">{report.items?.length ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant={report.status === 'pendiente' ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => onOpenRespond(report)}
                      >
                        {report.status === 'pendiente' ? 'Responder' : 'Ver'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default memo(ArrivalReportsTab);
