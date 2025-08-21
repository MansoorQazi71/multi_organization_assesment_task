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
    Route::get('organizations/create', [OrganizationController::class, 'createForm'])->name('organizations.createForm');
    Route::post('organizations/create', [OrganizationController::class, 'create'])->name('organizations.create');
    
    // Contact Routes
    Route::get('contacts', [ContactsController::class, 'index'])->name('contacts.index');
    Route::get('contacts/create', [ContactsController::class, 'createForm'])->name('contacts.createForm');
    Route::post('contacts/create', [ContactsController::class, 'create'])->name('contacts.create');
});

require __DIR__.'/auth.php';
