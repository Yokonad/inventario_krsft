// ════════════════════════════════════════════════════════════════
// STYLES CONFIG — MÓDULO INVENTARIO
// Solo documentación — propósito: facilitar debugging y auditoría
// Mapea los valores CSS originales a sus equivalentes Tailwind
// ════════════════════════════════════════════════════════════════

export const STYLE_METADATA = {
    module: 'InventarioKrsft',
    slug: 'inventario_krsft',
    color_primary: '#4A90E2 → blue-500',
    color_secondary: '#9013FE → purple-600',
    description: 'Migración de CSS modular a Tailwind CSS 100%',
    version_migrated: '3.4.0',
    status: 'PRODUCTION',
};

// Referencia de colores originales → Tailwind
export const ORIGINAL_CSS_REFERENCE = {
    // De inventario_theme.css
    '--inventario-primary': { value: 'blue-500', hex: '#4A90E2', usage: 'Color principal del módulo' },
    '--inventario-primary-dark': { value: 'blue-600', hex: '#357ABD', usage: 'Hover de botones primarios' },
    '--inventario-primary-light': { value: 'blue-400', hex: '#5B9FE8', usage: 'Variante clara' },
    '--inventario-secondary': { value: 'purple-600', hex: '#9013FE', usage: 'Color secundario del gradiente' },
    '--inventario-bg-color-1': { value: 'teal-500', hex: '#0AA4A4', usage: 'Fondo animado color 1' },
    '--inventario-bg-color-2': { value: 'blue-600', hex: '#2F6FBF', usage: 'Fondo animado color 2' },
    '--inventario-input-focus': { value: 'blue-500', hex: '#4A90E2', usage: 'Border focus de inputs' },
    '--inventario-input-focus-shadow': { value: 'ring-2 ring-blue-200', hex: 'rgba(74,144,226,0.2)', usage: 'Ring de focus' },
    '--inventario-location-bg': { value: 'blue-50/60', hex: 'rgba(74,144,226,0.1)', usage: 'Fondo de caja ZNP' },
    '--inventario-verification-bg': { value: 'green-50', hex: 'rgba(16,185,129,0.08)', usage: 'Fondo de verificación' },
    '--inventario-badge-success-bg': { value: 'green-100', hex: 'rgba(16,185,129,0.15)', usage: 'Badge éxito fondo' },
    '--inventario-badge-success-text': { value: 'green-600', hex: '#10b981', usage: 'Badge éxito texto' },
    '--inventario-badge-warning-bg': { value: 'yellow-100', hex: 'rgba(245,158,11,0.15)', usage: 'Badge warning fondo' },
    '--inventario-badge-warning-text': { value: 'yellow-600', hex: '#f59e0b', usage: 'Badge warning texto' },
    '--inventario-badge-danger-bg': { value: 'red-100', hex: 'rgba(239,68,68,0.15)', usage: 'Badge danger fondo' },
    '--inventario-badge-danger-text': { value: 'red-500', hex: '#ef4444', usage: 'Badge danger texto' },
    '--inventario-tooltip-bg': { value: 'gray-900', hex: '#1e293b', usage: 'Fondo de tooltip' },
    '--inventario-tooltip-text': { value: 'slate-100', hex: '#f1f5f9', usage: 'Texto de tooltip' },

    // De inventario-base.css
    '.inventario-bg': { value: 'bg-gradient-to-br from-teal-500 to-blue-600', usage: 'Fondo animado del módulo' },
    '.tabs-nav': { value: 'flex gap-3 mb-5 border-b-2 border-gray-200', usage: 'Navegación de tabs' },
    '.tab-btn': { value: 'inline-flex items-center gap-2 px-5 py-3 font-semibold text-gray-500', usage: 'Botón de tab' },
    '.tab-btn.is-active': { value: 'text-blue-500 border-b-blue-500', usage: 'Tab activo' },
    '.btn-primary': { value: 'inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white font-semibold rounded-lg', usage: 'Botón primario' },

    // De inventario-table.css
    '.filter-bar': { value: 'flex flex-wrap items-center gap-4 p-4 mb-5 bg-gray-50 rounded-xl border border-gray-200', usage: 'Barra de filtros' },
    '.table-card': { value: 'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden', usage: 'Card contenedor de tabla' },
    '.inventory-table': { value: 'w-full border-collapse', usage: 'Tabla de inventario' },
    '.table-head-cell': { value: 'px-5 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wide', usage: 'Celda de encabezado' },
    '.table-row': { value: 'border-b border-gray-100 transition-colors hover:bg-gray-50', usage: 'Fila de tabla' },
    '.table-cell': { value: 'px-5 py-3 text-sm text-gray-600', usage: 'Celda de tabla' },
    '.apartado-badge': { value: 'inline-flex items-center gap-1.5 bg-yellow-400 text-white px-3 py-1 rounded-full text-xs font-bold uppercase', usage: 'Badge apartado' },
    '.location-code': { value: 'font-mono font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded border border-dashed border-blue-400', usage: 'Código de ubicación ZNP' },
    '.action-menu-trigger': { value: 'inline-flex items-center justify-center p-2 rounded-md bg-white border border-gray-200 hover:border-blue-500', usage: 'Trigger del menú de acciones' },
    '.action-dropdown': { value: 'absolute right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[180px] z-[1000]', usage: 'Dropdown de acciones' },

    // De inventario-modals.css
    '.modal-overlay': { value: 'fixed inset-0 bg-slate-900/45 z-[100] flex justify-center items-center backdrop-blur-[4px]', usage: 'Overlay de modales' },
    '.modal-card': { value: 'bg-white w-[600px] max-w-[90%] rounded-2xl shadow-xl overflow-hidden', usage: 'Card de modal estándar' },
    '.modal-header': { value: 'flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gray-50', usage: 'Header de modal' },
    '.modal-body': { value: 'p-6', usage: 'Cuerpo de modal' },
    '.form-group': { value: 'mb-4', usage: 'Grupo de formulario' },
    '.form-row': { value: 'flex gap-4 mb-3', usage: 'Fila de formulario' },
    '.form-label': { value: 'block text-sm font-semibold text-gray-600 mb-1', usage: 'Label de formulario' },
    '.input-field': { value: 'w-full px-3 py-2.5 rounded-lg border-[1.5px] border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200', usage: 'Campo de input' },
    '.section-title': { value: 'text-xs font-bold text-gray-400 uppercase tracking-wide mb-2.5', usage: 'Título de sección en modal' },
    '.znp-box': { value: 'bg-blue-50/60 rounded-xl p-4 border border-blue-100 mb-4', usage: 'Caja del sistema ZNP' },
    '.modal-report': { value: 'bg-white w-[420px] max-w-[90%] rounded-2xl shadow-xl p-8 text-center', usage: 'Modal de reporte' },
    '.modal-verify': { value: 'bg-white w-[380px] max-w-[90%] rounded-2xl shadow-xl p-8 text-center', usage: 'Modal de verificación' },

    // De inventario-reportes.css
    '.reportes-header': { value: 'flex items-center justify-between px-5 py-4 border-b border-gray-100', usage: 'Header de la pestaña reportes' },
    '.filter-estado-btn': { value: 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200', usage: 'Botón de filtro de estado' },
    '.filter-estado-btn.is-active': { value: 'bg-blue-500 text-white border-blue-500', usage: 'Filtro activo' },
};

// Nota sobre excepciones técnicas
export const TECHNICAL_EXCEPTIONS = {
    getProjectPillStyle: {
        file: 'Views/utils/helpers.js',
        reason: 'Colores dinámicos calculados en runtime basados en project_id. No predecibles en Tailwind estático.',
        usage: 'InventarioTable.jsx — span.project-pill',
        recommendation: 'Mantener como inline style. Documentado como excepción justificada.',
    },
};
