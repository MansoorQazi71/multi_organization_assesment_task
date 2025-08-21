<?php

namespace App\Services;

use Illuminate\Support\Facades\Session;

class CurrentOrganization
{
    public static function getCurrentOrganization()
    {
        // Get the current organization from the session or fallback to the user's first organization
        $orgId = session('current_organization');
        if (!$orgId) {
            $user = auth()->user();
            $orgId = $user->organizations()->first()->id; // Default to the first organization
            session(['current_organization' => $orgId]);
        }

        return $orgId;
    }
}
