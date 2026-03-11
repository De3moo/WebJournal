<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use App\Services\AuditLogger;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Services\SupabaseStorageService;

class JournalController extends Controller
{
    protected SupabaseStorageService $storageService;

    public function __construct(SupabaseStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    /**
     * Consistent 403 response + audit log when a user attempts to access
     * a resource they do not own.
     */
    private function unauthorized(Request $request, Journal $journal): JsonResponse
    {
        AuditLogger::logUnauthorizedAccess(
            $request->user()->id,
            "journal:{$journal->id}",
            $request
        );

        return response()->json(['error' => 'Unauthorized'], 403);
    }

    // ── CRUD ──────────────────────────────────────────────────────────────

    /**
     * List the authenticated user's journals (paginated).
     *
     * Access control: auth:sanctum middleware ensures only authenticated
     * users reach this method; journals are scoped to the current user.
     */
    public function index(Request $request): JsonResponse
    {
        $journals = $request->user()
            ->journals()
            ->select(['id', 'title', 'journal_date', 'image_url', 'content'])
            ->orderBy('journal_date', 'desc')
            ->paginate(5);

        return response()->json($journals);
    }

    /**
     * Create a new journal entry.
     *
     * Security controls:
     *  - Input validation (title, content, image type/size, date format)
     *  - user_id set server-side (never trusted from client)
     *  - content stripped of dangerous tags
     *  - Audit log on success
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:50000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'journal_date' => 'required|date|before_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = [
            'title'        => strip_tags(trim($request->title)),
            'content' => (string) $request->input('content', ''),
            'journal_date' => $request->journal_date,
            'user_id'      => $request->user()->id,
        ];

        if ($request->hasFile('image')) {
            try {
                $uploadResult = $this->storageService->uploadImage($request->file('image'), 'journals');
                $data['image_url'] = $uploadResult['url'];
                $data['cloudinary_public_id'] = $uploadResult['public_id'];
            } catch (\Exception $e) {
                Log::error('Journal image upload failed', [
                    'user_id' => $request->user()->id,
                    'error' => $e->getMessage(),
                ]);
                return response()->json(['error' => 'Image upload failed. Please try again.'], 500);
            }
        }

        $journal = Journal::create($data);

        AuditLogger::logJournalCreated($request->user()->id, $journal->id, $request);

        return response()->json([
            'message' => 'Journal created successfully',
            'journal' => $journal,
        ], 201);
    }

    /**
     * Retrieve a single journal entry.
     *
     * Authorization: user must own the journal.
     */
    public function show(Request $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            return $this->unauthorized($request, $journal);
        }

        return response()->json(['journal' => $journal]);
    }

    /**
     * Update an existing journal entry.
     *
     * Authorization: user must own the journal.
     * Security:
     *  - Validates only provided fields (sometimes)
     *  - Input sanitization applied
     *  - Audit log on success
     */
    public function update(Request $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            return $this->unauthorized($request, $journal);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'content' => 'sometimes|required|string|max:50000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'journal_date' => 'sometimes|required|date|before_or_equal:today',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = array_filter([
            'title'        => $request->has('title')        ? strip_tags(trim($request->title)) : null,
            'content' => $request->has('content') ? (string) $request->input('content', '') : null,
            'journal_date' => $request->has('journal_date') && $request->journal_date
                ? $request->journal_date
                : $journal->journal_date->toDateString(),
        ], fn($v) => $v !== null);

        if ($request->hasFile('image')) {
            try {
                $uploadResult = $this->storageService->updateImage(
                    $request->file('image'),
                    $journal->cloudinary_public_id,
                    'journals'
                );
                $data['image_url'] = $uploadResult['url'];
                $data['cloudinary_public_id'] = $uploadResult['public_id'];
            } catch (\Exception $e) {
                Log::error('Journal image update failed', [
                    'user_id' => $request->user()->id,
                    'journal_id' => $journal->id,
                    'error' => $e->getMessage(),
                ]);
                return response()->json(['error' => 'Image upload failed. Please try again.'], 500);
            }
        }

        $journal->update($data);

        AuditLogger::logJournalUpdated($request->user()->id, $journal->id, $request);

        return response()->json([
            'message' => 'Journal updated successfully',
            'journal' => $journal->fresh(),
        ]);
    }

    /**
     * Delete a journal entry.
     *
     * Authorization: user must own the journal.
     * Security:
     *  - Deletes image from storage first
     *  - Errors on image deletion are logged but do NOT block record deletion
     *  - Audit log on success
     */
    public function destroy(Request $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            return $this->unauthorized($request, $journal);
        }

        if ($journal->cloudinary_public_id) {
            try {
                $this->storageService->deleteImage($journal->cloudinary_public_id);
            } catch (\Exception $e) {
                Log::warning('Journal image deletion failed during destroy', [
                    'user_id' => $request->user()->id,
                    'journal_id' => $journal->id,
                    'cloudinary_public_id' => $journal->cloudinary_public_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $journalId = $journal->id;
        $journal->delete();

        AuditLogger::logJournalDeleted($request->user()->id, $journalId, $request);

        return response()->json(['message' => 'Journal deleted successfully']);
    }

    /**
     * Export a journal entry as a PDF.
     *
     * Authorization: user must own the journal.
     * Security: Audit log on export (sensitive data leaving system).
     */
    public function exportPdf(Request $request, Journal $journal)
    {
        if ($journal->user_id !== $request->user()->id) {
            return $this->unauthorized($request, $journal);
        }

        $journal->load('user');

        AuditLogger::logJournalExported($request->user()->id, $journal->id, $request);

        $pdf = Pdf::loadView('journals.pdf', ['journal' => $journal]);
        $filename = 'journal-' . $journal->id . '-' . now()->format('Ymd') . '.pdf';

        return $pdf->download($filename);
    }

}
