/**
 * InventarioTable – Tabla de inventario con expansión de uso por proyecto.
 */
import { useState, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { formatDate, getProjectPillStyle } from '../utils/helpers';
import {
    PencilSquareIcon,
    TrashIcon,
    MapPinIcon,
    Bars3Icon,
    CheckCircleIcon,
    XMarkIcon,
    ChevronRightIcon,
    ChevronDownIcon,
} from '@heroicons/react/24/outline';
import Badge from './ui/Badge';

const STATUS_VARIANT = { activo: 'emerald', pendiente: 'amber', rechazado: 'red' };
const STATUS_LABEL = { activo: 'Aprobado', pendiente: 'Sin Aprobar', rechazado: 'Rechazado' };

function ActionDropdown({ item, onEdit, onDelete, onVerify, isOpen, onToggle, onClose, permissions = {} }) {
    const actions = [
        permissions.update ? {
            label: 'Editar Material',
            description: 'Modificar datos del material',
            icon: <PencilSquareIcon className="size-6" />,
            onClick: () => { onEdit(item); onClose(); },
            iconBg: 'bg-blue-100 text-blue-600',
            border: 'border-blue-100 hover:border-blue-300 hover:bg-blue-50/50',
        } : null,
        permissions.verify ? {
            label: 'Verificar',
            description: 'Marcar como verificado',
            icon: <CheckCircleIcon className="size-6" />,
            onClick: () => { onVerify(item); onClose(); },
            iconBg: 'bg-emerald-100 text-emerald-600',
            border: 'border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50/50',
        } : null,
    ].filter(Boolean);

    const showHamburger = actions.length > 0;
    const showTrash = permissions.delete;

    if (!showHamburger && !showTrash) {
        return <span className="text-sm text-gray-400">—</span>;
    }

    return (
        <div className="flex items-center justify-center gap-1.5">
            {showHamburger && (
                <button
                    onClick={onToggle}
                    className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white p-2 text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                    title="Más opciones"
                >
                    <Bars3Icon className="size-4" />
                </button>
            )}

            {showTrash && (
                <button
                    onClick={() => onDelete(item)}
                    className="inline-flex items-center justify-center rounded-md border border-red-200 bg-red-50 p-2 text-red-500 shadow-sm hover:bg-red-100 transition-colors"
                    title="Eliminar"
                >
                    <TrashIcon className="size-4" />
                </button>
            )}

            {isOpen && showHamburger && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-gray-200"
                        onClick={(e) => e.stopPropagation()}
                    >
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

                        <div className="p-4 flex flex-col gap-2">
                            {actions.map((action) => (
                                <button
                                    key={action.label}
                                    onClick={action.onClick}
                                    className={`flex items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all ${action.border}`}
                                >
                                    <span className={`flex items-center justify-center rounded-xl p-2.5 ${action.iconBg}`}>
                                        {action.icon}
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold text-gray-800">{action.label}</span>
                                        <span className="block text-xs text-gray-400">{action.description}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}

/**
 * @param {{
 *   filteredItems: Array,
 *   verifyProduct: Function,
 *   openModal: Function,
 *   deleteProduct: Function,
 * }} props
 */
export default function InventarioTable({
    filteredItems,
    verifyProduct,
    openModal,
    deleteProduct,
    permissions = {},
}) {
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleRow = (itemId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemId)) {
                newSet.delete(itemId);
            } else {
                newSet.add(itemId);
            }
            return newSet;
        });
    };

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
                        <th className="w-[170px] px-4 py-3 font-semibold text-gray-900">Tipo de Material</th>
                        <th className="w-[200px] px-4 py-3 font-semibold text-gray-900">Especificación Técnica</th>
                        <th className="w-[130px] px-4 py-3 font-semibold text-gray-900">Categoría</th>
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
                        const isExpanded = expandedRows.has(item.id);
                        const hasUsage = item.usage && item.usage.length > 0;
                        
                        return (
                            <Fragment key={item.id}>
                                <tr className="hover:bg-gray-50 transition-colors">
                                    {/* Tipo de Material */}
                                    <td className="px-4 py-3 max-w-0">
                                        <div className="flex items-center gap-2">
                                            {hasUsage && (
                                                <button
                                                    onClick={() => toggleRow(item.id)}
                                                    className="shrink-0 rounded p-1 hover:bg-gray-200 transition-colors"
                                                    title={isExpanded ? 'Ocultar uso' : 'Ver uso por proyecto'}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDownIcon className="size-4 text-gray-600" />
                                                    ) : (
                                                        <ChevronRightIcon className="size-4 text-gray-600" />
                                                    )}
                                                </button>
                                            )}
                                            <div className="truncate">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{item.nombre || '—'}</p>
                                                <p className="text-xs text-gray-500 truncate">{item.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {/* Especificación Técnica */}
                                    <td className="px-4 py-3 max-w-0">
                                        <p className="text-sm text-gray-700 truncate" title={item.descripcion}>{item.descripcion || '—'}</p>
                                    </td>
                            <td className="px-4 py-3 text-sm text-gray-700 truncate max-w-0">{item.categoria}</td>
                            <td className="whitespace-nowrap px-4 py-3 text-center">
                                <span className="font-mono text-sm font-semibold text-gray-800">{item.cantidad}</span>
                            </td>
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
                            <td className="whitespace-nowrap px-4 py-3 text-center">
                                {item.apartado ? (
                                    <Badge variant="cyan" className="gap-1">
                                        <MapPinIcon className="size-3" /> Apartado
                                    </Badge>
                                ) : (
                                    <Badge variant="emerald" className="gap-1">
                                        <CheckCircleIcon className="size-3" /> Disponible
                                    </Badge>
                                )}
                            </td>
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
                            <td className="px-4 py-3">
                                {item.ubicacion ? (
                                    <span className="inline-flex items-center rounded bg-primary-50 px-2 py-0.5 font-mono text-xs font-semibold text-primary-700">
                                        {item.ubicacion}
                                    </span>
                                ) : item.apartado ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">Pendiente</span>
                                ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                )}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <Badge variant={STATUS_VARIANT[item.estado] || 'gray'}>
                                    {STATUS_LABEL[item.estado] || item.estado}
                                </Badge>
                            </td>
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
                            <td className="px-2 py-3 text-center">
                                <ActionDropdown
                                    item={item}
                                    onEdit={openModal}
                                    onDelete={deleteProduct}
                                    onVerify={verifyProduct}
                                    isOpen={openDropdownId === item.id}
                                    onToggle={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                                    onClose={() => setOpenDropdownId(null)}
                                    permissions={permissions}
                                />
                            </td>
                        </tr>
                        
                        {/* Fila expandida mostrando uso por proyecto */}
                        {isExpanded && hasUsage && (
                            <tr key={`${item.id}-usage`} className="bg-gray-50">
                                <td colSpan="11" className="px-4 py-3">
                                    <div className="ml-8 space-y-2">
                                        <h4 className="text-xs font-semibold text-gray-700 mb-2">Uso por Proyecto:</h4>
                                        <div className="space-y-1.5">
                                            {item.usage.map((uso, idx) => (
                                                <div 
                                                    key={idx} 
                                                    className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-3 py-2"
                                                >
                                                    <span className="text-sm text-gray-800 font-medium">
                                                        {uso.proyecto}
                                                    </span>
                                                    <span className="font-mono text-sm font-semibold text-primary-600">
                                                        {uso.cantidad} unidades
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
