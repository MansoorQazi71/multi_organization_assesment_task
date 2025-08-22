<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Contact;
use App\Models\Organization;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Always clear cached roles/permissions before changes
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        DB::transaction(function () {
            // ===== 1) Roles (case-sensitive; match your middleware) =====
            // If your routes use role:admin|member (lowercase), keep lowercase here.
            $adminRole  = Role::findOrCreate('admin', 'web');
            $memberRole = Role::findOrCreate('member', 'web');

            // ===== 2) Users =====
            $admin = User::firstOrCreate(
                ['email' => 'admin@example.com'],
                ['name' => 'Admin User', 'password' => bcrypt('password')] // change in dev only
            );

            $member = User::firstOrCreate(
                ['email' => 'member@example.com'],
                ['name' => 'Member User', 'password' => bcrypt('password')]
            );

            // ===== 3) Organization =====
            $organization = Organization::firstOrCreate(
                ['slug' => 'test-org'],
                ['name' => 'Test Organization', 'owner_user_id' => $admin->id]
            );

            // ===== 4) Attach users to organization pivot =====
            // Avoid duplicate attaches
            $organization->users()->syncWithoutDetaching([
                $admin->id  => ['role' => 'admin'],
                $member->id => ['role' => 'member'],
            ]);

            // ===== 5) Assign roles (optionally scoped per organization) =====
            // If you enabled teams in config/permission.php:
            // 'teams' => true, 'team_foreign_key' => 'organization_id'
            if (config('permission.teams')) {
                app(PermissionRegistrar::class)->setPermissionsTeamId($organization->id);
            }

            $admin->assignRole($adminRole);
            $member->assignRole($memberRole);

            // ===== 6) Seed contacts =====
            if (! Contact::where('organization_id', $organization->id)->exists()) {
                Contact::factory(10)->create([
                    'organization_id' => $organization->id,
                    'created_by'      => $admin->id,
                ]);
            }
        });

        // Re-cache after seeding
        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
