// ════════════════════════════════════════════════════════════════
// CLASS HELPERS — MÓDULO INVENTARIO
// Utilidades para combinar y condicionar clases Tailwind
// ════════════════════════════════════════════════════════════════

/**
 * Combina múltiples clases Tailwind, filtrando valores falsy.
 * @param {...string} classes - Clases a combinar
 * @returns {string} Clases combinadas
 */
export const cx = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Aplica clases condicionales.
 * @param {string} base - Clases base siempre aplicadas
 * @param {Object} conditionals - { 'clase': condición }
 * @returns {string} Clases resultantes
 */
export const cxIf = (base, conditionals = {}) => {
    const conditional = Object.entries(conditionals)
        .filter(([, condition]) => Boolean(condition))
        .map(([cls]) => cls)
        .join(' ');
    return [base, conditional].filter(Boolean).join(' ');
};

/**
 * Retorna una clase u otra según condición.
 * @param {boolean} condition
 * @param {string} trueClass
 * @param {string} falseClass
 * @returns {string}
 */
export const cxToggle = (condition, trueClass, falseClass = '') =>
    condition ? trueClass : falseClass;

/**
 * Genera clases para tab activo/inactivo.
 * @param {boolean} isActive
 * @param {string} activeClass
 * @param {string} baseClass
 * @returns {string}
 */
export const tabClass = (isActive, activeClass, baseClass) =>
    isActive ? `${baseClass} ${activeClass}` : baseClass;

/**
 * Genera clases para badge de estado del inventario.
 * @param {string} status - 'activo' | 'pendiente' | 'rechazado'
 * @returns {string}
 */
export const statusBadgeClass = (status) => {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold uppercase tracking-wide border';
    const variants = {
        activo: 'bg-green-100 text-green-600 border-green-200',
        pendiente: 'bg-yellow-100 text-yellow-600 border-yellow-200',
        rechazado: 'bg-red-100 text-red-500 border-red-200',
        revisado: 'bg-yellow-100 text-yellow-600 border-yellow-200',
        resuelto: 'bg-green-100 text-green-600 border-green-200',
    };
    return `${base} ${variants[status] || variants.pendiente}`;
};

/**
 * Genera clases para badge de estado de reporte.
 * @param {string} estado - 'pendiente' | 'revisado' | 'resuelto'
 * @returns {string}
 */
export const reporteBadgeClass = (estado) => {
    const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide border';
    const variants = {
        pendiente: 'bg-yellow-100 text-yellow-600 border-yellow-200',
        revisado: 'bg-blue-100 text-blue-500 border-blue-200',
        resuelto: 'bg-green-100 text-green-600 border-green-200',
    };
    return `${base} ${variants[estado] || variants.pendiente}`;
};
