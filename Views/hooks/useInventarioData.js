import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { POLLING_INTERVAL_MS, INITIAL_FORM, INITIAL_LOCATION_FORM } from '../utils/constants';
import { fetchJson, loadFromCache, saveToCache, arraysEqual, formatDate } from '../utils/helpers';

/**
 * Custom hook encapsulating ALL inventory business logic.
 * Manages state, data fetching, polling, CRUD, and computed values.
 * Per rerender-move-effect-to-event — minimal effects, logic in callbacks.
 */
export function useInventarioData(auth) {
    // ========== STATE ==========
    const [products, setProducts] = useState(() => loadFromCache('products') || []);
    const [reservedItems, setReservedItems] = useState(() => loadFromCache('reservedItems') || []);
    const [reportes, setReportes] = useState([]);
    const [currentTab, setCurrentTab] = useState('inventario');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterReporteEstado, setFilterReporteEstado] = useState('');
    const [openMenuId, setOpenMenuId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showLocationModal, setShowLocationModal] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showReporteDetailModal, setShowReporteDetailModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedReservedItem, setSelectedReservedItem] = useState(null);
    const [verifyingProduct, setVerifyingProduct] = useState(null);
    const [reportingProduct, setReportingProduct] = useState(null);
    const [reportMotivo, setReportMotivo] = useState('');
    const [selectedReporte, setSelectedReporte] = useState(null);
    const [solucionReporte, setSolucionReporte] = useState('');
    const [form, setForm] = useState(INITIAL_FORM);
    const [locationForm, setLocationForm] = useState(INITIAL_LOCATION_FORM);

    // Refs for polling and stable references (per rerender-use-ref-transient-values)
    const pollingRef = useRef(null);
    const productsRef = useRef(products);
    const reservedRef = useRef(reservedItems);
    productsRef.current = products;
    reservedRef.current = reservedItems;

    const currentUserName = useMemo(() => auth?.user?.name || 'Usuario', [auth]);

    // ========== FORM HELPERS (per rerender-functional-setstate) ==========
    const updateForm = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const updateLocationForm = useCallback((field, value) => {
        setLocationForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    // ========== COMPUTED / MEMOIZED VALUES ==========
    const filteredItems = useMemo(() => {
        const allItems = [...products, ...reservedItems];
        const q = searchQuery.toLowerCase();
        return allItems.filter((item) => {
            const matchSearch = !q || item.nombre.toLowerCase().includes(q) || item.sku.toLowerCase().includes(q);
            const matchCat = !filterCategory || item.categoria === filterCategory;
            const matchStatus = !filterStatus || item.estado === filterStatus;
            return matchSearch && matchCat && matchStatus;
        });
    }, [products, reservedItems, searchQuery, filterCategory, filterStatus]);

    const computedLocationCode = useMemo(
        () => `${form.zona}-${form.nivel}-${form.posicion}`,
        [form.zona, form.nivel, form.posicion],
    );

    const computedReservedLocationCode = useMemo(
        () => `${locationForm.zona}-${locationForm.nivel}-${locationForm.posicion}`,
        [locationForm.zona, locationForm.nivel, locationForm.posicion],
    );

    const filteredReportes = useMemo(() => {
        if (!filterReporteEstado) return reportes;
        return reportes.filter((r) => r.estado === filterReporteEstado);
    }, [reportes, filterReporteEstado]);

    const pendingReportesCount = useMemo(
        () => reportes.filter((r) => r.estado === 'pendiente').length,
        [reportes],
    );

    // ========== DATA FETCHING (per async-parallel) ==========
    const fetchProducts = useCallback(async () => {
        try {
            const data = await fetchJson('/api/inventario_krsft/list');
            if (data.success) {
                const newProducts = data.products || [];
                if (!arraysEqual(productsRef.current, newProducts)) {
                    setProducts(newProducts);
                    saveToCache('products', newProducts);
                }
            }
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, []);

    const fetchReservedItems = useCallback(async () => {
        try {
            const data = await fetchJson('/api/inventario_krsft/reserved-items');
            if (data.success) {
                const newItems = data.reserved_items || [];
                if (!arraysEqual(reservedRef.current, newItems)) {
                    setReservedItems(newItems);
                    saveToCache('reservedItems', newItems);
                }
            }
        } catch (error) {
            console.error('Error fetching reserved items:', error);
        }
    }, []);

    const fetchReportes = useCallback(async () => {
        try {
            const data = await fetchJson('/api/inventario_krsft/reportes');
            if (data.success) {
                setReportes(data.reportes || []);
            }
        } catch (error) {
            console.error('Error fetching reportes:', error);
        }
    }, []);

    const fetchAll = useCallback(() => {
        Promise.all([fetchProducts(), fetchReservedItems(), fetchReportes()]);
    }, [fetchProducts, fetchReservedItems, fetchReportes]);

    // ========== NAVIGATION ==========
    const goBack = useCallback(() => {
        window.location.href = '/';
    }, []);

    // ========== MODAL: Material ==========
    const openModal = useCallback((item = null) => {
        setIsEditing(!!item);
        if (item) {
            const parts = item.ubicacion ? item.ubicacion.split('-') : ['A', '1', '1'];
            setForm({
                id: item.id,
                nombre: item.nombre,
                categoria: item.categoria,
                unidad: item.unidad,
                cantidad: item.cantidad,
                zona: parts[0] || 'A',
                nivel: parseInt(parts[1]) || 1,
                posicion: parseInt(parts[2]) || 1,
            });
        } else {
            setForm(INITIAL_FORM);
        }
        setShowModal(true);
    }, []);

    const closeModal = useCallback(() => setShowModal(false), []);

    // ========== MODAL: Location ==========
    const openLocationModal = useCallback((item) => {
        setSelectedReservedItem(item);
        setLocationForm(INITIAL_LOCATION_FORM);
        setShowLocationModal(true);
    }, []);

    const closeLocationModal = useCallback(() => {
        setShowLocationModal(false);
        setSelectedReservedItem(null);
    }, []);

    // ========== CRUD: Save Material ==========
    const saveMaterial = useCallback(async (e) => {
        e.preventDefault();
        if (!form.nombre || !form.categoria || !form.unidad) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }
        try {
            const ubicacion = `${form.zona}-${form.nivel}-${form.posicion}`;
            const url = isEditing ? `/api/inventario_krsft/${form.id}` : '/api/inventario_krsft/create';
            const method = isEditing ? 'PUT' : 'POST';

            const data = await fetchJson(url, {
                method,
                body: JSON.stringify({
                    nombre: form.nombre,
                    descripcion: form.nombre,
                    sku: `SKU-${Date.now()}`,
                    categoria: form.categoria,
                    unidad: form.unidad,
                    cantidad: form.cantidad,
                    precio: 0,
                    moneda: 'PEN',
                    estado: 'activo',
                    ubicacion,
                }),
            });

            if (data.success) {
                alert(`✓ Material ${isEditing ? 'actualizado' : 'creado'} correctamente`);
                closeModal();
                fetchProducts();
            } else {
                alert(`❌ Error: ${data.message || 'No se pudo guardar'}`);
            }
        } catch (error) {
            console.error('Error al guardar material:', error);
            alert('Error al guardar el material');
        }
    }, [form, isEditing, closeModal, fetchProducts]);

    // ========== CRUD: Delete Product ==========
    const deleteProduct = useCallback(async (item) => {
        if (!confirm(`¿Estás seguro de eliminar "${item.nombre}"?`)) return;
        try {
            const data = await fetchJson(`/api/inventario_krsft/${item.id}`, { method: 'DELETE' });
            if (data.success) {
                alert('✓ Producto eliminado correctamente');
                fetchProducts();
                fetchReservedItems();
            } else {
                alert(`❌ Error: ${data.message || 'No se pudo eliminar'}`);
            }
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            alert('Error al eliminar el producto');
        }
    }, [fetchProducts, fetchReservedItems]);

    // ========== CRUD: Save Location ==========
    const saveLocation = useCallback(async (e) => {
        e.preventDefault();
        if (!selectedReservedItem) {
            alert('Error: No hay item seleccionado');
            return;
        }
        try {
            const data = await fetchJson('/api/inventario_krsft/assign-location', {
                method: 'POST',
                body: JSON.stringify({
                    product_id: selectedReservedItem.id,
                    zona: locationForm.zona,
                    nivel: locationForm.nivel,
                    posicion: locationForm.posicion,
                }),
            });
            if (data.success) {
                alert(`✓ Ubicación ${data.location} asignada correctamente`);
                closeLocationModal();
                fetchReservedItems();
            } else {
                alert(`❌ ${data.message}`);
            }
        } catch (error) {
            console.error('Error al asignar ubicación:', error);
            alert('Error al asignar ubicación');
        }
    }, [selectedReservedItem, locationForm, closeLocationModal, fetchReservedItems]);

    // ========== VERIFICATION ==========
    const verifyProduct = useCallback((item) => {
        setVerifyingProduct(item);
        setShowVerifyModal(true);
    }, []);

    const closeVerifyModal = useCallback(() => {
        setShowVerifyModal(false);
        setVerifyingProduct(null);
    }, []);

    const confirmVerify = useCallback(async () => {
        if (!verifyingProduct) return;
        try {
            const data = await fetchJson(`/api/inventario_krsft/verify/${verifyingProduct.id}`, {
                method: 'POST',
                body: JSON.stringify({ usuario: currentUserName }),
            });
            if (data.success) {
                closeVerifyModal();
                fetchProducts();
                fetchReservedItems();
            } else {
                alert(`❌ Error: ${data.message || 'No se pudo verificar'}`);
            }
        } catch (error) {
            console.error('Error al verificar producto:', error);
            alert('Error al verificar el producto');
        }
    }, [verifyingProduct, currentUserName, closeVerifyModal, fetchProducts, fetchReservedItems]);

    // ========== REPORTS ==========
    const openReportModal = useCallback((item) => {
        setReportingProduct(item);
        setReportMotivo('');
        setShowReportModal(true);
    }, []);

    const closeReportModal = useCallback(() => {
        setShowReportModal(false);
        setReportingProduct(null);
        setReportMotivo('');
    }, []);

    const confirmReport = useCallback(async (e) => {
        e.preventDefault();
        if (!reportingProduct || !reportMotivo.trim()) {
            alert('Por favor describe el motivo del reporte');
            return;
        }
        try {
            const data = await fetchJson('/api/inventario_krsft/reportes', {
                method: 'POST',
                body: JSON.stringify({
                    producto_id: reportingProduct.id,
                    motivo: reportMotivo,
                    reportado_por: currentUserName,
                }),
            });
            if (data.success) {
                closeReportModal();
                fetchReportes();
                setCurrentTab('reportes');
            } else {
                alert(`❌ Error: ${data.message || 'No se pudo crear el reporte'}`);
            }
        } catch (error) {
            console.error('Error al crear reporte:', error);
            alert('Error al crear el reporte');
        }
    }, [reportingProduct, reportMotivo, currentUserName, closeReportModal, fetchReportes]);

    // ========== REPORT DETAIL ==========
    const openReporteDetail = useCallback((reporte) => {
        setSelectedReporte(reporte);
        setSolucionReporte(reporte.solucion || '');
        setShowReporteDetailModal(true);
    }, []);

    const closeReporteDetail = useCallback(() => {
        setShowReporteDetailModal(false);
        setSelectedReporte(null);
        setSolucionReporte('');
    }, []);

    const cambiarEstadoReporte = useCallback(async (nuevoEstado) => {
        if (!selectedReporte) return;
        if (nuevoEstado === 'resuelto' && !solucionReporte.trim() && !selectedReporte.solucion) {
            alert('⚠️ Por favor, describe la solución antes de marcar como resuelto');
            return;
        }
        try {
            const body = { estado: nuevoEstado };
            if (nuevoEstado === 'revisado') body.revisado_por = currentUserName;
            else if (nuevoEstado === 'resuelto') {
                body.solucion = solucionReporte.trim() || selectedReporte.solucion;
                body.resuelto_por = currentUserName;
            }

            const data = await fetchJson(`/api/inventario_krsft/reportes/${selectedReporte.id}`, {
                method: 'PUT',
                body: JSON.stringify(body),
            });
            if (data.success) {
                fetchReportes();
                closeReporteDetail();
            } else {
                alert(`❌ Error: ${data.message || 'No se pudo actualizar'}`);
            }
        } catch (error) {
            console.error('Error al cambiar estado del reporte:', error);
            alert('Error al actualizar el reporte');
        }
    }, [selectedReporte, solucionReporte, currentUserName, fetchReportes, closeReporteDetail]);

    const eliminarReporte = useCallback(async () => {
        if (!selectedReporte) return;
        if (!confirm(`¿Está seguro de que desea eliminar el reporte de "${selectedReporte.producto_nombre}"? Esta acción no se puede deshacer.`)) return;
        try {
            const data = await fetchJson(`/api/inventario_krsft/reportes/${selectedReporte.id}`, { method: 'DELETE' });
            if (data.success) {
                alert('✓ Reporte eliminado correctamente');
                fetchReportes();
                closeReporteDetail();
            } else {
                alert(`❌ Error: ${data.message || 'No se pudo eliminar'}`);
            }
        } catch (error) {
            console.error('Error al eliminar el reporte:', error);
            alert('Error al eliminar el reporte');
        }
    }, [selectedReporte, fetchReportes, closeReporteDetail]);

    // ========== EFFECTS ==========
    // Fetch data + polling (per rerender-move-effect-to-event — minimal effect)
    useEffect(() => {
        fetchAll();
        pollingRef.current = setInterval(fetchAll, POLLING_INTERVAL_MS);
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [fetchAll]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (!e.target.closest('.action-menu-wrapper')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // ========== RETURN ==========
    return {
        // State
        products, reservedItems, reportes,
        currentTab, setCurrentTab,
        searchQuery, setSearchQuery,
        filterCategory, setFilterCategory,
        filterStatus, setFilterStatus,
        filterReporteEstado, setFilterReporteEstado,
        openMenuId, setOpenMenuId,
        showModal, showLocationModal, showVerifyModal, showReportModal, showReporteDetailModal,
        isEditing, selectedReservedItem, verifyingProduct, reportingProduct,
        reportMotivo, setReportMotivo,
        selectedReporte, solucionReporte, setSolucionReporte,
        form, locationForm, currentUserName,

        // Computed
        filteredItems, computedLocationCode, computedReservedLocationCode,
        filteredReportes, pendingReportesCount,

        // Form helpers
        updateForm, updateLocationForm,

        // Actions
        goBack, openModal, closeModal, openLocationModal, closeLocationModal,
        saveMaterial, deleteProduct, saveLocation,
        verifyProduct, closeVerifyModal, confirmVerify,
        openReportModal, closeReportModal, confirmReport,
        openReporteDetail, closeReporteDetail, cambiarEstadoReporte, eliminarReporte,
    };
}
