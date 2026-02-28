<?php

namespace App\Helpers;

use HTMLPurifier;
use HTMLPurifier_Config;

class PurifierHelper
{
    public static function clean(string $content): string
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'p,br,strong,em,u,ul,ol,li,h1,h2,h3,blockquote,a[href]');
        $config->set('Cache.SerializerPath', storage_path('app/htmlpurifier'));

        $purifier = new HTMLPurifier($config);
        return $purifier->purify($content);
    }
}
