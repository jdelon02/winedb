<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * User Resource
 *
 * @category Resources
 * @package  App\Http\Resources
 * @author   Recipes & Wines <contact@recipesandwines.app>
 * @license  https://opensource.org/licenses/MIT MIT License
 * @link     https://recipesandwines.app/docs/resources/user
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request Request instance
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_image' => $this->profile_image,
            'bio' => $this->bio,
            'preferences' => $this->preferences,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}