/**
 * INVENTARIO — Index.jsx (Orchestrator, HyperUI layout)
 */
import {
    ArchiveBoxIcon, ClipboardDocumentListIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { useInventarioData } from './hooks/useInventarioData';

/* Feature components */
import PageHeader      from './Components/PageHeader';
import FilterBar       from './Components/FilterBar';
import InventarioTable from './Components/InventarioTable';
import ReportesTab     from './Components/ReportesTab';

/* Modals */
import MaterialModal      from './Components/modals/MaterialModal';
import LocationModal      from './Components/modals/LocationModal';
import VerifyModal        from './Components/modals/VerifyModal';
import ReportModal        from './Components/modals/ReportModal';
import ReporteDetailModal from './Components/modals/ReporteDetailModal';
import ConfirmModal       from './Components/modals/ConfirmModal';

export default function InventarioIndex({ auth }) {
    const inv = useInventarioData(auth);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full px-12 py-4 space-y-6">

                {/* Header */}
                <PageHeader
                    title="INVENTARIO DE MATERIALES"
                    subtitle="Control de stock, ubicación ZNP y reportes"
                    icon={<ArchiveBoxIcon className="size-7" />}
                />

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="-mb-px flex gap-1" role="tablist">
                        <button
                            role="tab" aria-selected={inv.currentTab === 'inventario'}
                            onClick={() => inv.setCurrentTab('inventario')}
                            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                inv.currentTab === 'inventario' ? 'border-primary text-primary' : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ClipboardDocumentListIcon className="size-4" /> Inventario
                        </button>
                        <button
                            role="tab" aria-selected={inv.currentTab === 'reportes'}
                            onClick={() => inv.setCurrentTab('reportes')}
                            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                inv.currentTab === 'reportes' ? 'border-red-500 text-red-600' : 'border-transparent text-gray-600 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ExclamationTriangleIcon className="size-4" /> Reportes
                            {inv.pendingReportesCount > 0 && (
                                <span className="inline-flex items-center justify-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">{inv.pendingReportesCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Inventario Tab */}
                {inv.currentTab === 'inventario' && (
                    <div className="space-y-6">
                        <FilterBar
                            searchQuery={inv.searchQuery}  onSearchChange={inv.setSearchQuery}
                            filterCategory={inv.filterCategory}  onCategoryChange={inv.setFilterCategory}
                            filterStatus={inv.filterStatus}  onStatusChange={inv.setFilterStatus}
                            onAddClick={() => inv.openModal()}
                        />
                        <InventarioTable
                            filteredItems={inv.filteredItems}
                            openReportModal={inv.openReportModal}  verifyProduct={inv.verifyProduct}
                            openModal={inv.openModal}  deleteProduct={inv.deleteProduct}
                        />
                    </div>
                )}

                {/* Reportes Tab */}
                {inv.currentTab === 'reportes' && (
                    <ReportesTab
                        reportes={inv.reportes}  filteredReportes={inv.filteredReportes}
                        filterReporteEstado={inv.filterReporteEstado}
                        setFilterReporteEstado={inv.setFilterReporteEstado}
                        openReporteDetail={inv.openReporteDetail}
                    />
                )}
            </div>

            {/* Modals */}
            {inv.showModal && <MaterialModal form={inv.form} updateForm={inv.updateForm} computedLocationCode={inv.computedLocationCode} isEditing={inv.isEditing} saveMaterial={inv.saveMaterial} closeModal={inv.closeModal} />}
            {inv.showLocationModal && <LocationModal selectedReservedItem={inv.selectedReservedItem} locationForm={inv.locationForm} updateLocationForm={inv.updateLocationForm} computedReservedLocationCode={inv.computedReservedLocationCode} saveLocation={inv.saveLocation} closeLocationModal={inv.closeLocationModal} />}
            {inv.showVerifyModal && <VerifyModal verifyingProduct={inv.verifyingProduct} currentUserName={inv.currentUserName} confirmVerify={inv.confirmVerify} closeVerifyModal={inv.closeVerifyModal} />}
            {inv.showReportModal && <ReportModal reportingProduct={inv.reportingProduct} reportMotivo={inv.reportMotivo} setReportMotivo={inv.setReportMotivo} confirmReport={inv.confirmReport} closeReportModal={inv.closeReportModal} />}
            {inv.showReporteDetailModal && <ReporteDetailModal selectedReporte={inv.selectedReporte} solucionReporte={inv.solucionReporte} setSolucionReporte={inv.setSolucionReporte} cambiarEstadoReporte={inv.cambiarEstadoReporte} eliminarReporte={inv.eliminarReporte} closeReporteDetail={inv.closeReporteDetail} />}

            <ConfirmModal
                open={inv.showDeleteModal}
                onClose={inv.cancelDeleteProduct}
                title="Eliminar material"
                message={`¿Estás seguro de eliminar "${inv.pendingDeleteItem?.material_type || inv.pendingDeleteItem?.nombre || ''}"? Esta acción no se puede deshacer.`}
                actionLabel="Eliminar"
                actionVariant="danger"
                onConfirm={inv.confirmDeleteProduct}
            />
            <ConfirmModal
                open={inv.showDeleteReporteModal}
                onClose={inv.cancelEliminarReporte}
                title="Eliminar reporte"
                message={`¿Está seguro de que desea eliminar el reporte de "${inv.selectedReporte?.producto_nombre || ''}"? Esta acción no se puede deshacer.`}
                actionLabel="Eliminar"
                actionVariant="danger"
                onConfirm={inv.confirmEliminarReporte}
            />
        </div>
    );
}
