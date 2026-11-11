<?php
/**
 * WarLok (Warung Lokal) - Database Configuration for XAMPP (MySQL)
 * Sesuai Dokumen Technical Implementation Plan Section 1 & 2
 */

class Database {
    private static ?PDO $instance = null;

    public static function getConnection(): PDO {
        if (self::$instance === null) {
            $host = getenv('DB_HOST') ?: '127.0.0.1';
            $envPort = getenv('DB_PORT');
            $portsToTry = $envPort ? [$envPort] : ['3307', '3306'];
            $db   = getenv('DB_NAME') ?: 'warlok_db';
            $user = getenv('DB_USER') ?: 'root';
            $pass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : ''; // default XAMPP root password is blank
            $charset = 'utf8mb4';

            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ];

            $lastException = null;
            foreach ($portsToTry as $port) {
                $dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";
                try {
                    self::$instance = new PDO($dsn, $user, $pass, $options);
                    break;
                } catch (PDOException $e) {
                    $lastException = $e;
                }
            }

            if (self::$instance === null && $lastException !== null) {
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'data' => null,
                    'message' => 'Database connection failed: ' . $lastException->getMessage(),
                    'errors' => ['code' => $lastException->getCode()]
                ]);
                exit;
            }
        }
        return self::$instance;
    }
}
