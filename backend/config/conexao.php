<?php
class Conexao {

  private static $host = 'localhost';
    private static $db   = 'tcc';
    private static $user = 'root';
    private static $pass = 'root';
   public static function conectar() {
        try {
            $pdo = new PDO("mysql:host=" . self::$host . ";dbname=" . self::$db, self::$user, self::$pass);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            return $pdo;
        } catch (PDOException $e) {
            die("Erro na conexão: " . $e->getMessage());
        }
    }
}