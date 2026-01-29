<?php

namespace Modulos_ERP\InventarioKrsft\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InventarioController extends Controller
{
    protected $productsTable = 'inventario_productos';

    public function index()
    {
        $moduleName = basename(dirname(__DIR__));
        return Inertia::render("{$moduleName}/Index");
    }

    /**
     * Listar todos los productos
     */
    public function list(Request $request)
    {
        try {
            $query = DB::table($this->productsTable)
                ->orderBy('nombre', 'asc');
            
            $products = $query->get();

            return response()->json([
                'success' => true,
                'products' => $products,
                'total' => $products->count()
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage(), 'products' => []]);
        }
    }
}
