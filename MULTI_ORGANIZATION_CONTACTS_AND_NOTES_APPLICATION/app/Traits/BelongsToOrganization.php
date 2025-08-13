<?php

namespace App\Traits;

use App\Services\CurrentOrganization;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;

trait BelongsToOrganization
{
    protected static function bootBelongsToOrganization()
    {
        static::addGlobalScope('current_organization', function (Builder $builder) {
            $currentOrg = app(CurrentOrganization::class)->get();

            if ($currentOrg) {
                $builder->where('organization_id', $currentOrg->id);
            }
        });

        static::creating(function ($model) {
            if (!$model->organization_id) {
                $currentOrg = app(CurrentOrganization::class)->get();
                if ($currentOrg) {
                    $model->organization_id = $currentOrg->id;
                }
            }
        });
    }
}
