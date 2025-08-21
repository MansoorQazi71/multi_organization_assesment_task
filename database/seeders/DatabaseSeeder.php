<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Contact;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use App\Models\Organization;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run()
    {
        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $memberRole = Role::create(['name' => 'member']);

        // Create users
        $admin = User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole('admin');  // Assign the admin role

        $member = User::factory()->create([
            'name' => 'Member User',
            'email' => 'member@example.com',
        ]);
        $member->assignRole('member');  // Assign the member role

        // Create an organization
        $organization = Organization::create([
            'name' => 'Test Organization',
            'slug' => 'test-org',
            'owner_user_id' => $admin->id,
        ]);

        // Attach admin and member to the organization
        $organization->users()->attach($admin->id, ['role' => 'admin']);
        $organization->users()->attach($member->id, ['role' => 'member']);

        // Create some contacts
        Contact::factory(10)->create([
            'organization_id' => $organization->id,
            'created_by' => $admin->id,
        ]);
    }
}
