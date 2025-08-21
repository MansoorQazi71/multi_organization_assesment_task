<?php


namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToOrganization
{
    public static function bootBelongsToOrganization()
    {
        static::addGlobalScope('organization', function (Builder $builder) {
            $builder->where('organization_id', session('current_organization'));
        });
    }
}
