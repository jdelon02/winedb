<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\Api\GroupResource;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;

class GroupController extends Controller
{
    /**
     * Display a listing of the groups.
     */
    public function index(Request $request)
    {
        $groups = $request->user()
            ->groups()
            ->with(['creator', 'users'])
            ->paginate();

        return GroupResource::collection($groups);
    }

    /**
     * Store a newly created group.
     */
    public function store(Request $request): GroupResource
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|string|max:255',
            'settings' => 'nullable|json',
            'users' => 'nullable|array',
            'users.*' => 'exists:users,id'
        ]);

        $group = $request->user()->groups()->create([
            ...$validated,
            'creator_id' => $request->user()->id
        ]);

        if (!empty($validated['users'])) {
            $group->users()->attach($validated['users']);
        }

        return new GroupResource($group->load(['creator', 'users']));
    }

    /**
     * Display the specified group.
     */
    public function show(Group $group): GroupResource
    {
        $this->authorize('view', $group);

        return new GroupResource(
            $group->load(['creator', 'users'])
        );
    }

    /**
     * Update the specified group.
     */
    public function update(Request $request, Group $group): GroupResource
    {
        $this->authorize('update', $group);

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string|max:1000',
            'image' => 'nullable|string|max:255',
            'settings' => 'nullable|json',
        ]);

        $group->update($validated);

        return new GroupResource($group->load(['creator', 'users']));
    }

    /**
     * Remove the specified group.
     */
    public function destroy(Group $group): Response
    {
        $this->authorize('delete', $group);

        $group->users()->detach();
        $group->delete();

        return response()->noContent();
    }

    /**
     * Add users to the group.
     */
    public function addUsers(Request $request, Group $group): GroupResource
    {
        $this->authorize('update', $group);

        $validated = $request->validate([
            'users' => 'required|array',
            'users.*' => 'exists:users,id'
        ]);

        $group->users()->attach($validated['users']);

        return new GroupResource($group->load(['creator', 'users']));
    }

    /**
     * Remove users from the group.
     */
    public function removeUsers(Request $request, Group $group): GroupResource
    {
        $this->authorize('update', $group);

        $validated = $request->validate([
            'users' => 'required|array',
            'users.*' => 'exists:users,id'
        ]);

        // Don't allow removing the creator
        if (in_array($group->creator_id, $validated['users'])) {
            throw ValidationException::withMessages([
                'users' => ['Cannot remove the group creator']
            ]);
        }

        $group->users()->detach($validated['users']);

        return new GroupResource($group->load(['creator', 'users']));
    }
}
