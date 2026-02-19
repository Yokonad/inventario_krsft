import { CATEGORIES } from '../utils/constants';
import { SearchIcon, PlusIcon } from './Icons';

/**
 * Filter bar for inventory search, category, and status filtering.
 * Per rerender-memo — extracted as its own component to isolate re-renders.
 * Styles: CSS via inventario-layout.css
 */
export default function FilterBar({
    searchQuery, onSearchChange,
    filterCategory, onCategoryChange,
    filterStatus, onStatusChange,
    onAddClick,
}) {
    return (
        <div className="filters-container-row">
            <div className="filter-field filter-field-search">
                <label className="filter-label">🔍 Buscar</label>
                <div className="filter-input-wrapper with-border">
                    <span className="search-icon-fixed">{SearchIcon}</span>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
            <div className="filter-field">
                <label className="filter-label">📁 Categoría</label>
                <select className="filter-select" value={filterCategory} onChange={(e) => onCategoryChange(e.target.value)}>
                    <option value="">Todas</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div className="filter-field">
                <label className="filter-label">📊 Estado</label>
                <select className="filter-select" value={filterStatus} onChange={(e) => onStatusChange(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazado">Rechazado</option>
                </select>
            </div>
            <div className="filter-field-action">
                <label className="filter-label">✨ Nuevo</label>
                <button className="btn-new-material" onClick={onAddClick}>
                    {PlusIcon}
                    <span>Nuevo Material</span>
                </button>
            </div>
        </div>
    );
}
