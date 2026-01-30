<?php

namespace Modulos_ERP\InventarioKrsft\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InventarioController extends Controller
{
    // Mock Data simulating DB records
    private $mockProducts = [
        [
            'id' => 1,
            'nombre' => 'Laptop Gamer HP',
            'sku' => 'LAP-001',
            'descripcion' => 'Laptop de alto rendimiento',
            'cantidad' => 15,
            'unidad' => 'UND',
            'precio' => 1200.00,
            'moneda' => 'USD',
            'categoria' => 'Electrónica',
            'ubicacion' => 'A-1-1',
            'estado' => 'activo'
        ],
        [
            'id' => 2,
            'nombre' => 'Monitor 24" Dell',
            'sku' => 'MON-023',
            'descripcion' => 'Monitor IPS Full HD',
            'cantidad' => 30,
            'unidad' => 'UND',
            'precio' => 180.50,
            'moneda' => 'USD',
            'categoria' => 'Electrónica',
            'ubicacion' => 'A-1-2',
            'estado' => 'activo'
        ],
        [
            'id' => 3,
            'nombre' => 'Ácido Sulfúrico',
            'sku' => 'CHEM-001',
            'descripcion' => 'Bidón de 5L',
            'cantidad' => 50,
            'unidad' => 'Galón',
            'precio' => 45.00,
            'moneda' => 'USD',
            'categoria' => 'Químicos',
            'ubicacion' => 'B-2-1',
            'estado' => 'pendiente'
        ],
        [
            'id' => 4,
            'nombre' => 'Silla Ergonómica',
            'sku' => 'FUR-005',
            'descripcion' => 'Silla de oficina con soporte lumbar',
            'cantidad' => 10,
            'unidad' => 'UND',
            'precio' => 850.00,
            'moneda' => 'PEN',
            'categoria' => 'Mobiliario',
            'ubicacion' => 'C-1-1',
            'estado' => 'rechazado'
        ],
        [
            'id' => 5,
            'nombre' => 'Casco de Seguridad',
            'sku' => 'SAFE-99',
            'descripcion' => 'Casco industrial amarillo',
            'cantidad' => 100,
            'unidad' => 'UND',
            'precio' => 25.00,
            'moneda' => 'PEN',
            'categoria' => 'EPP',
            'ubicacion' => 'D-3-4',
            'estado' => 'activo'
        ]
    ];

    public function index()
    {
        $moduleName = basename(dirname(__DIR__));
        return Inertia::render("{$moduleName}/Index");
    }

    /**
     * Listar todos los productos (Mock)
     */
    public function list(Request $request)
    {
        return response()->json([
            'success' => true,
            'products' => $this->mockProducts,
            'total' => count($this->mockProducts)
        ]);
    }

    /**
     * Obtener estadísticas (Mock)
     */
    public function stats()
    {
        $totalItems = count($this->mockProducts);
        $totalValueUsd = 0;
        
        foreach ($this->mockProducts as $p) {
            if ($p['moneda'] === 'USD') {
                $totalValueUsd += ($p['precio'] * $p['cantidad']);
            } else {
                // Simple conversion for mock
                $totalValueUsd += (($p['precio'] / 3.75) * $p['cantidad']);
            }
        }

        return response()->json([
            'success' => true,
            'stats' => [
                'total_products' => $totalItems,
                'active_products' => $totalItems,
                'total_value_usd' => round($totalValueUsd, 2),
                'stock_alert' => 1 // Mock alert count
            ]
        ]);
    }

    /**
     * Detalle de producto (Mock)
     */
    public function show($id)
    {
        $product = collect($this->mockProducts)->firstWhere('id', (int)$id);

        if (!$product) {
            return response()->json(['success' => false, 'message' => 'Producto no encontrado'], 404);
        }

        return response()->json([
            'success' => true,
            'product' => $product
        ]);
    }

    /**
     * Crear producto (Mock - No guarda)
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'sku' => 'required|string',
            'cantidad' => 'required|integer'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Producto creado correctamente (Simulación)',
            'data' => $request->all()
        ]);
    }

    /**
     * Actualizar producto (Mock - No guarda)
     */
    public function update(Request $request, $id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Producto actualizado correctamente (Simulación)',
            'id' => $id
        ]);
    }

    /**
     * Eliminar producto (Mock - No guarda)
     */
    public function destroy($id)
    {
        return response()->json([
            'success' => true,
            'message' => 'Producto eliminado correctamente (Simulación)',
            'id' => $id
        ]);
    }
}
