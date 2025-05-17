<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Main database seeder
 *
 * @category Database
 * @package  Database\Seeders
 * @author   Recipes & Wines <contact@recipesandwines.app>
 * @license  https://opensource.org/licenses/MIT MIT License
 */
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->count(10)->create();
    }
}
