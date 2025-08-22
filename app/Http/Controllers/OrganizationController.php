<?php

namespace App\Http\Controllers;

use App\Models\User;
use Inertia\Inertia;
use App\Models\Contact;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OrganizationController extends Controller
{
    /**
     * Show the form to create a new organization and handle its creation.
     */

    public function index()
    {
        $user = Auth::user();
        $organizations = $user->organizations;

        return inertia('Organizations/Index', [
            'organizations' => $organizations
        ]);
    }

    public function create(Request $request)
    {
        $user = auth()->user();  // Using auth helper

        if (!$user) {
            return redirect()->route('login');
        }

        // Validate the request
        $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:organizations,slug',
        ]);

        // Check if an organization with the same slug exists
        $existingOrganization = Organization::where('slug', $request->slug)->first();
        if ($existingOrganization) {
            return redirect()->back()->withErrors(['slug' => 'The slug already exists. Please choose another one.']);
        }

        // Create the new organization
        $organization = Organization::create([
            'name' => $request->name,
            'slug' => $request->slug,
            'owner_user_id' => $user->id,
        ]);

        // Add the user to the organization with the 'admin' role
        $organization->users()->attach($user->id, ['role' => 'admin']);

        return redirect()->route('organizations.index');
    }

    /**
     * Switch the current organization for the user.
     */
    public function switch($orgId)
    {
        // Ensure the organization exists
        $organization = Organization::find($orgId);
        if (!$organization) {
            return redirect()->route('organizations.index')->withErrors(['organization' => 'Organization not found.']);
        }

        // Set the selected organization in session
        session(['current_organization' => $orgId]);

        return redirect()->route('contacts.index');
    }

    public function show($id)
    {
        // Fetch the organization
        $organization = Organization::findOrFail($id);

        // Ensure the user is part of this organization
        if (!$organization->users()->where('user_id', Auth::id())->exists()) {
            return redirect()->route('organizations.index')->with('error', 'You are not a member of this organization.');
        }

        return inertia('Organizations/Show', [
            'organization' => $organization
        ]);
    }

    public function createForm()
    {
        return inertia('Organizations/Create');  // Ensure this renders the correct Inertia page

        // return response()->json('in the funtion');

    }
    public function manage($id)
    {
        $organization = Organization::with(['contacts.meta', 'contacts.notes'])
            ->findOrFail($id);  // Eager load contacts, contact_meta, and contact_notes

        return inertia('Organizations/ManageOrganization', [
            'organization' => $organization
        ]);
    }

    public function edit($id)
    {
        $org = Organization::findOrFail($id);

        // Ensure the current user is a member of this org
        $isMember = $org->users()->where('users.id', Auth::id())->exists();
        if (! $isMember) {
            abort(403, 'You do not belong to this organization.');
        }

        return Inertia::render('Organizations/Edit', [
            'organization' => [
                'id'   => $org->id,
                'name' => $org->name,
                'slug' => $org->slug,
                'owner_user_id' => $org->owner_user_id,
            ],
        ]);
    }

    /**
     * Update org name/slug (admin only; user must belong to org).
     */
    public function update(Request $request, $id)
    {
        $org = Organization::findOrFail($id);

        $isMember = $org->users()->where('users.id', Auth::id())->exists();
        if (! $isMember) {
            abort(403, 'You do not belong to this organization.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            // keep slug unique across all orgs except current
            'slug' => ['required', 'string', 'max:255', 'alpha_dash:ascii', 'unique:organizations,slug,' . $org->id],
        ]);

        $org->update($validated);

        return redirect()
            ->route('organizations.show', $org->id)
            ->with('success', 'Organization updated.');
    }

    /**
     * Leave the organization (members & admins).
     * Owners cannot leave their own organization.
     */
    public function leave($id)
    {
        $org  = Organization::findOrFail($id);
        $user = Auth::user();

        // must be a member
        if (! $org->users()->where('users.id', $user->id)->exists()) {
            abort(403, 'You are not a member of this organization.');
        }

        // owner cannot leave
        if ((int) $org->owner_user_id === (int) $user->id) {
            return back()->with('error', 'Owners cannot leave their own organization.');
        }

        // detach membership
        $org->users()->detach($user->id);

        // if leaving current org, switch to first remaining org (or clear)
        if ((int) session('current_organization') === (int) $org->id) {
            $fallbackOrgId = $user->organizations()->pluck('organizations.id')->first();
            if ($fallbackOrgId) {
                session(['current_organization' => $fallbackOrgId]);
            } else {
                session()->forget('current_organization');
            }
        }

        return redirect()->route('organizations.index')->with('success', 'You left the organization.');
    }
}
