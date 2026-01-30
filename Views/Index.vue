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
                        INVENTARIO DE MATERIALES
                    </h1>
                </div>
                <div class="header-right">
                    <!-- Botón solo visible para Almacén (simulado) -->
                    <button class="btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Nuevo Material
                    </button>
                </div>
            </header>

            <main class="module-content">
                
                <!-- Barra de Filtros -->
                <div style="background: white; padding: 15px 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); display: flex; gap: 15px; align-items: center; flex-wrap: wrap;">
                    
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; font-size: 0.75rem; color: #666; margin-bottom: 4px; font-weight: 600;">BUSCAR</label>
                        <div style="position: relative;">
                            <input type="text" placeholder="Buscar por nombre..." style="width: 100%; padding: 8px 10px 8px 35px; border-radius: 6px; border: 1px solid #ddd; outline: none;" v-model="searchQuery">
                            <svg style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #999;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>

                    <div style="min-width: 150px;">
                        <label style="display: block; font-size: 0.75rem; color: #666; margin-bottom: 4px; font-weight: 600;">CATEGORÍA</label>
                        <select style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd;" v-model="filterCategory">
                            <option value="">Todas</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
                        </select>
                    </div>

                    <div style="min-width: 150px;">
                        <label style="display: block; font-size: 0.75rem; color: #666; margin-bottom: 4px; font-weight: 600;">ESTADO</label>
                        <select style="width: 100%; padding: 8px; border-radius: 6px; border: 1px solid #ddd;" v-model="filterStatus">
                            <option value="">Todos</option>
                            <option value="activo">Activo</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="rechazado">Rechazado</option>
                        </select>
                    </div>

                </div>

                <!-- Tabla de Datos -->
                <div style="background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                            <tr>
                                <th style="padding: 12px 20px; text-align: left; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Producto</th>
                                <th style="padding: 12px 20px; text-align: left; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Categoría</th>
                                <th style="padding: 12px 20px; text-align: center; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Unidad</th>
                                <th style="padding: 12px 20px; text-align: center; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Cant.</th>
                                <th style="padding: 12px 20px; text-align: left; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Ubicación</th>
                                <th style="padding: 12px 20px; text-align: center; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Estado</th>
                                <th style="padding: 12px 20px; text-align: center; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in filteredItems" :key="item.id" style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
                                <td style="padding: 12px 20px;">
                                    <div style="font-weight: 600; color: #334155;">{{ item.nombre }}</div>
                                    <div style="font-size: 0.8rem; color: #94a3b8;">{{ item.sku }}</div>
                                </td>
                                <td style="padding: 12px 20px; color: #475569;">{{ item.categoria }}</td>
                                <td style="padding: 12px 20px; text-align: center; color: #475569;">{{ item.unidad }}</td>
                                <td style="padding: 12px 20px; text-align: center; font-weight: 600; color: #334155;">{{ item.cantidad }}</td>
                                <td style="padding: 12px 20px;">
                                    <span class="location-code">{{ item.ubicacion }}</span>
                                </td>
                                <td style="padding: 12px 20px; text-align: center;">
                                    <span class="status-badge" 
                                        :class="{
                                            'approved': item.estado === 'activo',
                                            'pending': item.estado === 'pendiente',
                                            'rejected': item.estado === 'rechazado'
                                        }">
                                        {{ item.estado === 'activo' ? 'Aprobado' : (item.estado === 'pendiente' ? 'Sin Aprobar' : 'Rechazado') }}
                                    </span>
                                </td>
                                <td style="padding: 12px 20px; text-align: center;">
                                    <div style="display: flex; gap: 8px; justify-content: center;">
                                        <button title="Ver" style="background: none; border: none; cursor: pointer; color: #64748b; padding: 4px; border-radius: 4px;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='none'">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        </button>
                                        <button title="Editar" style="background: none; border: none; cursor: pointer; color: #3b82f6; padding: 4px; border-radius: 4px;" onmouseover="this.style.background='#eff6ff'" onmouseout="this.style.background='none'">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                        </button>
                                        <button title="Eliminar" style="background: none; border: none; cursor: pointer; color: #ef4444; padding: 4px; border-radius: 4px;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='none'">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <!-- Paginación -->
                    <div style="padding: 15px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                        <div style="font-size: 0.85rem; color: #64748b;">
                            Mostrando <strong>1-{{ filteredItems.length }}</strong> de <strong>{{ filteredItems.length }}</strong> resultados
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button disabled style="padding: 5px 10px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; color: #cbd5e1; cursor: not-allowed;">&lt; Anterior</button>
                            <button style="padding: 5px 12px; border: 1px solid var(--inventario-primary); background: var(--inventario-primary); border-radius: 6px; color: white; font-weight: 600;">1</button>
                            <button disabled style="padding: 5px 10px; border: 1px solid #e2e8f0; background: white; border-radius: 6px; color: #cbd5e1; cursor: not-allowed;">Siguiente &gt;</button>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import './inventario_theme.css';
import './inventario.css';

// Constantes
const categories = ['Electrónica', 'Químicos', 'Mobiliario', 'EPP', 'Accesorios', 'Herramientas', 'Otros'];

// Estado
const products = ref([]);
const searchQuery = ref('');
const filterCategory = ref('');
const filterStatus = ref('');

// API Fetch (Simulado)
const fetchProducts = async () => {
    try {
        const response = await fetch('/api/inventario_krsft/list');
        const data = await response.json();
        if (data.success) {
            products.value = data.products;
        }
    } catch (error) {
        console.error("Error fetching products:", error);
    }
};

// Computed: Filtros
const filteredItems = computed(() => {
    return products.value.filter(item => {
        const matchSearch = item.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                            item.sku.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchCat = filterCategory.value ? item.categoria === filterCategory.value : true;
        const matchStatus = filterStatus.value ? item.estado === filterStatus.value : true;
        
        return matchSearch && matchCat && matchStatus;
    });
});

onMounted(() => {
    fetchProducts();
});

const goBack = () => {
    window.location.href = '/';
};
</script>
