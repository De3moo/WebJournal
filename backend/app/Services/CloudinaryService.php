<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class CloudinaryService
{
    protected $cloudinary;

    public function __construct()
    {
        $this->cloudinary = new Cloudinary([
            'cloud' => [
                'cloud_name' => config('services.cloudinary.cloud_name'),
                'api_key' => config('services.cloudinary.api_key'),
                'api_secret' => config('services.cloudinary.api_secret'),
            ],
        ]);
    }

    /**
     * Upload image to Cloudinary
     */
    public function uploadImage(UploadedFile $file, string $folder = 'journals'): array
    {
        $uploadedFile = $this->cloudinary->uploadApi()->upload(
            $file->getRealPath(),
            [
                'folder' => $folder,
                'resource_type' => 'image',
                'transformation' => [
                    'width' => 1200,
                    'height' => 1200,
                    'crop' => 'limit',
                    'quality' => 'auto:good',
                ]
            ]
        );

        return [
            'url' => $uploadedFile['secure_url'],
            'public_id' => $uploadedFile['public_id'],
        ];
    }

    /**
     * Delete image from Cloudinary
     */
    public function deleteImage(string $publicId): bool
    {
        $result = $this->cloudinary->uploadApi()->destroy($publicId);
        return $result['result'] === 'ok';
    }

    /**
     * Update image (delete old and upload new)
     */
    public function updateImage(UploadedFile $newFile, ?string $oldPublicId, string $folder = 'journals'): array
    {
        // Delete old image if exists
        if ($oldPublicId) {
            $this->deleteImage($oldPublicId);
        }

        // Upload new image
        return $this->uploadImage($newFile, $folder);
    }
}
