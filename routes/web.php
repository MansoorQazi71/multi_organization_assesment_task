<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\OrganizationController;
use App\Http\Controllers\ContactsController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth'])->group(function () {
    // Organization Routes
    Route::get('organizations', [OrganizationController::class, 'index'])->name('organizations.index');
    Route::get('organizations/{id}', [OrganizationController::class, 'show'])->name('organizations.show');
    Route::get('organization/create', [OrganizationController::class, 'createForm'])->name('organizations.createForm');
    Route::post('organization/create', [OrganizationController::class, 'create'])->name('organizations.create');
    Route::get('organizations/{id}/manage', [OrganizationController::class, 'manage'])->name('organizations.manage');
    Route::post('/switch-org/{orgId}', [OrganizationController::class, 'switch'])
    ->name('organizations.switch');


    // Contact Routes
    Route::get('contacts', [ContactsController::class, 'index'])->name('contacts.index');
    Route::get('contacts/create', [ContactsController::class, 'createForm'])->name('contacts.createForm');
    Route::post('contacts/create', [ContactsController::class, 'create'])->name('contacts.create');
    Route::get('contacts/{id}', [ContactsController::class, 'show'])->name('contacts.show');
    Route::get('contacts/{id}/edit', [ContactsController::class, 'edit'])->name('contacts.edit');
    Route::put('contact/{id}', [ContactsController::class, 'update'])->name('contact.update');
    Route::delete('contacts/{id}', [ContactsController::class, 'destroy'])->name('contact.delete');
    Route::post('contacts/{id}/duplicate', [ContactsController::class, 'duplicate'])->name('contacts.duplicate');
});

require __DIR__ . '/auth.php';
