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
        'precio'
    ];
}
