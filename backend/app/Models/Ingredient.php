<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

/**
 * Ingredient Model
 *
 * @category Models
 * @package  App\Models
 * @author   Recipes & Wines <contact@recipesandwines.app>
 * @license  https://opensource.org/licenses/MIT MIT License
 * @link     https://recipesandwines.app/docs/models/ingredient
 */
class Ingredient extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'name',
        'description',
    ];

    /**
     * Get the recipes that use this ingredient.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function recipes(): BelongsToMany
    {
        return $this->belongsToMany(Recipe::class);
    }
}
