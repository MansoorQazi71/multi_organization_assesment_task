<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;

class SetPermissionsOrganization
{
    public function handle(Request $request, Closure $next)
    {
        if ($user = $request->user()) {
            $currentOrgId = session('current_org_id');

            if (! $currentOrgId) {
                $firstOrgId = $user->organizations()->value('organizations.id'); // adjust relation if needed
                if ($firstOrgId) {
                    session(['current_org_id' => $firstOrgId]);
                    $currentOrgId = $firstOrgId;
                }
            }

            app(PermissionRegistrar::class)->setPermissionsTeamId($currentOrgId);
        }

        return $next($request);
    }
}
