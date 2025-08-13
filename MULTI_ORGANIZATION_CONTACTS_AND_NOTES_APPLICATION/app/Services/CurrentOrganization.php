<?php

namespace App\Services;

use App\Models\Organization;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;

class CurrentOrganization
{
    protected ?Organization $organization = null;

    public function get(): ?Organization
    {
        if ($this->organization) {
            return $this->organization;
        }

        $orgId = Session::get('current_organization_id');

        $user = Auth::user();
        if (!$user) {
            return null;
        }

        if ($orgId) {
            $org = $user->organizations()->where('id', $orgId)->first();
            if ($org) {
                return $this->organization = $org;
            }
        }

        // Fallback to first org
        $org = $user->organizations()->first();

        if ($org) {
            Session::put('current_organization_id', $org->id);
        }

        return $this->organization = $org;
    }

    public function set(Organization $organization)
    {
        $user = Auth::user();
        if (!$user) {
            return;
        }

        // Verify user belongs to this org
        if (!$user->organizations()->where('id', $organization->id)->exists()) {
            abort(403, 'Unauthorized organization');
        }

        Session::put('current_organization_id', $organization->id);
        $this->organization = $organization;
    }
}
