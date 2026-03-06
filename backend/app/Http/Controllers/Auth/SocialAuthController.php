<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect(string $provider)
    {
        return Socialite::driver($provider)
            ->stateless()
            ->redirect();
    }

    public function callback(string $provider)
    {
        try {
            $socialUser = Socialite::driver($provider)->stateless()->user();
        } catch (\Exception $e) {
            return redirect(env('FRONTEND_URL') . '/login?error=social_auth_failed');
        }

        $field = $provider . '_id'; // 'google_id' or 'facebook_id'

        $user = User::updateOrCreate(
            [$field => $socialUser->getId()],
            [
                'name'   => $socialUser->getName(),
                'email'  => $socialUser->getEmail(),
                'avatar' => $socialUser->getAvatar(),
                $field   => $socialUser->getId(),
            ]
        );

        $token = $user->createToken('auth_token')->plainTextToken;

        // Redirect to frontend with token
        return redirect(env('FRONTEND_URL') . '/auth/callback?token=' . $token);
    }
}
