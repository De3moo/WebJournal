<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $journal->title }}</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #222;
            margin: 40px;
            font-size: 14px;
        }

        h1 {
            font-size: 22px;
            border-bottom: 2px solid #2c7a4b;
            padding-bottom: 8px;
            margin-bottom: 6px;
        }

        .meta {
            font-size: 12px;
            color: #666;
            margin-bottom: 20px;
        }

        .divider {
            border: none;
            border-top: 1px solid #eee;
            margin: 20px 0;
        }

        .content {
            font-size: 14px;
            line-height: 1.8;
            color: #333;
            white-space: pre-wrap;
        }

        .journal-image {
            max-width: 480px;
            max-height: 300px;
            border-radius: 8px;
            display: block;
            margin-bottom: 20px;
        }

        .no-image {
            font-size: 12px;
            color: #aaa;
            margin-bottom: 20px;
            font-style: italic;
        }
    </style>
</head>
<body>

<h1>{{ $journal->title }}</h1>

<div class="meta">
    📅 {{ \Carbon\Carbon::parse($journal->journal_date)->format('F j, Y') }}
    &nbsp;&nbsp;|&nbsp;&nbsp;
    ✍️ {{ $journal->user->name ?? 'Unknown Author' }}
</div>

@if ($journal->image_url)
@php
$imageData = null;
$mime      = 'image/jpeg';
try {
$imageData = base64_encode(file_get_contents($journal->image_url));
$ext       = strtolower(pathinfo($journal->image_url, PATHINFO_EXTENSION));
$mime      = match($ext) {
'png'  => 'image/png',
'gif'  => 'image/gif',
'webp' => 'image/webp',
default => 'image/jpeg',
};
} catch (\Exception $e) {
$imageData = null;
}
@endphp

@if ($imageData)
<img class="journal-image"
     src="data:{{ $mime }};base64,{{ $imageData }}"
     alt="Journal image">
@else
<p class="no-image">[Image could not be loaded]</p>
@endif
@endif

<hr class="divider">

<div class="content">{{ $journal->content }}</div>

</body>
</html>
