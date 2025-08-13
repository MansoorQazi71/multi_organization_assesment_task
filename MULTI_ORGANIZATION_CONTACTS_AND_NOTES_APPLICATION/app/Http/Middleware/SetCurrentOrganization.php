<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\CurrentOrganization;

class SetCurrentOrganization
{
    protected CurrentOrganization $currentOrg;

    public function __construct(CurrentOrganization $currentOrg)
    {
        $this->currentOrg = $currentOrg;
    }

    public function handle(Request $request, Closure $next)
    {
        $this->currentOrg->get(); // triggers fallback if session missing
        return $next($request);
    }
}
