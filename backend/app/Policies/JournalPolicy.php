<?php

namespace App\Policies;

use App\Models\Journal;
use App\Models\User;

/**
 * JournalPolicy
 *
 * Centralises all authorisation logic for Journal resources.
 * Registered in AuthServiceProvider (or auto-discovered by Laravel).
 *
 * Usage in controller:
 *   $this->authorize('view',   $journal);
 *   $this->authorize('update', $journal);
 *   $this->authorize('delete', $journal);
 */
class JournalPolicy
{
    /**
     * A user can only view their own journal entries.
     */
    public function view(User $user, Journal $journal): bool
    {
        return $user->id === $journal->user_id;
    }

    /**
     * Any authenticated user may create a journal.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * A user may only update their own journal entries.
     */
    public function update(User $user, Journal $journal): bool
    {
        return $user->id === $journal->user_id;
    }

    /**
     * A user may only delete their own journal entries.
     */
    public function delete(User $user, Journal $journal): bool
    {
        return $user->id === $journal->user_id;
    }

    /**
     * A user may only export their own journal entries.
     */
    public function export(User $user, Journal $journal): bool
    {
        return $user->id === $journal->user_id;
    }
}
