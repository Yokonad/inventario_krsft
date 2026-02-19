import { formatDate, getProjectPillStyle } from '../utils/helpers';
import {
    PinIcon, WarningSmallIcon, DotsIcon,
    DropdownWarningIcon, DropdownVerifyIcon, DropdownEditIcon, DropdownDeleteIcon,
} from './Icons';
import {
    TABLE_CLASSES, BADGE_CLASSES, ACTION_MENU_CLASSES,
} from '../tokens';
import { statusBadgeClass } from './utils/classHelpers';

/**
 * Inventory table with action menu dropdowns.
 * Per rerender-memo — isolated from tabs and modals to reduce re-renders.
 * Styles: Tailwind CSS via tokens.js (NO CSS files).
 */
export default function InventarioTable({
    filteredItems,
    openMenuId, setOpenMenuId,
    openReportModal, verifyProduct, openModal, deleteProduct,
}) {
    return (
        <div className={TABLE_CLASSES.card}>
            <table className={TABLE_CLASSES.table}>
                <thead className={TABLE_CLASSES.head}>
                    <tr>
                        <th className={TABLE_CLASSES.head_cell}>Producto</th>
                        <th className={TABLE_CLASSES.head_cell}>Categoría</th>
                        <th className={TABLE_CLASSES.head_cell_center}>Cant.</th>
                        <th className={TABLE_CLASSES.head_cell}>Proyecto</th>
                        <th className={TABLE_CLASSES.head_cell}>Ubicación</th>
                        <th className={TABLE_CLASSES.head_cell_center}>Estado</th>
                        <th className={TABLE_CLASSES.head_cell_center}>Verificación</th>
                        <th className={TABLE_CLASSES.head_cell_center}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map((item) => (
                        <tr key={item.id} className={`${TABLE_CLASSES.row}${item.apartado ? ` ${TABLE_CLASSES.row_apartado}` : ''}`}>
                            <td className={TABLE_CLASSES.cell}>
                                <div className={TABLE_CLASSES.product_name}>{item.nombre}</div>
                                <div className={TABLE_CLASSES.product_sku}>{item.sku}</div>
                            </td>
                            <td className={TABLE_CLASSES.cell}>{item.categoria}</td>
                            <td className={TABLE_CLASSES.cell_center}>{item.cantidad}</td>
                            <td className={TABLE_CLASSES.cell}>
                                {item.apartado ? (
                                    <div className="flex items-center gap-2">
                                        <span className={BADGE_CLASSES.apartado}>
                                            {PinIcon}
                                            APARTADO
                                        </span>
                                        {/* project-pill usa color dinámico — excepción técnica documentada en styles.config.js */}
                                        <span className={BADGE_CLASSES.project_pill} style={getProjectPillStyle(item)}>
                                            {item.nombre_proyecto}
                                        </span>
                                    </div>
                                ) : (
                                    <span className={TABLE_CLASSES.text_muted}>-</span>
                                )}
                            </td>
                            <td className={TABLE_CLASSES.cell}>
                                {item.ubicacion ? (
                                    <span className={BADGE_CLASSES.location_code}>{item.ubicacion}</span>
                                ) : item.apartado ? (
                                    <div className={BADGE_CLASSES.pending_info}>
                                        {WarningSmallIcon}
                                        Pendiente
                                    </div>
                                ) : (
                                    <span className={TABLE_CLASSES.text_muted}>-</span>
                                )}
                            </td>
                            <td className={TABLE_CLASSES.cell_center}>
                                <span className={statusBadgeClass(item.estado)}>
                                    {item.estado === 'activo' ? 'Aprobado' : item.estado === 'pendiente' ? 'Sin Aprobar' : 'Rechazado'}
                                </span>
                            </td>
                            <td className={TABLE_CLASSES.cell_center}>
                                {item.verificado_at ? (
                                    <div className="relative inline-block cursor-help" title={`Verificado por: ${item.verificado_por}`}>
                                        <span className={BADGE_CLASSES.verified}>{formatDate(item.verificado_at)}</span>
                                    </div>
                                ) : (
                                    <span className={TABLE_CLASSES.text_muted}>-</span>
                                )}
                            </td>
                            <td className={TABLE_CLASSES.cell_center}>
                                <div className={ACTION_MENU_CLASSES.wrapper}>
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                        className={ACTION_MENU_CLASSES.trigger}
                                        title="Opciones"
                                    >
                                        {DotsIcon}
                                    </button>
                                    {openMenuId === item.id && (
                                        <div className={ACTION_MENU_CLASSES.dropdown}>
                                            {item.apartado && item.nombre_proyecto && (
                                                <button
                                                    onClick={() => { openReportModal(item); setOpenMenuId(null); }}
                                                    className={`${ACTION_MENU_CLASSES.item} ${ACTION_MENU_CLASSES.item_report}`}
                                                >
                                                    {DropdownWarningIcon}
                                                    <span>Reportar Problema</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { verifyProduct(item); setOpenMenuId(null); }}
                                                className={`${ACTION_MENU_CLASSES.item} ${ACTION_MENU_CLASSES.item_verify}`}
                                            >
                                                {DropdownVerifyIcon}
                                                <span>Verificar</span>
                                            </button>
                                            <button
                                                onClick={() => { openModal(item); setOpenMenuId(null); }}
                                                className={`${ACTION_MENU_CLASSES.item} ${ACTION_MENU_CLASSES.item_edit}`}
                                            >
                                                {DropdownEditIcon}
                                                <span>Editar</span>
                                            </button>
                                            <button
                                                onClick={() => { deleteProduct(item); setOpenMenuId(null); }}
                                                className={`${ACTION_MENU_CLASSES.item} ${ACTION_MENU_CLASSES.item_delete}`}
                                            >
                                                {DropdownDeleteIcon}
                                                <span>Eliminar</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                <div className="text-sm text-gray-500">
                    Mostrando <strong className="text-gray-700">1-{filteredItems.length}</strong> de <strong className="text-gray-700">{filteredItems.length}</strong> resultados
                </div>
                <div className="flex items-center gap-1">
                    <button disabled className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-400 cursor-not-allowed">{'<'} Anterior</button>
                    <button className="px-3 py-1.5 text-sm rounded-md bg-blue-500 text-white font-semibold border border-blue-500">1</button>
                    <button disabled className="px-3 py-1.5 text-sm rounded-md border border-gray-200 text-gray-400 cursor-not-allowed">Siguiente {'>'}</button>
                </div>
            </div>
        </div>
    );
}
