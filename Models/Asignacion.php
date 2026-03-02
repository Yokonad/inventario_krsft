<?php

namespace Modulos_ERP\InventarioKrsft\Models;

use Illuminate\Database\Eloquent\Model;

class Asignacion extends Model
{
    protected $table = 'inventario_asignaciones';

    protected $fillable = [
        'producto_id',
        'project_id',
        'project_name',
        'cantidad',
        'asignado_por',
        'notas',
    ];

    protected $casts = [
        'cantidad'   => 'integer',
        'product_id' => 'integer',
        'project_id' => 'integer',
    ];

    /**
     * Relación con producto.
     */
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'producto_id');
    }
}
