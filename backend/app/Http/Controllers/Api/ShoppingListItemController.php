<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShoppingListItemRequest;
use App\Http\Requests\UpdateShoppingListItemRequest;
use App\Http\Resources\Api\ShoppingListItemResource;
use App\Models\ShoppingList;
use App\Models\ShoppingListItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class ShoppingListItemController extends Controller
{
    /**
     * Store a newly created shopping list item.
     */
    public function store(StoreShoppingListItemRequest $request): ShoppingListItemResource
    {
        $list = ShoppingList::findOrFail($request->input('shopping_list_id'));
        $this->authorize('update', $list);

        $item = $list->shoppingListItems()->create($request->validated());

        return new ShoppingListItemResource($item->load(['ingredient']));
    }

    /**
     * Update the specified shopping list item.
     */
    public function update(UpdateShoppingListItemRequest $request, ShoppingListItem $shoppingListItem): ShoppingListItemResource
    {
        $this->authorize('update', $shoppingListItem->shoppingList);

        $shoppingListItem->update($request->validated());

        return new ShoppingListItemResource($shoppingListItem->load(['ingredient']));
    }

    /**
     * Remove the specified shopping list item.
     */
    public function destroy(ShoppingListItem $shoppingListItem): Response
    {
        $this->authorize('update', $shoppingListItem->shoppingList);

        $shoppingListItem->delete();

        return response()->noContent();
    }
}
