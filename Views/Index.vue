<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Inventario KRSFT</h1>
        <div class="bg-white rounded-lg shadow p-6">
            <p>{{ message }}</p>
        </div>
    </div>
</template>

<script setup>
defineProps({
    message: String
});
</script>
