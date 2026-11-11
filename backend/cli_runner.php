<?php
/**
 * WarLok Laravel 11 CLI HTTP Dispatcher
 * Dipanggil otomatis oleh api/index.php saat diakses via Apache XAMPP
 */

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';

$payloadFile = $argv[1] ?? null;
$reqData = $payloadFile && file_exists($payloadFile)
    ? json_decode(file_get_contents($payloadFile), true)
    : ['method' => 'GET', 'uri' => '/api/health', 'body' => ''];

$method = $reqData['method'] ?? 'GET';
$uri = $reqData['uri'] ?? '/api/health';
$body = $reqData['body'] ?? '';

$parts = parse_url($uri);
$path = $parts['path'] ?? '/api';
$query = [];
if (!empty($parts['query'])) {
    parse_str($parts['query'], $query);
}

$server = [
    'REQUEST_METHOD' => $method,
    'REQUEST_URI'    => $uri,
    'PATH_INFO'      => $path,
    'CONTENT_TYPE'   => 'application/json',
    'HTTP_ACCEPT'    => 'application/json',
];

$request = Request::create($uri, $method, $query, [], [], $server, $body);
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request);

echo json_encode([
    '__status' => $response->getStatusCode(),
    '__body'   => $response->getContent(),
]);

$kernel->terminate($request, $response);
