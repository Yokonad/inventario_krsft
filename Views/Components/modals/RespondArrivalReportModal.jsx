import { memo, useState } from 'react';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const STATUS_BADGE = {
  pendiente:  { variant: 'amber',   label: 'Pendiente' },
  respondido: { variant: 'blue',    label: 'Respondido' },
};

/**
 * RespondArrivalReportModal – Inventario staff views report items and types a response.
 * @param {{ open: boolean, onClose: () => void, report: object|null, onRespond: (reportId: number, respuesta: string) => Promise<void> }} props
 */
function RespondArrivalReportModal({ open, onClose, report, onRespond }) {
  const [respuesta, setRespuesta] = useState('');
  const [processing, setProcessing] = useState(false);

  if (!report) return null;

  const items = report.items || [];
  const st = STATUS_BADGE[report.status] || STATUS_BADGE.pendiente;
  const alreadyResponded = report.status === 'respondido';

  const handleSubmit = async () => {
    setProcessing(true);
    try {
      await onRespond(report.id, respuesta);
      setRespuesta('');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setRespuesta('');
      onClose();
    }
  };

  return (
    <Modal open={open} onClose={handleClose} size="lg" title={`Reporte #${report.id}`} titleIcon={<ChatBubbleLeftRightIcon className="size-5 text-teal-600" />}>
      <div className="space-y-5">
        {/* Header info */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Badge variant={st.variant}>{st.label}</Badge>
          {report.project_name && (
            <span className="text-gray-600">Proyecto: <span className="font-medium text-gray-800">{report.project_name}</span></span>
          )}
          {report.reported_by_name && (
            <span className="text-gray-500">por <span className="font-medium text-gray-700">{report.reported_by_name}</span></span>
          )}
        </div>

        {/* Supervisor notes */}
        {report.notas_supervisor && (
          <div className="rounded-lg bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase text-gray-500 mb-1">Notas del supervisor</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.notas_supervisor}</p>
          </div>
        )}

        {/* Items table */}
        <div>
          <p className="text-xs font-medium uppercase text-gray-500 mb-2">Materiales reportados ({items.length})</p>
          <div className="overflow-x-auto rounded-lg border border-gray-200 max-h-48 overflow-y-auto">
            <table className="w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Material</th>
                  <th className="px-3 py-2 text-center text-xs font-medium uppercase text-gray-500">Cantidad</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Tipo</th>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Unidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-700">{item.description || '—'}</td>
                    <td className="px-3 py-2 text-center text-gray-700">{item.quantity ?? '—'}</td>
                    <td className="px-3 py-2 text-gray-700">{item.material_type || '—'}</td>
                    <td className="px-3 py-2 text-gray-700">{item.unit || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Previous response (if already responded) */}
        {alreadyResponded && report.respuesta && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <p className="text-xs font-medium uppercase text-gray-500 mb-1">
              Respuesta anterior
              {report.respondido_por_name && (
                <span className="normal-case ml-1">— {report.respondido_por_name}</span>
              )}
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.respuesta}</p>
          </div>
        )}

        {/* Response textarea */}
        {!alreadyResponded && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tu respuesta</label>
            <textarea
              value={respuesta}
              onChange={e => setRespuesta(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Escribe tu respuesta sobre el estado de los materiales..."
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
            />
          </div>
        )}
      </div>

      <footer className="mt-6 flex gap-3 justify-end">
        <Button variant="secondary" onClick={handleClose} disabled={processing}>Cerrar</Button>
        {!alreadyResponded && (
          <Button variant="primary" onClick={handleSubmit} disabled={!respuesta.trim() || processing} loading={processing}>
            {processing ? 'Enviando...' : 'Enviar Respuesta'}
          </Button>
        )}
      </footer>
    </Modal>
  );
}

export default memo(RespondArrivalReportModal);
