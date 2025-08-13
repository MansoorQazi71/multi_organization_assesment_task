<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Services\CurrentOrganization;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class OrganizationController extends Controller
{
    public function index()
    {
        // List organizations user belongs to
        $orgs = Auth::user()->organizations()->get();

        return inertia('Organizations/Index', ['organizations' => $orgs]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:organizations,slug',
        ]);

        $org = Organization::create([
            'name' => $request->name,
            'slug' => Str::slug($request->slug),
            'owner_user_id' => Auth::id(),
        ]);

        // Attach user as Admin in pivot
        Auth::user()->organizations()->attach($org->id, ['role' => 'Admin']);

        // Set current organization session
        app(CurrentOrganization::class)->set($org);

        return redirect()->route('organizations.index');
    }

    public function switch(Request $request, Organization $organization)
    {
        $user = Auth::user();
        if (!$user->organizations()->where('id', $organization->id)->exists()) {
            abort(403);
        }

        app(CurrentOrganization::class)->set($organization);

        return redirect()->back();
    }
}
