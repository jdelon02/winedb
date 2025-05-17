<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;
use App\Models\Ingredient;
use App\Models\ShoppingList;
use App\Models\ShoppingListItem;

class ShoppingListItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = ShoppingListItem::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'shopping_list_id' => ShoppingList::factory(),
            'ingredient_id' => Ingredient::factory(),
            'name' => fake()->name(),
            'quantity' => fake()->randomFloat(0, 0, 9999999999.),
            'unit' => fake()->word(),
            'note' => fake()->text(),
            'is_checked' => fake()->boolean(),
        ];
    }
}
