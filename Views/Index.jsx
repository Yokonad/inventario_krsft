import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import './inventario_theme.css';
import './inventario.css';

// ============= CONSTANTS (hoisted per rerender-memo-with-default-value) =============
const POLLING_INTERVAL_MS = 3000;
const CACHE_PREFIX = 'inventario_cache_';
const CATEGORIES = ['Electrónica', 'Químicos', 'Mobiliario', 'EPP', 'Accesorios', 'Herramientas', 'Otros'];
const ZONES = ['A', 'B', 'C', 'D', 'E'];
const LEVELS = [1, 2, 3, 4];
const POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8];

const PROJECT_COLORS = [
    '#0AA4A4', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#ef4444', '#06b6d4', '#6366f1', '#84cc16',
];

const INITIAL_FORM = {
    id: null, nombre: '', categoria: '', unidad: '', cantidad: 1,
    zona: 'A', nivel: 1, posicion: 1,
};

const INITIAL_LOCATION_FORM = { zona: 'A', nivel: 1, posicion: 1 };

// ============= CACHE HELPERS (hoisted per js-cache-function-results) =============
const saveToCache = (key, data) => {
    try {
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
    } catch (e) { console.warn('Cache save error:', e); }
};

const loadFromCache = (key) => {
    try {
        const cached = localStorage.getItem(CACHE_PREFIX + key);
        if (cached) return JSON.parse(cached).data;
    } catch (e) { console.warn('Cache load error:', e); }
    return null;
};

const arraysEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ============= UTILITY HELPERS (hoisted per js-early-exit) =============
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

const getProjectPillStyle = (item) => {
    if (!item) return {};
    const projectId = item.project_id ?? item.proyecto_id ?? item.id_proyecto ?? null;
    let color = null;

    if (typeof projectId === 'number') {
        color = PROJECT_COLORS[projectId % PROJECT_COLORS.length];
    }

    if (!color && item.nombre_proyecto) {
        let hash = 0;
        const name = item.nombre_proyecto;
        for (let i = 0; i < name.length; i += 1) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        color = PROJECT_COLORS[Math.abs(hash) % PROJECT_COLORS.length];
    }

    return color ? { backgroundColor: color, color: '#ffffff' } : {};
};

const getCsrfToken = () => document.querySelector('meta[name="csrf-token"]')?.content || '';

const fetchJson = async (url, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-TOKEN': getCsrfToken(),
        ...options.headers,
    };
    const res = await fetch(url, { ...options, headers });
    return res.json();
};

// ============= SVG ICONS (hoisted per rendering-hoist-jsx) =============
const BackIcon = (
    <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" strokeWidth="2">
        <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const BoxIcon = (
    <svg className="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

const SunIcon = (
    <svg className="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
);

const MoonIcon = (
    <svg className="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const PlusIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const SearchIcon = (
    <svg className="filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const WarningTriangleIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
);

const DotsIcon = (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
    </svg>
);

const CheckBoxIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
);

const EditIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const TrashIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const TrashDetailIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
    </svg>
);

const PinIcon = (
    <svg className="icon icon-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s6-4 6-10a6 6 0 0 0-12 0c0 6 6 10 6 10z" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const PinLargeIcon = (
    <svg className="icon icon-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
    </svg>
);

const UserIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const CheckIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const FileIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const EyeIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const DocLinesIcon = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
);

