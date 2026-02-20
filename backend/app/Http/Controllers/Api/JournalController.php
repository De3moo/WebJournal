<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\SupabaseStorageService;

class JournalController extends Controller
{
    protected $storageService;

    public function __construct(SupabaseStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    /**
     * Display a listing of user's journals
     */
    public function index(Request $request): JsonResponse
    {
        $journals = $request->user()
            ->journals()
            ->orderBy('journal_date', 'desc')
            ->paginate(10);

        return response()->json($journals);
    }

    /**
     * Store a newly created journal
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title'        => 'required|string|max:255',
            'content'      => 'required|string',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'journal_date' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'content', 'journal_date']);
        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('image')) {
            try {
                $uploadResult = $this->storageService->uploadImage(
                    $request->file('image'),
                    'journals'
                );
                $data['image_url']             = $uploadResult['url'];
                $data['cloudinary_public_id']  = $uploadResult['public_id'];
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Image upload failed: ' . $e->getMessage()
                ], 500);
            }
        }

        $journal = Journal::create($data);

        return response()->json([
            'message' => 'Journal created successfully',
            'journal' => $journal,
        ], 201);
    }

    /**
     * Display the specified journal
     */
    public function show(Request $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json(['journal' => $journal]);
    }

    /**
     * Update the specified journal
     */
    public function update(Request $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title'        => 'sometimes|required|string|max:255',
            'content'      => 'sometimes|required|string',
            'image'        => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            'journal_date' => 'sometimes|required|date',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'content', 'journal_date']);

        if ($request->hasFile('image')) {
            try {
                $uploadResult = $this->storageService->updateImage(
                    $request->file('image'),
                    $journal->cloudinary_public_id,
                    'journals'
                );
                $data['image_url']            = $uploadResult['url'];
                $data['cloudinary_public_id'] = $uploadResult['public_id'];
            } catch (\Exception $e) {
                return response()->json([
                    'error' => 'Image upload failed: ' . $e->getMessage()
                ], 500);
            }
        }

        $journal->update($data);

        return response()->json([
            'message' => 'Journal updated successfully',
            'journal' => $journal,
        ]);
    }

    /**
     * Remove the specified journal
     */
    public function destroy(Request $request, Journal $journal): JsonResponse
    {
        if ($journal->user_id !== $request->user()->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($journal->cloudinary_public_id) {
            try {
                $this->storageService->deleteImage($journal->cloudinary_public_id);
            } catch (\Exception $e) {
                // Log error but continue with deletion
            }
        }

        $journal->delete();

        return response()->json(['message' => 'Journal deleted successfully']);
    }
}
