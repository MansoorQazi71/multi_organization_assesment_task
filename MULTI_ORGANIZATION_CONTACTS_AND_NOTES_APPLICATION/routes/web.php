<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\OrganizationController;

use App\Http\Controllers\ContactNoteController;
use App\Http\Controllers\ContactMetaController;


Route::get('/', function () {
    return view('welcome');
});

Route::middleware(['auth', 'set.current.organization'])->group(function () {
    Route::get('/contacts', [ContactController::class, 'index']);
});


Route::middleware(['auth', 'set.current.organization'])->group(function () {
    Route::get('/healthz', function () {
        return response()->json(['ok' => true]);
    });

    Route::resource('organizations', OrganizationController::class)->only(['index', 'store']);
    Route::post('organizations/{organization}/switch', [OrganizationController::class, 'switch'])->name('organizations.switch');

    Route::resource('contacts', ContactController::class);

    // Additional routes for notes and meta
    Route::resource('contacts.notes', ContactNoteController::class)->shallow();
    Route::resource('contacts.meta', ContactMetaController::class)->shallow();
});

