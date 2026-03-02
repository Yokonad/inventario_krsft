<?php

use Illuminate\Support\Facades\Route;

$moduleName = basename(dirname(__DIR__));
$ctrl = "Modulos_ERP\\{$moduleName}\\Controllers\\InventarioController";

// ── Rutas específicas PRIMERO (antes de las rutas con parámetros dinámicos) ──

// Inventory Data
Route::get('/list', "{$ctrl}@list");
Route::get('/stats', "{$ctrl}@stats");

// Integration with ComprasKrsft (Purchased items)
Route::get('/reserved-items', "{$ctrl}@getReservedItems");
Route::post('/add-from-purchase', "{$ctrl}@addPurchasedItems");
Route::post('/assign-location', "{$ctrl}@assignLocation");

// Reportes — rutas específicas antes de /{id}
Route::get('/reportes', "{$ctrl}@listReportes");
Route::post('/reportes', "{$ctrl}@createReporte");
Route::put('/reportes/{id}', "{$ctrl}@updateReporte")->where('id', '[0-9]+');
Route::delete('/reportes/{id}', "{$ctrl}@deleteReporte")->where('id', '[0-9]+');

// Verification — ruta específica antes de /{id}
Route::post('/verify/{id}', "{$ctrl}@verify")->where('id', '[0-9]+');

// Asignaciones de materiales a proyectos
Route::get('/assignments/all', "{$ctrl}@getAllAssignments");
Route::get('/{id}/assignments', "{$ctrl}@getAssignments")->where('id', '[0-9]+');
Route::post('/{id}/assign', "{$ctrl}@assignToProject")->where('id', '[0-9]+');
Route::delete('/assignments/{id}', "{$ctrl}@removeAssignment")->where('id', '[0-9]+');
Route::get('/projects', "{$ctrl}@getProjects");

// ── Rutas con parámetros dinámicos AL FINAL ──
Route::get('/{id}', "{$ctrl}@show")->where('id', '[0-9]+');
Route::post('/create', "{$ctrl}@store");
Route::put('/{id}', "{$ctrl}@update")->where('id', '[0-9]+');
Route::delete('/{id}', "{$ctrl}@destroy")->where('id', '[0-9]+');
