<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShoppingListRequest;
use App\Http\Requests\UpdateShoppingListRequest;
use App\Http\Resources\Api\ShoppingListResource;
use App\Models\ShoppingList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class ShoppingListController extends Controller
{
    /**
     * Display a listing of the shopping lists.
     */
    public function index(Request $request)
    {
        $lists = $request->user()
            ->shoppingLists()
            ->with(['shoppingListItems.ingredient'])
            ->paginate();

        return ShoppingListResource::collection($lists);
    }

    /**
     * Store a newly created shopping list.
     */
    public function store(StoreShoppingListRequest $request): ShoppingListResource
    {
        $list = $request->user()
            ->shoppingLists()
            ->create($request->validated());

        return new ShoppingListResource($list);
    }

    /**
     * Display the specified shopping list.
     */
    public function show(ShoppingList $shoppingList): ShoppingListResource
    {
        $this->authorize('view', $shoppingList);

        return new ShoppingListResource(
            $shoppingList->load(['shoppingListItems.ingredient', 'user'])
        );
    }

    /**
     * Update the specified shopping list.
     */
    public function update(UpdateShoppingListRequest $request, ShoppingList $shoppingList): ShoppingListResource
    {
        $this->authorize('update', $shoppingList);

        $shoppingList->update($request->validated());

        return new ShoppingListResource($shoppingList);
    }

    /**
     * Remove the specified shopping list.
     */
    public function destroy(ShoppingList $shoppingList): Response
    {
        $this->authorize('delete', $shoppingList);

        $shoppingList->delete();

        return response()->noContent();
    }
}
