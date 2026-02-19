// ════════════════════════════════════════════════════════════════
// CLASS HELPERS — MÓDULO INVENTARIO
// Utilidades para combinar y condicionar clases Tailwind
// ════════════════════════════════════════════════════════════════

import { BADGE_CLASSES } from '../../tokens';

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
    const variants = {
        activo: BADGE_CLASSES.approved,
        pendiente: BADGE_CLASSES.pending,
        rechazado: BADGE_CLASSES.rejected,
        revisado: BADGE_CLASSES.reviewed,
        resuelto: BADGE_CLASSES.approved,
    };
    return variants[status] || BADGE_CLASSES.pending;
};

/**
 * Genera clases para badge de estado de reporte.
 * @param {string} estado - 'pendiente' | 'revisado' | 'resuelto'
 * @returns {string}
 */
export const reporteBadgeClass = (estado) => {
    const variants = {
        pendiente: BADGE_CLASSES.pending,
        revisado: BADGE_CLASSES.reviewed,
        resuelto: BADGE_CLASSES.approved,
    };
    return variants[estado] || BADGE_CLASSES.pending;
};
