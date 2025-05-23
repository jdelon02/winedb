<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

/**
 * Factory for creating User model instances
 *
 * @category Factories
 * @package  Database\Factories
 * @author   Recipes & Wines <contact@recipesandwines.app>
 * @license  https://opensource.org/licenses/MIT MIT License
 * @link     https://recipesandwines.app/docs/factories/user
 *
 * @extends Factory<User>
 */
class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'remember_token' => Str::random(10),
            'profile_image' => $this->faker->imageUrl(),
            'bio' => $this->faker->paragraph(),
            'preferences' => json_encode(
                [
                    'theme' => $this->faker->randomElement(['light', 'dark']),
                    'notifications' => $this->faker->boolean(),
                    'language' => $this->faker->languageCode(),
                ]
            ),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     *
     * @return static
     */
    public function unverified(): static
    {
        return $this->state(
            fn (array $attributes) => [
                'email_verified_at' => null,
            ]
        );
    }
}
