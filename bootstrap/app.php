<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // 1) Register route middleware aliases (used in routes: role:, permission:, etc.)
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);

        // 2) Append extra middleware to the 'web' group (classes only)
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
            // \App\Http\Middleware\SetPermissionsOrganization::class, // sets Spatie team/org per request
        ]);

        // NOTE: Default 'web' group (cookies, session, CSRF, etc.) is already included by the framework.
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->create();
