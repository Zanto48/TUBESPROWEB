<?php
/**
 * WarLok API Uniform Response Formatter
 * Sesuai Dokumen Technical Implementation Plan Section 4:
 * Format response: { "success": true, "data": {}, "message": "", "errors": null }
 */

class Response {
    public static function json(bool $success, mixed $data = null, string $message = '', mixed $errors = null, int $statusCode = 200): void {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

        echo json_encode([
            'success' => $success,
            'data'    => $data,
            'message' => $message,
            'errors'  => $errors
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    public static function success(mixed $data = null, string $message = 'Success', int $statusCode = 200): void {
        self::json(true, $data, $message, null, $statusCode);
    }

    public static function error(string $message = 'Error', mixed $errors = null, int $statusCode = 400): void {
        self::json(false, null, $message, $errors, $statusCode);
    }
}
