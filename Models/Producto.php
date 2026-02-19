<?php

namespace Modulos_ERP\InventarioKrsft\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    protected $table = 'inventario_productos';
    
    protected $fillable = [
        'nombre',
        'descripcion',
        'sku',
        'cantidad',
        'precio',
        'categoria',
        'unidad',
        'moneda',
        'estado',
        'ubicacion',
        'project_id',
        'apartado',
        'nombre_proyecto',
        'estado_ubicacion',
        'batch_id',
        'diameter',
        'series',
        'material_type',
        'amount',
        'amount_pen',
        'verificado_at',
        'verificado_por',
    ];

    protected $casts = [
        'apartado'      => 'boolean',
        'cantidad'      => 'integer',
        'precio'        => 'float',
        'amount'        => 'float',
        'amount_pen'    => 'float',
        'verificado_at' => 'datetime',   // Fix: campo datetime sin cast causaba errores de serialización
    ];

    /**
     * Relación con reportes del producto.
     */
    public function reportes()
    {
        return $this->hasMany(Reporte::class, 'producto_id');
    }
}
