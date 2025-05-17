<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Notifiable;
use App\Models\Notification;

class NotificationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Notification::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'type' => fake()->word(),
            'notifiable_type' => fake()->word(),
            'notifiable_id' => Notifiable::factory(),
            'data' => '{}',
            'read_at' => fake()->dateTime(),
        ];
    }
}
