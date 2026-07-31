<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Smoke test that the application boots and routes.
     *
     * Targets the framework health endpoint rather than `/`, because STRUCTURE.md
     * rule 1 makes the backend API-only — the Blade welcome view and its web route
     * are removed in Phase 4, and a test pinned to `/` would break with them.
     */
    public function test_the_application_returns_a_successful_response(): void
    {
        $response = $this->get('/up');

        $response->assertStatus(200);
    }
}
