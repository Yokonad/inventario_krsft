import { CATEGORIES } from '../utils/constants';
import { SearchIcon } from './Icons';

/**
 * Filter bar for inventory search, category, and status filtering.
 * Per rerender-memo — extracted as its own component to isolate re-renders.
 */
export default function FilterBar({
    searchQuery, onSearchChange,
    filterCategory, onCategoryChange,
    filterStatus, onStatusChange,
}) {
    return (
        <div className="filter-bar">
            <div className="filter-field filter-field--search">
                <label className="filter-label">BUSCAR</label>
                <div className="filter-input-wrapper">
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className="filter-input"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    {SearchIcon}
                </div>
            </div>
            <div className="filter-field">
                <label className="filter-label">CATEGORÍA</label>
                <select className="filter-select" value={filterCategory} onChange={(e) => onCategoryChange(e.target.value)}>
                    <option value="">Todas</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div className="filter-field">
                <label className="filter-label">ESTADO</label>
                <select className="filter-select" value={filterStatus} onChange={(e) => onStatusChange(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazado">Rechazado</option>
                </select>
            </div>
        </div>
    );
}
