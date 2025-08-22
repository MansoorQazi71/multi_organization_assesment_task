<?php

// app/Http/Controllers/OrganizationUserController.php
namespace App\Http\Controllers;

use App\Http\Requests\StoreOrganizationUserRequest;
use App\Http\Requests\UpdateOrganizationUserRequest;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrganizationUserController extends Controller
{
    // List current members of an org, with their pivot role
    public function index(int $orgId)
    {
        $organization = Organization::with([
            'users' => function ($q) {
                $q->select('users.id','users.name','users.email')
                  ->orderBy('users.name');
            }
        ])->findOrFail($orgId);

        return Inertia::render('Organizations/Users', [
            'organization' => [
                'id'   => $organization->id,
                'name' => $organization->name,
                'users'=> $organization->users->map(fn($u) => [
                    'id'    => $u->id,
                    'name'  => $u->name,
                    'email' => $u->email,
                    'role'  => $u->pivot->role,
                ]),
            ],
            // For an "Add user to org" select box
            'allUsers' => User::select('id','name','email')->orderBy('name')->get(),
        ]);
    }

    // Attach a user to org with a role
    public function store(StoreOrganizationUserRequest $request, int $orgId)
    {
        $org = Organization::findOrFail($orgId);

        // Avoid duplicating membership
        if ($org->users()->where('users.id', $request->user_id)->exists()) {
            return back()->with('error', 'User already belongs to this organization.');
        }

        $org->users()->attach($request->user_id, ['role' => $request->role]);

        return back()->with('success', 'User added to organization.');
    }

    // Update pivot role for a specific user in org
    public function update(UpdateOrganizationUserRequest $request, int $orgId, int $userId)
    {
        $org = Organization::findOrFail($orgId);

        if (! $org->users()->where('users.id', $userId)->exists()) {
            return back()->with('error', 'User is not a member of this organization.');
        }

        $org->users()->updateExistingPivot($userId, ['role' => $request->role]);

        return back()->with('success', 'Role updated.');
    }

    // Detach a user from org
    public function destroy(Request $request, int $orgId, int $userId)
    {
        $org = Organization::findOrFail($orgId);

        if (! $org->users()->where('users.id', $userId)->exists()) {
            return back()->with('error', 'User is not a member of this organization.');
        }

        // Optional safety: do not remove the last admin of the org
        $isRemovingAdmin = $org->users()->where('users.id', $userId)->first()?->pivot?->role === 'admin';
        if ($isRemovingAdmin) {
            $otherAdmins = $org->users()->wherePivot('role','admin')->where('users.id','!=',$userId)->count();
            if ($otherAdmins === 0) {
                return back()->with('error', 'Cannot remove the last admin of this organization.');
            }
        }

        $org->users()->detach($userId);

        return back()->with('success', 'User removed from organization.');
    }
}
