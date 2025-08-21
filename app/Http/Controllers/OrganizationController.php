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
}
