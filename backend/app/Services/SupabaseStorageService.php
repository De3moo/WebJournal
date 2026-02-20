<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SupabaseStorageService
{
    protected string $supabaseUrl;
    protected string $serviceRoleKey;
    protected string $bucket;

    public function __construct()
    {
        $this->supabaseUrl      = rtrim(config('services.supabase.url'), '/');
        $this->serviceRoleKey   = config('services.supabase.service_role_key');
        $this->bucket           = config('services.supabase.storage_bucket', 'journals');
    }

    /**
     * Upload image to Supabase Storage
     */
    public function uploadImage(UploadedFile $file, string $folder = 'journals'): array
    {
        $fileName  = $folder . '/' . Str::uuid() . '.' . $file->getClientOriginalExtension();
        $fileContents = file_get_contents($file->getRealPath());

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceRoleKey,
            'Content-Type'  => $file->getMimeType(),
        ])->withBody($fileContents, $file->getMimeType())
            ->post("{$this->supabaseUrl}/storage/v1/object/{$this->bucket}/{$fileName}");

        if ($response->failed()) {
            throw new \Exception('Supabase upload failed: ' . $response->body());
        }

        $publicUrl = "{$this->supabaseUrl}/storage/v1/object/public/{$this->bucket}/{$fileName}";

        return [
            'url'       => $publicUrl,
            'public_id' => $fileName, // used as identifier for update/delete
        ];
    }

    /**
     * Update image (delete old + upload new)
     */
    public function updateImage(UploadedFile $file, ?string $oldPublicId = null, string $folder = 'journals'): array
    {
        if ($oldPublicId) {
            $this->deleteImage($oldPublicId);
        }

        return $this->uploadImage($file, $folder);
    }

    /**
     * Delete image from Supabase Storage
     */
    public function deleteImage(string $publicId): bool
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceRoleKey,
        ])->delete("{$this->supabaseUrl}/storage/v1/object/{$this->bucket}", [
            'prefixes' => [$publicId],
        ]);

        return $response->successful();
    }
}