const BoxSmallIcon = (
    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

const EmptyCircleIcon = (
    <svg style={{ width: 48, height: 48, margin: '0 auto 12px', display: 'block', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

// ============= MAIN COMPONENT =============
export default function InventarioIndex({ auth }) {
    // ---------- STATE ----------
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

    // ---------- FORM HELPERS (per rerender-functional-setstate) ----------
    const updateForm = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const updateLocationForm = useCallback((field, value) => {
        setLocationForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    // ---------- COMPUTED / MEMOIZED VALUES ----------
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

    // ---------- DATA FETCHING (per async-parallel — parallel independent fetches) ----------
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
        // Fire all fetches in parallel (per async-parallel)
        Promise.all([fetchProducts(), fetchReservedItems(), fetchReportes()]);
    }, [fetchProducts, fetchReservedItems, fetchReportes]);

    // ---------- DARK MODE ----------
    const applyDarkMode = useCallback((enabled) => {
        document.body.classList.toggle('dark-mode', enabled);
    }, []);

    const toggleDarkMode = useCallback(() => {
        const isDark = document.body.classList.contains('dark-mode');
        const next = !isDark;
        applyDarkMode(next);
        localStorage.setItem('darkMode', String(next));
    }, [applyDarkMode]);

    // ---------- ACTIONS ----------
    const goBack = useCallback(() => {
        window.location.href = '/';
    }, []);

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

    const openLocationModal = useCallback((item) => {
        setSelectedReservedItem(item);
        setLocationForm(INITIAL_LOCATION_FORM);
        setShowLocationModal(true);
    }, []);

    const closeLocationModal = useCallback(() => {
        setShowLocationModal(false);
        setSelectedReservedItem(null);
    }, []);

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

    // Verification
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

    // Reports
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

    // Report detail
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

    // ---------- EFFECTS ----------
    // Dark mode init + storage listener
    useEffect(() => {
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode === 'true' || document.body.classList.contains('dark-mode')) {
            applyDarkMode(true);
        }

        const handleStorage = (event) => {
            if (event.key === 'darkMode') {
                applyDarkMode(event.newValue === 'true');
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [applyDarkMode]);

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

    // ---------- RENDER ----------
    return (
        <div className="inventario-layout">
            <div className="inventario-bg" />

            <div className="inventario-container">
                {/* ====== HEADER ====== */}
                <header className="module-header">
                    <div className="header-left">
                        <button onClick={goBack} className="btn-primary btn-back">
                            {BackIcon}
                            Volver
                        </button>
                        <h1>
                            {BoxIcon}
                            INVENTARIO DE MATERIALES
                        </h1>
                    </div>
                    <div className="header-right">
                        <button onClick={toggleDarkMode} className="theme-toggle" title="Cambiar tema">
                            {SunIcon}
                            {MoonIcon}
                        </button>
                        <button className="btn-primary" onClick={() => openModal()}>
                            {PlusIcon}
                            Nuevo Material
                        </button>
                    </div>
                </header>

                {/* ====== MAIN CONTENT ====== */}
                <main className="module-content">
                    {/* Tabs */}
                    <div className="tabs-nav">
                        <button
                            onClick={() => setCurrentTab('inventario')}
                            className={`tab-btn${currentTab === 'inventario' ? ' is-active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                            </svg>
                            Inventario
                            <span className="tab-badge">{filteredItems.length}</span>
                        </button>
                        <button
                            onClick={() => setCurrentTab('reportes')}
                            className={`tab-btn${currentTab === 'reportes' ? ' is-active' : ''}`}
                        >
                            {WarningTriangleIcon}
                            Reportes
                            {pendingReportesCount > 0 && (
                                <span className="tab-badge tab-badge--alert">{pendingReportesCount}</span>
                            )}
                        </button>
                    </div>

                    {/* ====== TAB: INVENTARIO ====== */}
                    <div className="tab-content" style={{ display: currentTab === 'inventario' ? 'block' : 'none' }}>
                        {/* Filter Bar */}
                        <div className="filter-bar">
                            <div className="filter-field filter-field--search">
                                <label className="filter-label">BUSCAR</label>
                                <div className="filter-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Buscar por nombre..."
                                        className="filter-input"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {SearchIcon}
                                </div>
                            </div>
                            <div className="filter-field">
                                <label className="filter-label">CATEGORÍA</label>
                                <select className="filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                                    <option value="">Todas</option>
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="filter-field">
                                <label className="filter-label">ESTADO</label>
                                <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="activo">Activo</option>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="rechazado">Rechazado</option>
                                </select>
                            </div>
                        </div>

                        {/* Inventory Table */}
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
                                                        <svg className="icon icon-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                            <line x1="12" y1="9" x2="12" y2="13" />
                                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                                        </svg>
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
                                                                    <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                                        <line x1="12" y1="9" x2="12" y2="13" />
                                                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                                                    </svg>
                                                                    <span>Reportar Problema</span>
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => { verifyProduct(item); setOpenMenuId(null); }}
                                                                className="dropdown-item dropdown-item--verify"
                                                            >
                                                                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                    <path d="M9 11l3 3L22 4" />
                                                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                                                </svg>
                                                                <span>Verificar</span>
                                                            </button>
                                                            <button
                                                                onClick={() => { openModal(item); setOpenMenuId(null); }}
                                                                className="dropdown-item dropdown-item--edit"
                                                            >
                                                                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                </svg>
                                                                <span>Editar</span>
                                                            </button>
                                                            <button
                                                                onClick={() => { deleteProduct(item); setOpenMenuId(null); }}
                                                                className="dropdown-item dropdown-item--delete"
                                                            >
                                                                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                    <polyline points="3 6 5 6 21 6" />
                                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2" />
                                                                </svg>
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
                    </div>

                    {/* ====== TAB: REPORTES ====== */}
                    <div className="tab-content" style={{ display: currentTab === 'reportes' ? 'block' : 'none' }}>
                        <div className="table-card">
                            <div className="reportes-header">
                                <h3 className="reportes-title">
                                    {DocLinesIcon}
                                    Reportes de Materiales
                                </h3>
                                <div className="reportes-filters">
                                    <button
                                        onClick={() => setFilterReporteEstado('')}
                                        className={`filter-estado-btn${filterReporteEstado === '' ? ' is-active' : ''}`}
                                    >
                                        Todos
                                        <span className="filter-badge">{reportes.length}</span>
                                    </button>
                                    <button
                                        onClick={() => setFilterReporteEstado('pendiente')}
                                        className={`filter-estado-btn filter-estado-btn--pending${filterReporteEstado === 'pendiente' ? ' is-active' : ''}`}
                                    >
                                        Pendientes
                                        <span className="filter-badge">{reportes.filter((r) => r.estado === 'pendiente').length}</span>
                                    </button>
                                    <button
                                        onClick={() => setFilterReporteEstado('revisado')}
                                        className={`filter-estado-btn filter-estado-btn--reviewed${filterReporteEstado === 'revisado' ? ' is-active' : ''}`}
                                    >
                                        Revisados
                                        <span className="filter-badge">{reportes.filter((r) => r.estado === 'revisado').length}</span>
                                    </button>
                                    <button
                                        onClick={() => setFilterReporteEstado('resuelto')}
                                        className={`filter-estado-btn filter-estado-btn--resolved${filterReporteEstado === 'resuelto' ? ' is-active' : ''}`}
                                    >
                                        Resueltos
                                        <span className="filter-badge">{reportes.filter((r) => r.estado === 'resuelto').length}</span>
                                    </button>
                                </div>
                            </div>

                            <table className="inventory-table">
                                <thead className="table-head">
                                    <tr>
                                        <th className="table-head-cell">Producto</th>
                                        <th className="table-head-cell">Proyecto</th>
                                        <th className="table-head-cell">Motivo</th>
                                        <th className="table-head-cell">Reportado por</th>
                                        <th className="table-head-cell">Fecha</th>
                                        <th className="table-head-cell is-center">Estado</th>
                                        <th className="table-head-cell is-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReportes.map((reporte) => (
                                        <tr key={reporte.id} className="table-row table-row--clickable" onClick={() => openReporteDetail(reporte)}>
                                            <td className="table-cell">
                                                <div className="product-name">{reporte.producto_nombre}</div>
                                                <div className="product-sku">{reporte.producto_sku}</div>
                                            </td>
                                            <td className="table-cell">
                                                <span className="project-badge">{reporte.proyecto_nombre}</span>
                                            </td>
                                            <td className="table-cell">
                                                <div className="reporte-motivo">{reporte.motivo}</div>
                                            </td>
                                            <td className="table-cell">{reporte.reportado_por}</td>
                                            <td className="table-cell">
                                                <div className="reporte-date">{formatDate(reporte.created_at)}</div>
                                            </td>
                                            <td className="table-cell is-center">
                                                <span
                                                    className={`status-badge${reporte.estado === 'pendiente' ? ' pending' : reporte.estado === 'revisado' ? ' reviewed' : ' approved'}`}
                                                >
                                                    {reporte.estado === 'pendiente' ? 'Pendiente' : reporte.estado === 'revisado' ? 'Revisado' : 'Resuelto'}
                                                </span>
                                            </td>
                                            <td className="table-cell is-center" onClick={(e) => e.stopPropagation()}>
                                                <div className="action-buttons">
                                                    <button onClick={() => openReporteDetail(reporte)} title="Ver detalles" className="action-btn action-btn--view">
                                                        {EyeIcon}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredReportes.length === 0 && (
                                        <tr>
                                            <td colSpan="7" className="table-cell is-center" style={{ padding: 40, color: 'var(--inventario-text-gray)' }}>
                                                {EmptyCircleIcon}
                                                No hay reportes {filterReporteEstado ? `con estado "${filterReporteEstado}"` : 'registrados'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* ====== MODALS (via createPortal per bundle-dynamic-imports pattern) ====== */}

            {/* Modal: New/Edit Material */}
            {showModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-card">
                        <div className="modal-header">
                            <div className="modal-header-text">
                                <h2 className="modal-title">NUEVO MATERIAL</h2>
                                <p className="modal-subtitle">Registra un nuevo material para control de stock y ubicación ZNP.</p>
                            </div>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={saveMaterial}>
                                <h3 className="section-title">Información General</h3>
                                <div className="form-group">
                                    <label className="form-label">Nombre del Material</label>
                                    <input value={form.nombre} onChange={(e) => updateForm('nombre', e.target.value)} type="text" className="input-field" placeholder="Ej: Laptop HP Pavilion" required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Categoría</label>
                                        <select value={form.categoria} onChange={(e) => updateForm('categoria', e.target.value)} className="input-field" required>
                                            <option value="">Seleccionar...</option>
                                            {CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Unidad</label>
                                        <input value={form.unidad} onChange={(e) => updateForm('unidad', e.target.value)} type="text" className="input-field" placeholder="Ej: UND, KG, M, LT" required />
                                    </div>
                                </div>
                                <div className="form-group form-group--spaced">
                                    <label className="form-label">Cantidad</label>
                                    <input value={form.cantidad} onChange={(e) => updateForm('cantidad', Number(e.target.value))} type="number" min="0" className="input-field" required />
                                </div>

                                <h3 className="section-title section-title--border">Ubicación (Sistema ZNP)</h3>
                                <div className="znp-box">
                                    <div className="form-row form-row--compact">
                                        <div className="form-group">
                                            <label className="form-label form-label--small">Zona</label>
                                            <select value={form.zona} onChange={(e) => updateForm('zona', e.target.value)} className="input-field input-field--compact">
                                                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label form-label--small">Nivel</label>
                                            <select value={form.nivel} onChange={(e) => updateForm('nivel', Number(e.target.value))} className="input-field input-field--compact">
                                                {LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label form-label--small">Posición</label>
                                            <select value={form.posicion} onChange={(e) => updateForm('posicion', Number(e.target.value))} className="input-field input-field--compact">
                                                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="location-preview">
                                        <div className="location-label">CÓDIGO DE UBICACIÓN</div>
                                        <div className="location-code location-code--large">{computedLocationCode}</div>
                                    </div>
                                </div>

                                <div className="modal-actions">
                                    <button type="button" onClick={closeModal} className="btn-secondary is-danger">Cancelar</button>
                                    <button type="submit" className="btn-primary">Guardar Material</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {/* Modal: Assign Location */}
            {showLocationModal && createPortal(
                <div className="modal-overlay">
                    <div className="modal-card modal-card--compact">
                        <div className="modal-header modal-header--warning">
                            <h2 className="modal-title modal-title--warning">
                                {PinLargeIcon}
                                Asignar Ubicación ZNP
                            </h2>
                        </div>
                        <div className="modal-body">
                            <div className="material-card">
                                <div className="material-label">
                                    {BoxSmallIcon}
                                    Material
                                </div>
                                <div className="material-name">{selectedReservedItem?.nombre}</div>
                                <div className="material-project">Proyecto: <span>{selectedReservedItem?.nombre_proyecto}</span></div>
                            </div>
                            <form onSubmit={saveLocation}>
                                <h3 className="section-title">Código de Ubicación (Sistema ZNP)</h3>
                                <div className="znp-box znp-box--spaced">
                                    <div className="form-row form-row--compact">
                                        <div className="form-group">
                                            <label className="form-label form-label--small">Zona (A-E)</label>
                                            <select value={locationForm.zona} onChange={(e) => updateLocationForm('zona', e.target.value)} className="input-field input-field--compact" required>
                                                <option value="">Seleccionar...</option>
                                                {ZONES.map((z) => <option key={z} value={z}>{z}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label form-label--small">Nivel (1-4)</label>
                                            <select value={locationForm.nivel} onChange={(e) => updateLocationForm('nivel', Number(e.target.value))} className="input-field input-field--compact" required>
                                                <option value="">Seleccionar...</option>
                                                {LEVELS.map((n) => <option key={n} value={n}>{n}</option>)}
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label form-label--small">Posición (1-8)</label>
                                            <select value={locationForm.posicion} onChange={(e) => updateLocationForm('posicion', Number(e.target.value))} className="input-field input-field--compact" required>
                                                <option value="">Seleccionar...</option>
                                                {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="location-final">
                                        <div className="location-label location-label--warning">Código Final</div>
                                        <div className="location-code location-code--xlarge">{computedReservedLocationCode}</div>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={closeLocationModal} className="btn-secondary is-danger">Cancelar</button>
                                    <button type="submit" className="btn-warning">
                                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 22s6-4 6-10a6 6 0 0 0-12 0c0 6 6 10 6 10z" />
                                            <circle cx="12" cy="12" r="2" />
                                        </svg>
                                        Guardar Ubicación
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {/* Modal: Verify */}
            {showVerifyModal && createPortal(
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeVerifyModal(); }}>
                    <div className="modal-verify">
                        <div className="modal-verify-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 11l3 3L22 4" />
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                            </svg>
                        </div>
                        <h3 className="modal-verify-title">Verificar Material</h3>
                        <p className="modal-verify-text">¿Confirmas la verificación de:</p>
                        <div className="modal-verify-product">{verifyingProduct?.nombre}</div>
                        <div className="modal-verify-user">
                            {UserIcon}
                            <span>{currentUserName}</span>
                        </div>
                        <div className="modal-verify-actions">
                            <button type="button" onClick={closeVerifyModal} className="btn-verify-cancel">Cancelar</button>
                            <button type="button" onClick={confirmVerify} className="btn-verify-confirm">
                                {CheckIcon}
                                Verificar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {/* Modal: Report */}
            {showReportModal && createPortal(
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeReportModal(); }}>
                    <div className="modal-report">
                        <div className="modal-report-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <h3 className="modal-report-title">Reportar Material</h3>
                        <p className="modal-report-subtitle">Material no recibido en obra</p>
                        <div className="modal-report-product">
                            <div className="report-product-name">{reportingProduct?.nombre}</div>
                            <div className="report-product-project">Proyecto: {reportingProduct?.nombre_proyecto}</div>
                        </div>
                        <form onSubmit={confirmReport}>
                            <div className="form-group">
                                <label className="form-label">Motivo del reporte</label>
                                <textarea
                                    value={reportMotivo}
                                    onChange={(e) => setReportMotivo(e.target.value)}
                                    className="textarea-field"
                                    placeholder="Describe el problema (ej: Material no llegó a obra, se necesita verificar si está en inventario o no se compró)"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="modal-report-actions">
                                <button type="button" onClick={closeReportModal} className="btn-report-cancel">Cancelar</button>
                                <button type="submit" className="btn-report-confirm">
                                    {FileIcon}
                                    Enviar Reporte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body,
            )}

            {/* Modal: Report Detail */}
            {showReporteDetailModal && createPortal(
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) closeReporteDetail(); }}>
                    <div className="modal-card modal-card--large">
                        <div className="modal-header">
                            <div className="modal-header-text">
                                <h2 className="modal-title">DETALLE DEL REPORTE</h2>
                                <p className="modal-subtitle">Información completa del problema reportado</p>
                            </div>
                        </div>
                        {selectedReporte && (
                            <div className="modal-body">
                                {/* Product Info */}
                                <div className="detail-section">
                                    <h3 className="section-title">Información del Material</h3>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label className="detail-label">Producto</label>
                                            <div className="detail-value">{selectedReporte.producto_nombre}</div>
                                        </div>
                                        <div className="detail-item">
                                            <label className="detail-label">SKU</label>
                                            <div className="detail-value">{selectedReporte.producto_sku}</div>
                                        </div>
                                        <div className="detail-item">
                                            <label className="detail-label">Proyecto</label>
                                            <div className="detail-value">
                                                <span className="project-badge">{selectedReporte.proyecto_nombre}</span>
                                            </div>
                                        </div>
                                        <div className="detail-item">
                                            <label className="detail-label">Estado Actual</label>
                                            <div className="detail-value">
                                                <span className={`status-badge${selectedReporte.estado === 'pendiente' ? ' pending' : selectedReporte.estado === 'revisado' ? ' reviewed' : ' approved'}`}>
                                                    {selectedReporte.estado === 'pendiente' ? 'Pendiente' : selectedReporte.estado === 'revisado' ? 'Revisado' : 'Resuelto'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Problem */}
                                <div className="detail-section">
                                    <h3 className="section-title">Problema Reportado</h3>
                                    <div className="detail-item">
                                        <label className="detail-label">Motivo</label>
                                        <div className="detail-value detail-value--text">{selectedReporte.motivo}</div>
                                    </div>
                                    <div className="detail-grid">
                                        <div className="detail-item">
                                            <label className="detail-label">Reportado por</label>
                                            <div className="detail-value">{selectedReporte.reportado_por}</div>
                                        </div>
                                        <div className="detail-item">
                                            <label className="detail-label">Fecha de Reporte</label>
                                            <div className="detail-value">{formatDate(selectedReporte.created_at)}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Solution */}
                                <div className="detail-section">
                                    <h3 className="section-title">Solución</h3>
                                    <div className="form-group">
                                        <label className="form-label">
                                            Descripción de la solución
                                            {selectedReporte.estado === 'resuelto' && <span className="label-badge">(Solo lectura)</span>}
                                        </label>
                                        <textarea
                                            value={solucionReporte}
                                            onChange={(e) => setSolucionReporte(e.target.value)}
                                            className="textarea-field"
                                            placeholder="Describe cómo se resolvió el problema o acciones tomadas..."
                                            rows="4"
                                            disabled={selectedReporte.estado === 'resuelto'}
                                        />
                                        {selectedReporte.resuelto_por && (
                                            <div className="solution-meta">
                                                <span>Resuelto por: <strong>{selectedReporte.resuelto_por}</strong></span>
                                                {selectedReporte.resuelto_at && <span> el {formatDate(selectedReporte.resuelto_at)}</span>}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="modal-actions">
                                    <button onClick={closeReporteDetail} className="btn-secondary">Cerrar</button>
                                    <div className="actions-right">
                                        {selectedReporte.estado === 'pendiente' && (
                                            <button onClick={() => cambiarEstadoReporte('revisado')} className="btn-warning">
                                                {EyeIcon}
                                                Marcar como Revisado
                                            </button>
                                        )}
                                        {selectedReporte.estado !== 'resuelto' && (
                                            <button
                                                onClick={() => cambiarEstadoReporte('resuelto')}
                                                className="btn-success"
                                                disabled={!solucionReporte.trim() && !selectedReporte.solucion}
                                            >
                                                {CheckIcon}
                                                Resolver Problema
                                            </button>
                                        )}
                                        <button onClick={eliminarReporte} className="btn-danger" title="Eliminar este reporte">
                                            {TrashDetailIcon}
                                            Eliminar Reporte
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}
