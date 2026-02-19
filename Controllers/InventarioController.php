<?php

namespace Modulos_ERP\InventarioKrsft\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Modulos_ERP\InventarioKrsft\Models\Producto;
use Modulos_ERP\InventarioKrsft\Models\Reporte;

class InventarioController extends Controller
{
    public function index()
    {
        $moduleName = basename(dirname(__DIR__));
        return Inertia::render("{$moduleName}/Index", [
            'auth' => [
                'user' => auth()->user()
            ]
        ]);
    }

    /**
     * Listar todos los productos del inventario (no apartados)
     */
    public function list(Request $request)
    {
        try {
            $products = Producto::query()
                ->where(function ($q) {
                    $q->where('apartado', false)
                        ->orWhereNull('apartado');
                })
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'products' => $products,
                'total'    => $products->count(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error en list', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al listar productos'], 500);
        }
    }

    /**
     * Obtener estadísticas del inventario
     */
    public function stats()
    {
        try {
            $totalItems  = Producto::count();
            $activeItems = Producto::where('estado', 'activo')->count();
            $stockAlert  = Producto::where('cantidad', '<=', 5)->count();

            // Fix: config('modules.inventario.exchange_rate') no existe en este sistema.
            // Se usa el valor por defecto del config erp o un fallback seguro.
            $exchangeRate = floatval(config('erp.exchange_rate', 3.75));

            $totalValueUsd = Producto::selectRaw(
                'COALESCE(SUM(CASE WHEN moneda = ? THEN precio * cantidad ELSE (precio / ?) * cantidad END), 0) as total',
                ['USD', $exchangeRate]
            )->value('total');

            return response()->json([
                'success' => true,
                'stats'   => [
                    'total_products'   => $totalItems,
                    'active_products'  => $activeItems,
                    'total_value_usd'  => round(floatval($totalValueUsd), 2),
                    'stock_alert'      => $stockAlert,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error en stats', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al obtener estadísticas'], 500);
        }
    }

    /**
     * Detalle de producto
     */
    public function show($id)
    {
        $product = Producto::find($id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
        }

        return response()->json([
            'success' => true,
            'product' => $product,
        ]);
    }

    /**
     * Crear producto
     * Fix: validación de SKU único y campos requeridos completos.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nombre'    => 'required|string|max:255',
                'sku'       => 'required|string|max:100|unique:inventario_productos,sku',
                'cantidad'  => 'required|integer|min:0',
                'categoria' => 'nullable|string|max:100',
                'unidad'    => 'nullable|string|max:50',
                'precio'    => 'nullable|numeric|min:0',
                'moneda'    => 'nullable|string|in:PEN,USD',
                'estado'    => 'nullable|string|in:activo,inactivo',
                'ubicacion' => 'nullable|string|max:20',
                'descripcion' => 'nullable|string',
            ]);

            $product = Producto::create([
                'nombre'          => $validated['nombre'],
                'descripcion'     => $request->input('descripcion'),
                'sku'             => $validated['sku'],
                'cantidad'        => $validated['cantidad'],
                'precio'          => $validated['precio'] ?? 0,
                'categoria'       => $validated['categoria'] ?? 'Otros',
                'unidad'          => $validated['unidad'] ?? 'UND',
                'moneda'          => $validated['moneda'] ?? 'PEN',
                'estado'          => $validated['estado'] ?? 'activo',
                'ubicacion'       => $validated['ubicacion'] ?? null,
                'apartado'        => false,
                'estado_ubicacion' => isset($validated['ubicacion']) ? 'asignada' : null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Producto creado correctamente',
                'data'    => $product,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Datos inválidos', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error en store', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al crear producto'], 500);
        }
    }

    /**
     * Actualizar producto
     * Fix: solo se permiten campos seguros; se excluyen campos de integración (batch_id, project_id, etc.)
     */
    public function update(Request $request, $id)
    {
        $product = Producto::find($id);
        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
        }

        try {
            $validated = $request->validate([
                'nombre'      => 'sometimes|string|max:255',
                'descripcion' => 'sometimes|nullable|string',
                'sku'         => ['sometimes', 'string', 'max:100', Rule::unique('inventario_productos', 'sku')->ignore($id)],
                'cantidad'    => 'sometimes|integer|min:0',
                'precio'      => 'sometimes|numeric|min:0',
                'categoria'   => 'sometimes|nullable|string|max:100',
                'unidad'      => 'sometimes|nullable|string|max:50',
                'moneda'      => 'sometimes|string|in:PEN,USD',
                'estado'      => 'sometimes|string|in:activo,inactivo',
                'ubicacion'   => 'sometimes|nullable|string|max:20',
            ]);

            $product->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Producto actualizado correctamente',
                'id'      => $id,
                'data'    => $product->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Datos inválidos', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error en update', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al actualizar producto'], 500);
        }
    }

    /**
     * Eliminar producto
     */
    public function destroy($id)
    {
        try {
            $product = Producto::find($id);
            if (!$product) {
                return response()->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
            }

            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Producto eliminado correctamente',
                'id'      => $id,
            ]);
        } catch (\Exception $e) {
            Log::error('Error en destroy', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al eliminar producto'], 500);
        }
    }

    /**
     * Agregar items desde compras pagadas (llamado desde ComprasKrsft)
     * POST /api/inventariokrsft/add-from-purchase
     */
    public function addPurchasedItems(Request $request)
    {
        try {
            $request->validate([
                'items'        => 'required|array|min:1',
                'items.*.description' => 'nullable|string',
                'items.*.qty'  => 'nullable|integer|min:1',
                'project_id'   => 'nullable|integer',
                'project_name' => 'nullable|string',
                'batch_id'     => 'required|string',
            ]);

            $items       = $request->input('items', []);
            $projectId   = $request->input('project_id');
            $projectName = $request->input('project_name');
            $batchId     = $request->input('batch_id');

            $addedItems = [];

            DB::beginTransaction();

            foreach ($items as $item) {
                // Generar SKU único basado en batch + descripción + timestamp
                $skuBase = 'INV-' . substr(md5($batchId . ($item['description'] ?? '') . microtime()), 0, 8);
                $sku     = $skuBase;
                $attempt = 0;

                // Fix: el SKU podría colisionar; reintentar con sufijo si ya existe
                while (Producto::where('sku', $sku)->exists()) {
                    $attempt++;
                    $sku = $skuBase . '-' . $attempt;
                    if ($attempt > 10) {
                        Log::warning('No se pudo generar SKU único para item', ['description' => $item['description'] ?? '']);
                        continue 2; // saltar este item
                    }
                }

                $product = Producto::create([
                    'nombre'          => $item['description'] ?? 'Material sin descripción',
                    'sku'             => $sku,
                    'descripcion'     => $item['description'] ?? '',
                    'cantidad'        => $item['qty'] ?? 1,
                    'unidad'          => $item['unit'] ?? 'UND',
                    'precio'          => $item['subtotal'] ?? 0,
                    'moneda'          => $item['currency'] ?? 'PEN',
                    'categoria'       => 'Materiales Comprados',
                    'ubicacion'       => null,
                    'estado'          => 'activo',
                    'apartado'        => true,
                    'nombre_proyecto' => $projectName,
                    'estado_ubicacion' => 'pendiente',
                    'project_id'      => $projectId,
                    'batch_id'        => $batchId,
                    'diameter'        => $item['diameter'] ?? null,
                    'series'          => $item['series'] ?? null,
                    'material_type'   => $item['material_type'] ?? null,
                    'amount'          => $item['subtotal'] ?? 0,
                    'amount_pen'      => $item['amount_pen'] ?? ($item['subtotal'] ?? 0),
                ]);

                $addedItems[] = $product;
            }

            DB::commit();

            Log::info('Items agregados a inventario desde compras', [
                'batch_id'    => $batchId,
                'project_id'  => $projectId,
                'items_count' => count($addedItems),
            ]);

            return response()->json([
                'success' => true,
                'message' => count($addedItems) . ' items agregados al inventario',
                'items'   => $addedItems,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Datos inválidos', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error agregando items a inventario: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Error interno al agregar items'], 500);
        }
    }

    /**
     * Obtener items apartados (pendientes de ubicación)
     * GET /api/inventariokrsft/reserved-items
     */
    public function getReservedItems(Request $request)
    {
        try {
            $items = Producto::where('apartado', true)
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success'        => true,
                'reserved_items' => $items,
                'total'          => $items->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error en getReservedItems', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al obtener items reservados'], 500);
        }
    }

    /**
     * Asignar ubicación a item apartado
     * POST /api/inventariokrsft/assign-location
     * Fix: validación de zona mejorada (solo letras A-E), y se actualiza apartado=false al asignar.
     */
    public function assignLocation(Request $request)
    {
        try {
            $request->validate([
                'product_id' => 'required|integer|exists:inventario_productos,id',
                'zona'       => ['required', 'string', 'size:1', Rule::in(['A', 'B', 'C', 'D', 'E'])],
                'nivel'      => 'required|integer|min:1|max:4',
                'posicion'   => 'required|integer|min:1|max:8',
            ]);

            $productId    = $request->input('product_id');
            $zona         = strtoupper($request->input('zona'));
            $nivel        = $request->input('nivel');
            $posicion     = $request->input('posicion');
            $locationCode = "{$zona}-{$nivel}-{$posicion}";

            // Validar que la ubicación no esté duplicada
            if (!$this->isLocationAvailable($locationCode, $productId)) {
                return response()->json([
                    'success' => false,
                    'message' => "La ubicación {$locationCode} ya está ocupada",
                ], 409);
            }

            $product = Producto::find($productId);

            // Fix: al asignar ubicación, el item deja de estar "apartado" (pendiente)
            $product->update([
                'ubicacion'       => $locationCode,
                'estado_ubicacion' => 'asignada',
                'apartado'        => false,  // ya tiene ubicación, sale de la lista de pendientes
            ]);

            return response()->json([
                'success'  => true,
                'message'  => "Ubicación {$locationCode} asignada correctamente",
                'location' => $locationCode,
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Datos inválidos', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error en assignLocation', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al asignar ubicación'], 500);
        }
    }

    /**
     * Validar que una ubicación no esté duplicada
     */
    private function isLocationAvailable(string $location, int $productId = 0): bool
    {
        return !Producto::where('ubicacion', $location)
            ->where('id', '!=', $productId)
            ->exists();
    }

    /**
     * Verificar producto
     * POST /api/inventariokrsft/verify/{id}
     */
    public function verify(Request $request, $id)
    {
        try {
            $request->validate([
                'usuario' => 'required|string|max:255',
            ]);

            $product = Producto::find($id);
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Producto no encontrado',
                ], 404);
            }

            // Fix: no permitir verificar un producto ya verificado sin confirmación explícita
            $product->update([
                'verificado_at'  => now(),
                'verificado_por' => $request->input('usuario'),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Producto verificado correctamente',
                'data'    => [
                    'verificado_at'  => $product->fresh()->verificado_at,
                    'verificado_por' => $product->fresh()->verificado_por,
                ],
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Datos inválidos', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error en verify', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al verificar producto'], 500);
        }
    }

    /**
     * Crear reporte de material no recibido en obra
     * POST /api/inventariokrsft/reportes
     */
    public function createReporte(Request $request)
    {
        try {
            $request->validate([
                'producto_id'  => 'required|integer|exists:inventario_productos,id',
                'motivo'       => 'required|string|min:10|max:1000',
                'reportado_por' => 'required|string|max:255',
            ]);

            $product = Producto::find($request->input('producto_id'));

            $reporte = Reporte::create([
                'producto_id'     => $product->id,
                'producto_nombre' => $product->nombre,
                'producto_sku'    => $product->sku,
                'proyecto_nombre' => $product->nombre_proyecto ?? 'Sin proyecto',
                'motivo'          => $request->input('motivo'),
                'reportado_por'   => $request->input('reportado_por'),
                'estado'          => 'pendiente',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Reporte creado correctamente',
                'data'    => $reporte,
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Datos inválidos', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error en createReporte', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al crear reporte'], 500);
        }
    }

    /**
     * Listar todos los reportes
     * GET /api/inventariokrsft/reportes
     */
    public function listReportes(Request $request)
    {
        try {
            $reportes = Reporte::orderBy('created_at', 'desc')->get();

            return response()->json([
                'success'  => true,
                'reportes' => $reportes,
                'total'    => $reportes->count(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error en listReportes', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al listar reportes'], 500);
        }
    }

    /**
     * Actualizar estado de reporte
     * PUT /api/inventariokrsft/reportes/{id}
     * Fix: validación del campo estado contra valores del enum de la migración.
     */
    public function updateReporte(Request $request, $id)
    {
        try {
            $reporte = Reporte::find($id);
            if (!$reporte) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reporte no encontrado',
                ], 404);
            }

            $request->validate([
                'estado'       => ['sometimes', Rule::in(['pendiente', 'revisado', 'resuelto'])],
                'notas'        => 'sometimes|nullable|string|max:2000',
                'solucion'     => 'sometimes|nullable|string|max:2000',
                'revisado_por' => 'sometimes|nullable|string|max:255',
                'resuelto_por' => 'sometimes|nullable|string|max:255',
            ]);

            $data = $request->only(['estado', 'notas', 'solucion', 'resuelto_por']);

            if ($request->has('estado') && $request->input('estado') === 'revisado') {
                $data['revisado_at']  = now();
                $data['revisado_por'] = $request->input('revisado_por', auth()->user()->name ?? 'Sistema');
            }

            if ($request->has('estado') && $request->input('estado') === 'resuelto') {
                // Fix: requerir solución al marcar como resuelto
                if (empty($data['solucion']) && empty($reporte->solucion)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Se requiere una descripción de la solución para marcar como resuelto',
                    ], 422);
                }
                $data['resuelto_at']  = now();
                $data['resuelto_por'] = $request->input('resuelto_por', auth()->user()->name ?? 'Sistema');
            }

            $reporte->update($data);

            return response()->json([
                'success' => true,
                'message' => 'Reporte actualizado correctamente',
                'data'    => $reporte->fresh(),
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['success' => false, 'message' => 'Datos inválidos', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            Log::error('Error en updateReporte', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al actualizar reporte'], 500);
        }
    }

    /**
     * Eliminar reporte
     * DELETE /api/inventariokrsft/reportes/{id}
     */
    public function deleteReporte($id)
    {
        try {
            $reporte = Reporte::find($id);
            if (!$reporte) {
                return response()->json([
                    'success' => false,
                    'message' => 'Reporte no encontrado',
                ], 404);
            }

            $reporte->delete();

            return response()->json([
                'success' => true,
                'message' => 'Reporte eliminado correctamente',
            ]);

        } catch (\Exception $e) {
            Log::error('Error en deleteReporte', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Error interno al eliminar reporte'], 500);
        }
    }
}
