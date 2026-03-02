/**
 * @file Modal para asignar cantidad de un material a un proyecto.
 * @module inventariokrsft/components/modals/AssignProjectModal
 */
import { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { FolderPlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

/**
 * @param {{
 *   product: Object|null,
 *   projects: Array,
 *   assignments: Object,
 *   onAssign: Function,
 *   onClose: Function,
 * }} props
 */
export default function AssignProjectModal({
    product,
    projects = [],
    assignments = {},
    onAssign,
    onClose,
}) {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [notas, setNotas] = useState('');
    const [searchProject, setSearchProject] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Calcular disponible internamente
    const disponible = useMemo(() => {
        if (!product) return 0;
        const itemAssignments = assignments[product.id] || [];
        const totalAsignado = itemAssignments.reduce((sum, a) => sum + (a.cantidad || 0), 0);
        return Math.max(0, product.cantidad - totalAsignado);
    }, [product, assignments]);

    // Reset on product change (modal abierto)
    useEffect(() => {
        if (product) {
            setSelectedProjectId('');
            setCantidad(1);
            setNotas('');
            setSearchProject('');
            setSubmitting(false);
        }
    }, [product]);

    const filteredProjects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchProject.toLowerCase()),
    );

    const selectedProject = projects.find((p) => p.id === Number(selectedProjectId));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProjectId || cantidad < 1 || cantidad > disponible) return;
        setSubmitting(true);
        await onAssign({
            productId: product.id,
            projectId: Number(selectedProjectId),
            projectName: selectedProject?.name || '',
            cantidad,
            notas: notas.trim() || '',
        });
        setSubmitting(false);
    };

    const canSubmit = selectedProjectId && cantidad >= 1 && cantidad <= disponible && !submitting;

    if (!product) return null;

    return (
        <Modal
            open={!!product}
            onClose={onClose}
            title="Asignar Material a Proyecto"
            titleIcon={<FolderPlusIcon className="size-5 text-primary" />}
            size="md"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        loading={submitting}
                        className="gap-2"
                    >
                        <FolderPlusIcon className="size-4" />
                        {submitting ? 'Asignando...' : 'Asignar'}
                    </Button>
                </>
            }
        >
            <div className="space-y-5">
                {/* Material Info */}
                <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
                    <p className="text-xs font-semibold uppercase text-primary-700 mb-1">Material</p>
                    <p className="text-sm font-bold text-gray-900">{product.nombre}</p>
                    <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-gray-600">
                            Stock total: <strong className="text-gray-900">{product.cantidad} {product.unidad || 'UND'}</strong>
                        </span>
                        <Badge variant={disponible > 0 ? 'emerald' : 'red'}>
                            {disponible} disponible{disponible !== 1 ? 's' : ''}
                        </Badge>
                    </div>
                </div>

                {/* Project Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proyecto destino <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mb-2">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchProject}
                            onChange={(e) => setSearchProject(e.target.value)}
                            placeholder="Buscar proyecto..."
                            className="w-full rounded border border-gray-300 pl-9 pr-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
                        />
                    </div>
                    <div className="max-h-40 overflow-y-auto rounded border border-gray-200">
                        {filteredProjects.length === 0 ? (
                            <p className="px-3 py-4 text-center text-sm text-gray-400">No se encontraron proyectos</p>
                        ) : (
                            filteredProjects.map((proj) => (
                                <label
                                    key={proj.id}
                                    className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                                        Number(selectedProjectId) === proj.id
                                            ? 'bg-primary-50 border-l-2 border-primary'
                                            : 'hover:bg-gray-50 border-l-2 border-transparent'
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        name="project"
                                        value={proj.id}
                                        checked={Number(selectedProjectId) === proj.id}
                                        onChange={(e) => setSelectedProjectId(e.target.value)}
                                        className="text-primary focus:ring-primary"
                                    />
                                    <span className="text-sm text-gray-800 font-medium">{proj.name}</span>
                                </label>
                            ))
                        )}
                    </div>
                </div>

                {/* Cantidad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad a asignar <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.max(1, Math.min(disponible, Number(e.target.value))))}
                        min={1}
                        max={disponible}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-primary"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Máximo disponible: <strong>{disponible} {product.unidad || 'UND'}</strong>
                    </p>
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
                    <textarea
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        rows="2"
                        placeholder="Observaciones sobre la asignación..."
                        className="w-full resize-none rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
            </div>
        </Modal>
    );
}
