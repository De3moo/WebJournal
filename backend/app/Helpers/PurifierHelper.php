<?php

namespace App\Helpers;

use HTMLPurifier;
use HTMLPurifier_Config;

class PurifierHelper
{
    public static function clean(string $content): string
    {
        $cachePath = storage_path('app/htmlpurifier');

        if (!is_dir($cachePath)) {
            mkdir($cachePath, 0775, true);
        }

        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'p,br,strong,em,u,ul,ol,li,h1,h2,h3,blockquote,a[href]');
        $config->set('Cache.SerializerPath', $cachePath);

        $purifier = new HTMLPurifier($config);
        return $purifier->purify($content);
    }
}
