import { formatDate, getProjectPillStyle } from '../utils/helpers';
import {
    PinIcon, WarningSmallIcon, DotsIcon,
    DropdownWarningIcon, DropdownVerifyIcon, DropdownEditIcon, DropdownDeleteIcon,
} from './Icons';

/**
 * Inventory table with action menu dropdowns.
 * Per rerender-memo — isolated from tabs and modals to reduce re-renders.
 */
export default function InventarioTable({
    filteredItems,
    openMenuId, setOpenMenuId,
    openReportModal, verifyProduct, openModal, deleteProduct,
}) {
    return (
        <div className="table-card">
            <table className="inventory-table">
                <thead className="table-head">
                    <tr>
                        <th className="table-head-cell">Producto</th>
                        <th className="table-head-cell">Categoría</th>
                        <th className="table-head-cell is-center">Cant.</th>
                        <th className="table-head-cell">Proyecto</th>
                        <th className="table-head-cell">Ubicación</th>
                        <th className="table-head-cell is-center">Estado</th>
                        <th className="table-head-cell is-center">Verificación</th>
                        <th className="table-head-cell is-center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map((item) => (
                        <tr key={item.id} className={`table-row${item.apartado ? ' is-apartado' : ''}`}>
                            <td className="table-cell">
                                <div className="product-name">{item.nombre}</div>
                                <div className="product-sku">{item.sku}</div>
                            </td>
                            <td className="table-cell">{item.categoria}</td>
                            <td className="table-cell is-center">{item.cantidad}</td>
                            <td className="table-cell">
                                {item.apartado ? (
                                    <div className="apartado-info">
                                        <span className="apartado-badge">
                                            {PinIcon}
                                            APARTADO
                                        </span>
                                        <span className="project-pill" style={getProjectPillStyle(item)}>
                                            {item.nombre_proyecto}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </td>
                            <td className="table-cell">
                                {item.ubicacion ? (
                                    <span className="location-code">{item.ubicacion}</span>
                                ) : item.apartado ? (
                                    <div className="pending-info">
                                        {WarningSmallIcon}
                                        Pendiente
                                    </div>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </td>
                            <td className="table-cell is-center">
                                <span
                                    className={`status-badge${item.estado === 'activo' ? ' approved' : item.estado === 'pendiente' ? ' pending' : ' rejected'}`}
                                >
                                    {item.estado === 'activo' ? 'Aprobado' : item.estado === 'pendiente' ? 'Sin Aprobar' : 'Rechazado'}
                                </span>
                            </td>
                            <td className="table-cell is-center">
                                {item.verificado_at ? (
                                    <div className="verification-info" title={`Verificado por: ${item.verificado_por}`}>
                                        <span className="verification-date">{formatDate(item.verificado_at)}</span>
                                    </div>
                                ) : (
                                    <span className="text-muted">-</span>
                                )}
                            </td>
                            <td className="table-cell is-center">
                                <div className="action-menu-wrapper">
                                    <button
                                        onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                        className="action-menu-trigger"
                                        title="Opciones"
                                    >
                                        {DotsIcon}
                                    </button>
                                    {openMenuId === item.id && (
                                        <div className="action-dropdown">
                                            {item.apartado && item.nombre_proyecto && (
                                                <button
                                                    onClick={() => { openReportModal(item); setOpenMenuId(null); }}
                                                    className="dropdown-item dropdown-item--report"
                                                >
                                                    {DropdownWarningIcon}
                                                    <span>Reportar Problema</span>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => { verifyProduct(item); setOpenMenuId(null); }}
                                                className="dropdown-item dropdown-item--verify"
                                            >
                                                {DropdownVerifyIcon}
                                                <span>Verificar</span>
                                            </button>
                                            <button
                                                onClick={() => { openModal(item); setOpenMenuId(null); }}
                                                className="dropdown-item dropdown-item--edit"
                                            >
                                                {DropdownEditIcon}
                                                <span>Editar</span>
                                            </button>
                                            <button
                                                onClick={() => { deleteProduct(item); setOpenMenuId(null); }}
                                                className="dropdown-item dropdown-item--delete"
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
            <div className="pagination">
                <div className="pagination-info">
                    Mostrando <strong>1-{filteredItems.length}</strong> de <strong>{filteredItems.length}</strong> resultados
                </div>
                <div className="pagination-actions">
                    <button disabled className="pagination-btn is-disabled">&lt; Anterior</button>
                    <button className="pagination-btn is-active">1</button>
                    <button disabled className="pagination-btn is-disabled">Siguiente &gt;</button>
                </div>
            </div>
        </div>
    );
}
