<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ContactsController;
use Illuminate\Support\Facades\Auth;
use App\Models\{Organization, Contact, ContactNote};
use Illuminate\Support\Facades\Storage;

// Globally constrain numeric params to avoid 'create' collisions
Route::pattern('id', '[0-9]+');
Route::pattern('orgId', '[0-9]+');
Route::pattern('userId', '[0-9]+');

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin'       => Route::has('login'),
        'canRegister'    => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion'     => PHP_VERSION,
    ]);
});


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/**
 * Shared access (admin | member)
 * - View organizations
 * - View contacts
 * - Add notes on a contact
 */
Route::middleware(['auth', 'role:admin|member'])->group(function () {
    // Organizations (read-only)
    Route::get('organizations', [OrganizationController::class, 'index'])->name('organizations.index');
    Route::get('organizations/{id}', [OrganizationController::class, 'show'])->name('organizations.show');
    Route::get('organizations/{id}/edit', [OrganizationController::class, 'edit'])
        ->name('organizations.edit');
    Route::put('organizations/{id}', [OrganizationController::class, 'update'])
        ->name('organizations.update');

    // Contacts (read-only)
    Route::get('contacts', [ContactsController::class, 'index'])->name('contacts.index');
    Route::get('contacts/{id}', [ContactsController::class, 'show'])->name('contacts.show');

    // Notes (UI calls POST /contacts/{id}/notes)
    // Implement ContactsController@storeNote($id) accordingly.
    Route::post('contacts/{id}/notes', [ContactsController::class, 'storeNote'])->name('contacts.notes.store');
});

/**
 * Admin-only
 * - Manage organizations
 * - Full contacts CRUD + duplicate
 * - Switch current organization
 */
Route::middleware(['auth', 'role:admin'])->group(function () {
    // Organizations manage
    Route::get('organization/create', [OrganizationController::class, 'createForm'])->name('organizations.createForm');
    Route::post('organization/create', [OrganizationController::class, 'create'])->name('organizations.create');
    Route::get('organizations/{id}/manage', [OrganizationController::class, 'manage'])->name('organizations.manage');

    Route::post('switch-org/{orgId}', [OrganizationController::class, 'switch'])->name('organizations.switch');

    // Contacts manage (static before dynamic; IDs constrained)
    Route::get('contacts/create', [ContactsController::class, 'createForm'])->name('contacts.createForm');
    Route::post('contacts/create', [ContactsController::class, 'create'])->name('contacts.create');

    Route::get('contacts/{id}/edit', [ContactsController::class, 'edit'])->name('contacts.edit');
    Route::put('contacts/{id}', [ContactsController::class, 'update'])->name('contacts.update');      // renamed
    Route::delete('contacts/{id}', [ContactsController::class, 'destroy'])->name('contacts.destroy'); // renamed
    Route::post('contacts/{id}/duplicate', [ContactsController::class, 'duplicate'])->name('contacts.duplicate');
});

Route::middleware(['auth','role:admin'])->group(function () {

    // ----- Users CRUD (global) -----
    Route::get('users',              [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
    Route::get('users/create',       [\App\Http\Controllers\UserController::class, 'create'])->name('users.create');
    Route::post('users',             [\App\Http\Controllers\UserController::class, 'store'])->name('users.store');
    Route::get('users/{id}/edit',    [\App\Http\Controllers\UserController::class, 'edit'])->name('users.edit');
    Route::put('users/{id}',         [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');
    Route::delete('users/{id}',      [\App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');

    // ----- Organization Users (pivot) -----
    // List & manage members of one org
    Route::get('organizations/{orgId}/users',                         [\App\Http\Controllers\OrganizationUserController::class, 'index'])->name('org.users.index');
    // Attach new member to org
    Route::post('organizations/{orgId}/users',                        [\App\Http\Controllers\OrganizationUserController::class, 'store'])->name('org.users.store');
    // Update pivot role
    Route::put('organizations/{orgId}/users/{userId}',                [\App\Http\Controllers\OrganizationUserController::class, 'update'])->name('org.users.update');
    // Detach member
    Route::delete('organizations/{orgId}/users/{userId}',             [\App\Http\Controllers\OrganizationUserController::class, 'destroy'])->name('org.users.destroy');
});

Route::get('/dashboard', function () {
    $user = Auth::user();

    // Resolve current org (session first, else first org)
    $currentOrgId = session('current_organization')
        ?? $user->organizations()->pluck('organizations.id')->first();

    $currentOrg = $currentOrgId
        ? Organization::select('id','name','owner_user_id','slug')->find($currentOrgId)
        : null;

    // Counts scoped to current org
    $contactsCount = $currentOrgId
        ? Contact::where('organization_id', $currentOrgId)->count()
        : 0;

    $notesCount = $currentOrgId
        ? ContactNote::whereHas('contact', fn($q) => $q->where('organization_id', $currentOrgId))->count()
        : 0;

    // Recent activity (limit 5 each)
    $recentContacts = $currentOrgId
        ? Contact::where('organization_id', $currentOrgId)
            ->latest('id')->limit(5)
            ->get()
            ->map(function ($c) {
                return [
                    'id'    => $c->id,
                    'name'  => trim($c->first_name.' '.$c->last_name),
                    'email' => $c->email,
                    'avatar_url' => $c->avatar_path ? Storage::url($c->avatar_path) : null,
                    'created_at' => $c->created_at?->toDateTimeString(),
                ];
            })
        : collect();

    $recentNotes = $currentOrgId
        ? ContactNote::with(['user:id,name', 'contact:id,first_name,last_name,organization_id'])
            ->whereHas('contact', fn($q) => $q->where('organization_id', $currentOrgId))
            ->latest('id')->limit(5)->get()
            ->map(function ($n) {
                return [
                    'id' => $n->id,
                    'body' => $n->body,
                    'user' => ['name' => $n->user?->name],
                    'contact' => [
                        'id' => $n->contact?->id,
                        'name' => trim(($n->contact?->first_name ?? '').' '.($n->contact?->last_name ?? '')),
                    ],
                    'created_at' => $n->created_at?->toDateTimeString(),
                ];
            })
        : collect();

    $orgs = $user->organizations()->select('organizations.id','organizations.name')->get();

    // Spatie roles -> array of strings
    $roles = method_exists($user, 'getRoleNames') ? $user->getRoleNames()->toArray() : [];
    $isAdmin = in_array('admin', $roles, true);

    return Inertia::render('Dashboard', [
        'user'          => ['id'=>$user->id, 'name'=>$user->name, 'email'=>$user->email],
        'roles'         => $roles,
        'isAdmin'       => $isAdmin,
        'orgs'          => $orgs,
        'currentOrg'    => $currentOrg,
        'counts'        => ['contacts' => $contactsCount, 'notes' => $notesCount],
        'recentContacts'=> $recentContacts,
        'recentNotes'   => $recentNotes,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/auth.php';
