<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();

        return array_merge(parent::share($request), [
            'auth' => [
                'user'  => $user,
                // Spatie roles: ['admin'] or ['member']
                'roles' => $user ? $user->getRoleNames() : [],
            ],

            // For navbar “Org Members” link, etc.
            'current_organization' => session('current_organization'),

            // Handy for plain HTML forms (and debugging 419s)
            'csrf_token' => csrf_token(),

            // Flash messages (lazy-evaluated per Inertia recommendation)
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'message' => fn () => $request->session()->get('message'),
            ],
        ]);
    }
}
