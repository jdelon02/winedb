<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class GroupPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the group.
     */
    public function view(User $user, Group $group): bool
    {
        return $user->id === $group->creator_id || $group->users()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can update the group.
     */
    public function update(User $user, Group $group): bool
    {
        return $user->id === $group->creator_id;
    }

    /**
     * Determine whether the user can delete the group.
     */
    public function delete(User $user, Group $group): bool
    {
        return $user->id === $group->creator_id;
    }
}
