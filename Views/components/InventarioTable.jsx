import { formatDate, getProjectPillStyle } from '../utils/helpers';
import {
    PinIcon, WarningSmallIcon, DotsIcon,
    DropdownWarningIcon, DropdownVerifyIcon, DropdownEditIcon, DropdownDeleteIcon,
} from './Icons';
import { statusBadgeClass } from './utils/classHelpers';

/**
 * Inventory table with action menu dropdowns.
 * Per rerender-memo — isolated from tabs and modals to reduce re-renders.
 * Styles: CSS via inventario-table.css
 */
export default function InventarioTable({
    filteredItems,
    openMenuId, setOpenMenuId,
    openReportModal, verifyProduct, openModal, deleteProduct,
}) {
    return (
        <div className="table-container">
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th>Categoría</th>
                            <th className="text-center">Cant.</th>
                            <th>Proyecto</th>
                            <th>Ubicación</th>
                            <th className="text-center">Estado</th>
                            <th className="text-center">Verificación</th>
                            <th className="text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr key={item.id} className={`table-row${item.apartado ? ' apartado' : ''}`}>
                                <td>
                                    <div className="product-info-cell">
                                        <div className="product-avatar">{item.nombre.charAt(0).toUpperCase()}</div>
                                        <div className="product-details">
                                            <div className="product-name">{item.nombre}</div>
                                            <div className="product-meta">{item.sku}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><span className="category-type">{item.categoria}</span></td>
                                <td className="text-center"><span className="mono-text">{item.cantidad}</span></td>
                                <td>
                                    {item.apartado ? (
                                        <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                                            <span className="badge-apartado badge-pill" style={{display:'inline-flex', alignItems:'center', gap:'6px'}}>
                                                {PinIcon}
                                                APARTADO
                                            </span>
                                            <span className="project-pill badge-pill" style={getProjectPillStyle(item)}>
                                                {item.nombre_proyecto}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                                <td>
                                    {item.ubicacion ? (
                                        <span className="location-code">{item.ubicacion}</span>
                                    ) : item.apartado ? (
                                        <div className="pending-location">
                                            {WarningSmallIcon}
                                            Pendiente
                                        </div>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    <span className={statusBadgeClass(item.estado)}>
                                        {item.estado === 'activo' ? 'Aprobado' : item.estado === 'pendiente' ? 'Sin Aprobar' : 'Rechazado'}
                                    </span>
                                </td>
                                <td className="text-center">
                                    {item.verificado_at ? (
                                        <div style={{position:'relative', display:'inline-block', cursor:'help'}} title={`Verificado por: ${item.verificado_por}`}>
                                            <span className="badge-verified">{formatDate(item.verificado_at)}</span>
                                        </div>
                                    ) : (
                                        <span className="text-muted">-</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    <div className="action-menu">
                                        <button
                                            onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                            className="action-menu-trigger"
                                            title="Opciones"
                                        >
                                            {DotsIcon}
                                        </button>
                                        {openMenuId === item.id && (
                                            <div className="action-menu-dropdown">
                                                {item.apartado && item.nombre_proyecto && (
                                                    <button
                                                        onClick={() => { openReportModal(item); setOpenMenuId(null); }}
                                                        className="action-menu-item action-menu-item--report"
                                                    >
                                                        {DropdownWarningIcon}
                                                        <span>Reportar Problema</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { verifyProduct(item); setOpenMenuId(null); }}
                                                    className="action-menu-item action-menu-item--verify"
                                                >
                                                    {DropdownVerifyIcon}
                                                    <span>Verificar</span>
                                                </button>
                                                <button
                                                    onClick={() => { openModal(item); setOpenMenuId(null); }}
                                                    className="action-menu-item action-menu-item--edit"
                                                >
                                                    {DropdownEditIcon}
                                                    <span>Editar</span>
                                                </button>
                                                <button
                                                    onClick={() => { deleteProduct(item); setOpenMenuId(null); }}
                                                    className="action-menu-item action-menu-item--delete"
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
            </div>
            
            {/* Pagination */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 24px', borderTop:'2px solid #e2e8f0', background:'linear-gradient(to right, #f9fafb, rgba(59, 130, 246, 0.05))'}}>
                <div style={{fontSize:'0.875rem', color:'#475569', fontWeight:600}}>
                    Mostrando <span style={{color:'#3b82f6', fontWeight:700}}>{filteredItems.length}</span> de <span style={{color:'#3b82f6', fontWeight:700}}>{filteredItems.length}</span> resultados
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
                    <button disabled style={{padding:'8px 16px', fontSize:'0.875rem', fontWeight:600, borderRadius:'8px', border:'2px solid #e2e8f0', color:'#cbd5e1', cursor:'not-allowed', background:'white'}}>
                        ← Anterior
                    </button>
                    <button style={{padding:'8px 16px', fontSize:'0.875rem', borderRadius:'8px', background:'#3b82f6', color:'white', fontWeight:700, border:'2px solid #3b82f6', boxShadow:'0 4px 12px rgba(59, 130, 246, 0.25)'}}>
                        1
                    </button>
                    <button disabled style={{padding:'8px 16px', fontSize:'0.875rem', fontWeight:600, borderRadius:'8px', border:'2px solid #e2e8f0', color:'#cbd5e1', cursor:'not-allowed', background:'white'}}>
                        Siguiente →
                    </button>
                </div>
            </div>
        </div>
    );
}
