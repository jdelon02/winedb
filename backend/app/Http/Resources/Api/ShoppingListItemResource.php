<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShoppingListItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'shopping_list_id' => $this->shopping_list_id,
            'ingredient_id' => $this->ingredient_id,
            'name' => $this->name,
            'quantity' => $this->quantity,
            'unit' => $this->unit,
            'note' => $this->note,
            'is_checked' => $this->is_checked,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'shopping_list' => new ShoppingListResource($this->whenLoaded('shoppingList')),
            'ingredient' => new IngredientResource($this->whenLoaded('ingredient')),
        ];
    }
}
