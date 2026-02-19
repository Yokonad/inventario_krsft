import { CATEGORIES } from '../utils/constants';
import { SearchIcon, PlusIcon } from './Icons';
import { FILTER_CLASSES } from '../tokens';

/**
 * Filter bar for inventory search, category, and status filtering.
 * Per rerender-memo — extracted as its own component to isolate re-renders.
 * Styles: Tailwind CSS via tokens.js (NO CSS files).
 */
export default function FilterBar({
    searchQuery, onSearchChange,
    filterCategory, onCategoryChange,
    filterStatus, onStatusChange,
    onAddClick,
}) {
    return (
        <div className={FILTER_CLASSES.bar}>
            <div className={`${FILTER_CLASSES.field} ${FILTER_CLASSES.field_search}`}>
                <label className={FILTER_CLASSES.label}>BUSCAR</label>
                <div className={FILTER_CLASSES.input_wrapper}>
                    <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        className={FILTER_CLASSES.input}
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                    <span className={FILTER_CLASSES.search_icon}>{SearchIcon}</span>
                </div>
            </div>
            <div className={FILTER_CLASSES.field}>
                <label className={FILTER_CLASSES.label}>CATEGORÍA</label>
                <select className={FILTER_CLASSES.select} value={filterCategory} onChange={(e) => onCategoryChange(e.target.value)}>
                    <option value="">Todas</option>
                    {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
            <div className={FILTER_CLASSES.field}>
                <label className={FILTER_CLASSES.label}>ESTADO</label>
                <select className={FILTER_CLASSES.select} value={filterStatus} onChange={(e) => onStatusChange(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="activo">Activo</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="rechazado">Rechazado</option>
                </select>
            </div>
            <div className={FILTER_CLASSES.field_action}>
                <label className={FILTER_CLASSES.label}>NUEVO</label>
                <button className={FILTER_CLASSES.add_btn} onClick={onAddClick}>
                    {PlusIcon}
                    <span>Nuevo Material</span>
                </button>
            </div>
        </div>
    );
}
