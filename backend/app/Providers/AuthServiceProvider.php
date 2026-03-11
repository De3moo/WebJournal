<?php

namespace App\Providers;

use App\Models\Journal;
use App\Policies\JournalPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Register model → policy mappings.
     */
    protected $policies = [
        Journal::class => JournalPolicy::class,
    ];

    public function boot(): void
    {
        $this->registerPolicies();
    }
}
