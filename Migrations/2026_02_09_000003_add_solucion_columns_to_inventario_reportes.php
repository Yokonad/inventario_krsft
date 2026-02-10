<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('inventario_reportes', function (Blueprint $table) {
            // Agregar campos para solución
            $table->text('solucion')->nullable()->after('motivo');
            $table->timestamp('resuelto_at')->nullable()->after('revisado_por');
            $table->string('resuelto_por')->nullable()->after('resuelto_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventario_reportes', function (Blueprint $table) {
            $table->dropColumn(['solucion', 'resuelto_at', 'resuelto_por']);
        });
    }
};
