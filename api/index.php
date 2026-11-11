<?php
/**
 * WarLok - Entry Point Apache XAMPP -> Laravel 11 Kernel
 * Mendukung akses langsung via http://localhost/warlok/api/* di XAMPP Apache
 * tanpa terkendala batas ThreadStackSize 1MB mod_php Windows.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$uri = $_SERVER['REQUEST_URI'] ?? '/api';
// Normalisasi /warlok/api/... menjadi /api/...
$laravelUri = preg_replace('#^.*?/api\b#', '/api', $uri);
if (!str_starts_with($laravelUri, '/api')) {
    $laravelUri = '/api/' . ltrim($laravelUri, '/');
}

$rawBody = file_get_contents('php://input');

// 0. Pastikan MySQL XAMPP (port 3307) berjalan otomatis jika diakses langsung dari XAMPP Apache
$mysqlFp = @fsockopen('127.0.0.1', 3307, $mErrno, $mErrstr, 0.15);
if ($mysqlFp) {
    fclose($mysqlFp);
} else {
    $mysqldBin = 'C:\\xampp\\mysql\\bin\\mysqld.exe';
    $myIni = 'C:\\xampp\\mysql\\bin\\my.ini';
    if (file_exists($mysqldBin)) {
        pclose(popen("start /B \"\" \"{$mysqldBin}\" --defaults-file=\"{$myIni}\" --port=3307 --standalone", "r"));
        usleep(1200000); // tunggu ~1.2 detik agar MySQL siap menerima koneksi
    }
}

// 1. Gunakan server Laravel 11 (127.0.0.1:8000) jika aktif untuk performa instan
$fp = @fsockopen('127.0.0.1', 8000, $errno, $errstr, 0.15);
if ($fp) {
    fclose($fp);
    $ch = curl_init('http://127.0.0.1:8000' . $laravelUri);
    curl_setopt_array($ch, [
        CURLOPT_CUSTOMREQUEST  => $method,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER     => [
            'Content-Type: application/json',
            'Accept: application/json',
        ],
        CURLOPT_TIMEOUT        => 15,
    ]);
    if ($rawBody !== '' && $rawBody !== false) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, $rawBody);
    }
    $response = curl_exec($ch);
    $httpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($response !== false && $httpCode > 0) {
        http_response_code($httpCode);
        echo $response;
        exit;
    }
}

// 2. Fallback: Jalankan Laravel 11 Kernel via PHP CLI (stack 8MB penuh di Windows)
// jika pengguna hanya menyalakan Apache XAMPP tanpa 'php artisan serve'
$runnerScript = __DIR__ . '/../backend/cli_runner.php';
$payloadFile = tempnam(sys_get_temp_dir(), 'wl_req_');
file_put_contents($payloadFile, json_encode([
    'method' => $method,
    'uri'    => $laravelUri,
    'body'   => $rawBody ?: '',
]));

$phpBin = 'C:\\xampp\\php\\php.exe';
if (!file_exists($phpBin)) {
    $phpBin = PHP_BINARY;
}

$cmd = sprintf('"%s" "%s" "%s"', $phpBin, $runnerScript, $payloadFile);
$output = shell_exec($cmd);
@unlink($payloadFile);

if ($output) {
    $decoded = json_decode($output, true);
    if (is_array($decoded) && isset($decoded['__status'], $decoded['__body'])) {
        http_response_code((int) $decoded['__status']);
        echo $decoded['__body'];
        exit;
    }
    echo $output;
    exit;
}

http_response_code(500);
echo json_encode([
    'success' => false,
    'data'    => null,
    'message' => 'Gagal menghubungi kernel Laravel 11',
    'errors'  => null,
]);
