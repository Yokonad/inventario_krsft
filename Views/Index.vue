<template>
    <div class="inventario-layout">
        <div class="inventario-bg"></div>
        
        <div class="inventario-container">
            <header class="module-header">
                <div class="header-left">
                    <button @click="goBack" class="btn-primary" style="margin-right: 20px;">
                        <svg viewBox="0 0 24 24" fill="none" width="18" height="18" stroke="currentColor" stroke-width="2">
                            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Volver
                    </button>
                    <h1>
                        <svg class="title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                             <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                             <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                             <line x1="12" y1="22.08" x2="12" y2="12"></line>
                        </svg>
                        GESTIÓN DE INVENTARIO
                    </h1>
                </div>
            </header>

            <main class="module-content">
                <div style="padding: 20px;">
                    <!-- Showcase Componentes Reutilizables -->
                    <div style="background: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <h3 style="margin-bottom: 15px; color: var(--inventario-text-dark);">Componentes Reutilizables (Preview)</h3>
                        
                        <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; margin-bottom: 20px;">
                            <div>
                                <p style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">Badges de Estado:</p>
                                <div style="display: flex; gap: 10px;">
                                    <span class="status-badge pending">Sin Aprobar</span>
                                    <span class="status-badge approved">Aprobado</span>
                                    <span class="status-badge rejected">Rechazado</span>
                                </div>
                            </div>
                            
                            <div>
                                <p style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">Código Ubicación:</p>
                                <span class="location-code">A-1-1</span>
                            </div>
                        </div>

                        <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                            <div>
                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Dropdown Categorías</label>
                                <select class="input-field" style="padding: 8px; border-radius: 6px; border: 1px solid #ddd;">
                                    <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display: block; font-size: 0.8rem; margin-bottom: 5px;">Dropdown Unidades</label>
                                <select class="input-field" style="padding: 8px; border-radius: 6px; border: 1px solid #ddd;">
                                    <option v-for="unit in units" :key="unit" :value="unit">{{ unit }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import './inventario_theme.css';
import './inventario.css';

// Constantes Reutilizables (Dropdowns)
const categories = [
    'Químicos',
    'Accesorios', 
    'Materiales', 
    'Herramientas', 
    'Otros'
];

const units = [
    'Unidad', 
    'Galón', 
    'Metro', 
    'Kg', 
    'Litro', 
    'Caja'
];

const goBack = () => {
    window.location.href = '/';
};
</script>
