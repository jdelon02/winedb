<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Auth Controller Test
 *
 * @category Tests
 * @package  Tests\Feature\Http\Controllers
 * @author   Recipes & Wines <contact@recipesandwines.app>
 * @license  https://opensource.org/licenses/MIT MIT License
 * @link     https://recipesandwines.app/docs/tests/auth
 */
class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user registration
     *
     * @return void
     */
    public function testUserRegistration(): void
    {
        $response = $this->postJson(
            '/api/v1/register',
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => 'password',
                'password_confirmation' => 'password',
            ]
        );

        $response->assertStatus(201)
            ->assertJsonStructure(
                [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'profile_image',
                        'bio',
                        'preferences',
                        'created_at',
                        'updated_at',
                    ],
                    'token',
                ]
            );

        $this->assertDatabaseHas(
            'users',
            [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]
        );
    }

    /**
     * Test user login
     *
     * @return void
     */
    public function testUserLogin(): void
    {
        $user = User::factory()->create(
            [
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
            ]
        );

        $response = $this->postJson(
            '/api/v1/login',
            [
                'email' => 'test@example.com',
                'password' => 'password',
            ]
        );

        $response->assertOk()
            ->assertJsonStructure(
                [
                    'user' => [
                        'id',
                        'name',
                        'email',
                        'created_at',
                        'updated_at',
                    ],
                    'token',
                ]
            );
    }

    /**
     * Test user logout
     *
     * @return void
     */
    public function testUserLogout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeaders(
            [
                'Authorization' => 'Bearer ' . $token,
            ]
        )->postJson('/api/v1/logout');

        $response->assertStatus(204);
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}