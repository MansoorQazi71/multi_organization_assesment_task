<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::disableForeignKeyConstraints();

        // ---- Ensure roles/permissions have optional team_id (nullable) ----
        Schema::table('roles', function (Blueprint $table) {
            if (!Schema::hasColumn('roles', 'team_id')) {
                $table->unsignedBigInteger('team_id')->nullable()->after('guard_name')->index();
            }
        });
        Schema::table('permissions', function (Blueprint $table) {
            if (!Schema::hasColumn('permissions', 'team_id')) {
                $table->unsignedBigInteger('team_id')->nullable()->after('guard_name')->index();
            }
        });

        // ===================== model_has_roles =====================
        if (!Schema::hasTable('model_has_roles_tmp')) {
            Schema::create('model_has_roles_tmp', function (Blueprint $table) {
                $table->unsignedBigInteger('role_id');
                $table->string('model_type');
                $table->unsignedBigInteger('model_id');
                $table->unsignedBigInteger('team_id')->default(0); // teams default to 0 (global)
                $table->primary(['role_id','model_id','model_type','team_id'], 'mhr_role_model_type_team_primary');
                $table->index(['model_id','model_type'], 'model_has_roles_model_id_model_type_index');
                $table->index('role_id', 'model_has_roles_role_id_index');
            });
        }
        // copy old data with team_id = 0
        DB::statement('INSERT INTO model_has_roles_tmp (role_id, model_id, model_type, team_id)
                       SELECT role_id, model_id, model_type, 0 FROM model_has_roles');

        // swap
        Schema::drop('model_has_roles');
        Schema::rename('model_has_roles_tmp', 'model_has_roles');

        // ===================== model_has_permissions =====================
        if (!Schema::hasTable('model_has_permissions_tmp')) {
            Schema::create('model_has_permissions_tmp', function (Blueprint $table) {
                $table->unsignedBigInteger('permission_id');
                $table->string('model_type');
                $table->unsignedBigInteger('model_id');
                $table->unsignedBigInteger('team_id')->default(0);
                $table->primary(['permission_id','model_id','model_type','team_id'], 'mhp_perm_model_type_team_primary');
                $table->index(['model_id','model_type'], 'model_has_permissions_model_id_model_type_index');
                $table->index('permission_id', 'model_has_permissions_permission_id_index');
            });
        }
        DB::statement('INSERT INTO model_has_permissions_tmp (permission_id, model_id, model_type, team_id)
                       SELECT permission_id, model_id, model_type, 0 FROM model_has_permissions');

        Schema::drop('model_has_permissions');
        Schema::rename('model_has_permissions_tmp', 'model_has_permissions');

        // ===================== role_has_permissions =====================
        if (!Schema::hasTable('role_has_permissions_tmp')) {
            Schema::create('role_has_permissions_tmp', function (Blueprint $table) {
                $table->unsignedBigInteger('permission_id');
                $table->unsignedBigInteger('role_id');
                $table->unsignedBigInteger('team_id')->default(0);
                $table->primary(['permission_id','role_id','team_id'], 'rhp_perm_role_team_primary');
                $table->index('role_id', 'role_has_permissions_role_id_index');
            });
        }
        DB::statement('INSERT INTO role_has_permissions_tmp (permission_id, role_id, team_id)
                       SELECT permission_id, role_id, 0 FROM role_has_permissions');

        Schema::drop('role_has_permissions');
        Schema::rename('role_has_permissions_tmp', 'role_has_permissions');

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Best-effort: revert pivots to original (without team_id)
        if (Schema::hasTable('role_has_permissions')) {
            Schema::drop('role_has_permissions');
        }
        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->unsignedBigInteger('role_id');
            $table->primary(['permission_id','role_id']);
            $table->index('role_id', 'role_has_permissions_role_id_index');
        });

        if (Schema::hasTable('model_has_permissions')) {
            Schema::drop('model_has_permissions');
        }
        Schema::create('model_has_permissions', function (Blueprint $table) {
            $table->unsignedBigInteger('permission_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->primary(['permission_id','model_id','model_type'], 'model_has_permissions_permission_model_type_primary');
            $table->index(['model_id','model_type'], 'model_has_permissions_model_id_model_type_index');
            $table->index('permission_id', 'model_has_permissions_permission_id_index');
        });

        if (Schema::hasTable('model_has_roles')) {
            Schema::drop('model_has_roles');
        }
        Schema::create('model_has_roles', function (Blueprint $table) {
            $table->unsignedBigInteger('role_id');
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->primary(['role_id','model_id','model_type']);
            $table->index(['model_id','model_type'], 'model_has_roles_model_id_model_type_index');
            $table->index('role_id', 'model_has_roles_role_id_index');
        });

        // Optional: drop team_id from roles/permissions
        Schema::table('roles', function (Blueprint $table) {
            if (Schema::hasColumn('roles', 'team_id')) $table->dropColumn('team_id');
        });
        Schema::table('permissions', function (Blueprint $table) {
            if (Schema::hasColumn('permissions', 'team_id')) $table->dropColumn('team_id');
        });

        Schema::enableForeignKeyConstraints();
    }
};
