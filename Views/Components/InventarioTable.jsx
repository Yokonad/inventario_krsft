/**
 * InventarioTable – Tabla de inventario con filas expandibles para ver asignaciones por proyecto.
 * HyperUI Table §2.3 + badges + dropdown menu actions (Tailwind).
 */
import { useState, useRef, useEffect, useCallback, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { formatDate, getProjectPillStyle } from '../utils/helpers';
import {
    PencilSquareIcon, TrashIcon, MapPinIcon, Bars3Icon,
    CheckCircleIcon, ExclamationTriangleIcon, ChevronDownIcon,
    FolderPlusIcon, XCircleIcon, ClockIcon, XMarkIcon,
} from '@heroicons/react/24/outline';
import Badge from './ui/Badge';

const STATUS_VARIANT = { activo: 'emerald', pendiente: 'amber', rechazado: 'red' };
const STATUS_LABEL = { activo: 'Aprobado', pendiente: 'Sin Aprobar', rechazado: 'Rechazado' };
const COL_COUNT = 12;

// ── ActionDropdown ──────────────────────────────────────────────────────────

function ActionDropdown({ item, onEdit, onDelete, onVerify, onReport, onAssign, isOpen, onToggle, onClose }) {

    const actions = [
        ...(!item.apartado ? [{
            label: 'Asignar a Proyecto',
            description: 'Asignar stock a un proyecto',
            icon: <FolderPlusIcon className="size-6" />,
            onClick: () => { onAssign(item); onClose(); },
            iconBg: 'bg-primary/10 text-primary',
            border: 'border-primary/20 hover:border-primary/40 hover:bg-primary/5',
        }] : []),
        {
            label: 'Editar Material',
            description: 'Modificar datos del material',
            icon: <PencilSquareIcon className="size-6" />,
            onClick: () => { onEdit(item); onClose(); },
            iconBg: 'bg-blue-100 text-blue-600',
            border: 'border-blue-100 hover:border-blue-300 hover:bg-blue-50/50',
        },
        {
            label: 'Verificar',
            description: 'Marcar como verificado',
            icon: <CheckCircleIcon className="size-6" />,
            onClick: () => { onVerify(item); onClose(); },
            iconBg: 'bg-emerald-100 text-emerald-600',
            border: 'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50',
        },
        ...((item.project_id || item.nombre_proyecto || item.apartado) ? [{
            label: 'Crear Reporte',
            description: 'Reportar un problema',
            icon: <ExclamationTriangleIcon className="size-6" />,
            onClick: () => { onReport(item); onClose(); },
            iconBg: 'bg-amber-100 text-amber-600',
            border: 'border-amber-100 hover:border-amber-300 hover:bg-amber-50/50',
        }] : []),
    ];

    return (
        <div className="flex items-center justify-center gap-1.5">
            {/* Botón principal ≡ */}
            <button
                onClick={onToggle}
                className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                title="Más opciones"
            >
                <Bars3Icon className="size-4" />
            </button>

            {/* Botón eliminar siempre visible */}
            <button
                onClick={() => onDelete(item)}
                className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-2 text-red-500 shadow-sm hover:bg-red-100 transition-colors"
                title="Eliminar"
            >
                <TrashIcon className="size-4" />
            </button>

            {/* Modal de acciones */}
            {isOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                            <div>
                                <h2 className="text-base font-semibold text-gray-900">Acciones</h2>
                                <p className="text-xs text-gray-500 truncate max-w-[220px]" title={item.nombre}>{item.nombre}</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                            >
                                <XMarkIcon className="size-5" />
                            </button>
                        </div>

                        {/* Botones grandes */}
                        <div className="p-4 flex flex-col gap-2">
                            {actions.map((a) => (
                                <button
                                    key={a.label}
                                    onClick={a.onClick}
                                    className={`flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all ${a.border}`}
                                >
                                    <span className={`flex items-center justify-center rounded-xl p-2.5 ${a.iconBg}`}>
                                        {a.icon}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-gray-800">{a.label}</span>
                                        <span className="block text-xs text-gray-400">{a.description}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

// ── Fila expandida de asignaciones ────────────────────────────────────────

function AssignmentRow({ item, assignments, usage, onRemoveAssignment }) {
    const itemAssignments = assignments[item.id] || [];
    const itemUsage = usage[item.id] || [];
    const totalAsignado = itemAssignments.reduce((sum, a) => sum + (a.cantidad || 0), 0);
    const disponible = Math.max(0, item.cantidad - totalAsignado);

    const USAGE_STATUS_LABEL = { approved: 'Aprobada', pending: 'Pendiente', rejected: 'Rechazada', paid: 'Pagada', completed: 'Completada' };
    const USAGE_STATUS_VARIANT = { approved: 'blue', pending: 'amber', rejected: 'red', paid: 'emerald', completed: 'emerald' };

    if (itemAssignments.length === 0 && itemUsage.length === 0) {
        return (
            <div className="px-8 py-4">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <FolderPlusIcon className="size-4" />
                    Sin asignaciones ni uso en otros proyectos — todo el stock está disponible
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3 px-4 py-3 ml-4">
            {/* ── Asignaciones manuales ── */}
            {itemAssignments.length > 0 && (
                <div className="rounded-lg border border-gray-200 bg-white">
                            {/* Cabecera del resumen */}
                            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-gray-600">
                                    Distribución por proyecto
                                </h4>
                                <div className="flex items-center gap-3 text-xs">
                                    <span className="text-gray-500">
                                        Asignado: <strong className="text-gray-800">{totalAsignado}</strong>
                                    </span>
                                    <Badge variant={disponible > 0 ? 'emerald' : 'amber'} className="text-[10px]">
                                        {disponible} disponible{disponible !== 1 ? 's' : ''}
                                    </Badge>
                                </div>
                            </div>

                            {/* Barra de progreso visual */}
                            <div className="px-4 pt-3 pb-1">
                                <div className="flex h-2 w-full overflow-hidden rounded-full bg-gray-100">
                                    {itemAssignments.map((a, i) => {
                                        const pct = item.cantidad > 0 ? (a.cantidad / item.cantidad) * 100 : 0;
                                        const colors = ['bg-primary', 'bg-blue-500', 'bg-purple-500', 'bg-amber-500', 'bg-rose-500', 'bg-emerald-500'];
                                        return (
                                            <div
                                                key={a.id}
                                                className={`${colors[i % colors.length]} transition-all`}
                                                style={{ width: `${pct}%` }}
                                                title={`${a.project_name}: ${a.cantidad}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Lista de asignaciones */}
                            <div className="divide-y divide-gray-100">
                                {itemAssignments.map((a) => {
                                    const pct = item.cantidad > 0 ? ((a.cantidad / item.cantidad) * 100).toFixed(1) : 0;
                                    const pillStyle = getProjectPillStyle({ project_id: a.project_id, nombre_proyecto: a.project_name });
                                    return (
                                        <div key={a.id} className="flex items-center gap-4 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                                                style={pillStyle}
                                            >
                                                {a.project_name}
                                            </span>
                                            <span className="font-mono text-sm font-semibold text-gray-800">
                                                {a.cantidad} <span className="text-xs font-normal text-gray-500">{item.unidad || 'UND'}</span>
                                            </span>
                                            <span className="text-xs text-gray-400">({pct}%)</span>
                                            {a.asignado_por && (
                                                <span className="text-xs text-gray-400">
                                                    por <span className="text-gray-600">{a.asignado_por}</span>
                                                </span>
                                            )}
                                            {a.created_at && (
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                                    <ClockIcon className="size-3" />
                                                    {formatDate(a.created_at)}
                                                </span>
                                            )}
                                            {a.notas && (
                                                <span className="text-xs text-gray-400 italic truncate max-w-[120px]" title={a.notas}>
                                                    {a.notas}
                                                </span>
                                            )}
                                            <button
                                                onClick={() => onRemoveAssignment(a)}
                                                className="ml-auto rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                                title="Liberar asignación"
                                            >
                                                <XCircleIcon className="size-4" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                    </div>
                )}

                {/* ── Uso en otros proyectos (órdenes de compra) ── */}
                {itemUsage.length > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-white">
                            <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-4 py-2.5">
                                <h4 className="text-xs font-bold uppercase tracking-wide text-blue-700">
                                    Uso en otros proyectos
                                </h4>
                                <Badge variant="blue" className="text-[10px]">
                                    {itemUsage.length} orden{itemUsage.length !== 1 ? 'es' : ''}
                                </Badge>
                            </div>
                            <div className="divide-y divide-blue-50">
                                {itemUsage.map((u, idx) => {
                                    const pillStyle = getProjectPillStyle({ project_id: u.project_id, nombre_proyecto: u.project_name });
                                    return (
                                        <div key={`usage-${idx}`} className="flex items-center gap-4 px-4 py-2.5 hover:bg-blue-50/50 transition-colors">
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                                                style={pillStyle}
                                            >
                                                {u.project_name}
                                            </span>
                                            <span className="font-mono text-sm font-semibold text-gray-800">
                                                {u.qty} <span className="text-xs font-normal text-gray-500">{item.unidad || 'UND'}</span>
                                            </span>
                                            <span className="text-xs text-gray-500 truncate max-w-[180px]" title={u.description}>
                                                {u.description}
                                            </span>
                                            <Badge variant={USAGE_STATUS_VARIANT[u.status] || 'gray'} className="text-[10px]">
                                                {USAGE_STATUS_LABEL[u.status] || u.status}
                                            </Badge>
                                            {u.approved_at && (
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                                    <ClockIcon className="size-3" />
                                                    {formatDate(u.approved_at)}
                                                </span>
                                            )}
                                            {u.reference_price > 0 && (
                                                <span className="text-xs text-gray-400">
                                                    S/ {parseFloat(u.reference_price).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                    </div>
                )}
            </div>
        );
    }

// ── QuantityCell ─────────────────────────────────────────────────────────

function QuantityCell({ item, assignments }) {
    const itemAssignments = assignments[item.id] || [];
    const totalAsignado = itemAssignments.reduce((sum, a) => sum + (a.cantidad || 0), 0);
    const disponible = item.cantidad - totalAsignado;

    return (
        <td className="whitespace-nowrap px-4 py-3 text-center">
            <div className="flex flex-col items-center">
                <span className="font-mono text-sm font-semibold text-gray-800">{item.cantidad}</span>
                {totalAsignado > 0 && (
                    <span className={`font-mono text-[10px] ${disponible > 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {disponible} disp.
                    </span>
                )}
            </div>
        </td>
    );
}

// ── DisponibilidadCell ───────────────────────────────────────────────────

function DisponibilidadCell({ item, assignments }) {
    const itemAssignments = assignments[item.id] || [];
    const totalAsignado = itemAssignments.reduce((sum, a) => sum + (a.cantidad || 0), 0);
    const disponible = item.cantidad - totalAsignado;

    if (item.apartado) {
        return (
            <td className="whitespace-nowrap px-4 py-3 text-center">
                <Badge variant="cyan" className="gap-1">
                    <MapPinIcon className="size-3" /> Apartado
                </Badge>
            </td>
        );
    }

    if (totalAsignado > 0 && disponible <= 0) {
        return (
            <td className="whitespace-nowrap px-4 py-3 text-center">
                <Badge variant="amber" className="gap-1">
                    <FolderPlusIcon className="size-3" /> Asignado
                </Badge>
            </td>
        );
    }

    if (totalAsignado > 0 && disponible > 0) {
        return (
            <td className="whitespace-nowrap px-4 py-3 text-center">
                <Badge variant="blue" className="gap-1">
                    <FolderPlusIcon className="size-3" /> Parcial
                </Badge>
            </td>
        );
    }

    return (
        <td className="whitespace-nowrap px-4 py-3 text-center">
            <Badge variant="emerald" className="gap-1">
                <CheckCircleIcon className="size-3" /> Disponible
            </Badge>
        </td>
    );
}

// ── Main Table ───────────────────────────────────────────────────────────

/**
 * @param {{
 *   filteredItems: Array,
 *   assignments: Object,
 *   usage: Object,
 *   openReportModal: Function,
 *   verifyProduct: Function,
 *   openModal: Function,
 *   deleteProduct: Function,
 *   onAssignClick: Function,
 *   onRemoveAssignment: Function,
 * }} props
 */
export default function InventarioTable({
    filteredItems,
    assignments = {},
    usage = {},
    openReportModal,
    verifyProduct,
    openModal,
    deleteProduct,
    onAssignClick,
    onRemoveAssignment,
}) {
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [expandedIds, setExpandedIds] = useState(new Set());

    const toggleExpanded = useCallback((id) => {
        setExpandedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }, []);

    if (filteredItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-16 text-gray-300 mb-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Sin materiales</h3>
                <p className="text-sm text-gray-500">No se encontraron materiales con los filtros seleccionados.</p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border-2 border-gray-300 shadow-md">
            <table className="w-full table-fixed divide-y-2 divide-gray-200 bg-white text-sm">
                <thead className="text-left">
                    <tr>
                        <th className="w-10 px-2 py-3 text-center" />
                        <th className="w-10 px-2 py-3 text-center" />
                        <th className="w-[200px] px-4 py-3 font-semibold text-gray-900">Producto</th>
                        <th className="w-[150px] px-4 py-3 font-semibold text-gray-900">Categoría</th>
                        <th className="w-20 px-4 py-3 font-semibold text-gray-900 text-center">Cant.</th>
                        <th className="w-24 px-4 py-3 font-semibold text-gray-900 text-right">P. Unit.</th>
                        <th className="w-[130px] px-4 py-3 font-semibold text-gray-900 text-center">Disponibilidad</th>
                        <th className="w-[140px] px-4 py-3 font-semibold text-gray-900">Proyecto de origen</th>
                        <th className="w-[110px] px-4 py-3 font-semibold text-gray-900">Ubicación</th>
                        <th className="w-[110px] px-4 py-3 font-semibold text-gray-900 text-center">Estado</th>
                        <th className="w-[110px] px-4 py-3 font-semibold text-gray-900 text-center">Verificación</th>
                        <th className="w-20 px-4 py-3 font-semibold text-gray-900 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => {
                        const isExpanded = expandedIds.has(item.id);
                        const hasAssignments = (assignments[item.id] || []).length > 0;
                        const hasUsage = (usage[item.id] || []).length > 0;
                        const hasData = hasAssignments || hasUsage;

                        return (
                            <Fragment key={item.id}>
                                <tr className={`transition-colors ${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'}`}>
                                    {/* Número de asignaciones */}
                                    <td className="px-2 py-4 text-center">
                                        {hasData && (
                                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-base font-bold text-primary">
                                                {(assignments[item.id] || []).length + (usage[item.id] || []).length}
                                            </span>
                                        )}
                                    </td>
                                    {/* Botón de despliegue */}
                                    <td className="px-2 py-4 text-center">
                                        <button
                                            onClick={() => toggleExpanded(item.id)}
                                            className={`flex items-center justify-center rounded-md transition-all ${
                                                hasData
                                                    ? 'bg-primary/10 p-2 text-primary hover:bg-primary/20'
                                                    : 'bg-gray-100 p-2 text-gray-400 hover:bg-gray-200'
                                            }`}
                                            title={isExpanded ? 'Ocultar detalle' : 'Ver asignaciones / uso'}
                                        >
                                            <ChevronDownIcon className={`size-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    </td>
                                    {/* Producto */}
                                    <td className="px-4 py-3 max-w-0">
                                        <div className="truncate">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{item.nombre}</p>
                                            <p className="text-xs text-gray-500 truncate">{item.sku}</p>
                                        </div>
                                    </td>
                                    {/* Categoría */}
                                    <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-0">{item.categoria}</td>
                                    {/* Cantidad */}
                                    <QuantityCell item={item} assignments={assignments} />
                                    {/* Precio Unitario */}
                                    <td className="px-4 py-3 text-right">
                                        {(() => {
                                            const precio = parseFloat(item.precio) || 0;
                                            const qty = parseInt(item.cantidad) || 1;
                                            const unitPrice = parseFloat(item.precio_unitario) || (precio > 0 && qty > 0 ? precio / qty : 0);
                                            return unitPrice > 0 ? (
                                                <span className="font-mono text-sm text-gray-700">S/ {unitPrice.toFixed(2)}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400">-</span>
                                            );
                                        })()}
                                    </td>
                                    {/* Disponibilidad */}
                                    <DisponibilidadCell item={item} assignments={assignments} />
                                    {/* Proyecto de origen */}
                                    <td className="px-4 py-3">
                                        {item.nombre_proyecto ? (
                                            <span
                                                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                                                style={getProjectPillStyle(item)}
                                            >
                                                {item.nombre_proyecto}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                        )}
                                    </td>
                                    {/* Ubicación */}
                                    <td className="px-4 py-3">
                                        {item.ubicacion ? (
                                            <span className="inline-flex items-center rounded bg-primary-50 px-2 py-0.5 font-mono text-xs font-semibold text-primary-700">
                                                {item.ubicacion}
                                            </span>
                                        ) : item.apartado ? (
                                            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 6a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 6Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                                                </svg>
                                                Pendiente
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                    {/* Estado */}
                                    <td className="px-4 py-3 text-center">
                                        <Badge variant={STATUS_VARIANT[item.estado] || 'gray'}>
                                            {STATUS_LABEL[item.estado] || item.estado}
                                        </Badge>
                                    </td>
                                    {/* Verificación */}
                                    <td className="px-4 py-3 text-center">
                                        {item.verificado_at ? (
                                            <span
                                                className="text-xs text-emerald-600 font-medium"
                                                title={`Verificado por: ${item.verificado_por}`}
                                            >
                                                {formatDate(item.verificado_at)}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-gray-400">-</span>
                                        )}
                                    </td>
                                    {/* Acciones */}
                                    <td className="px-2 py-3 text-center">
                                        <ActionDropdown
                                            item={item}
                                            onEdit={openModal}
                                            onDelete={deleteProduct}
                                            onVerify={verifyProduct}
                                            onReport={openReportModal}
                                            onAssign={onAssignClick}
                                            isOpen={openDropdownId === item.id}
                                            onToggle={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                                            onClose={() => setOpenDropdownId(null)}
                                        />
                                    </td>
                                </tr>
                                {/* Fila expandida justo debajo del material */}
                                {isExpanded && (
                                    <tr className="animate-in fade-in slide-in-from-top-2 duration-300">
                                        <td colSpan={COL_COUNT} className="bg-gray-50/50 p-0">
                                            <AssignmentRow
                                                item={item}
                                                assignments={assignments}
                                                usage={usage}
                                                onRemoveAssignment={onRemoveAssignment}
                                            />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
