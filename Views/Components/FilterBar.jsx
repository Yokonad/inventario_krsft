/**
 * FilterBar – Search + Category/Status filters + New button (Tailwind, cyan accent).
 */
import { PlusIcon } from '@heroicons/react/24/outline';
import { CATEGORIES } from '../utils/constants';
import SearchInput from './ui/SearchInput';
import Button from './ui/Button';

export default function FilterBar({
    searchQuery, onSearchChange,
    filterCategory, onCategoryChange,
    filterStatus, onStatusChange,
    onAddClick,
}) {
    return (
        <div className="rounded-lg border-2 border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <SearchInput
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Buscar por nombre..."
                    className="flex-1"
                />
                <div className="sm:w-44">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Categoría</label>
                    <select
                        value={filterCategory}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
                    >
                        <option value="">Todas</option>
                        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <div className="sm:w-40">
                    <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Estado</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
                    >
                        <option value="">Todos</option>
                        <option value="activo">Activo</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="rechazado">Rechazado</option>
                    </select>
                </div>
                <Button variant="primary" onClick={() => onAddClick()} className="gap-2 whitespace-nowrap">
                    <PlusIcon className="size-4" /> Nuevo Material
                </Button>
            </div>
        </div>
    );
}
