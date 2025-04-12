<?php
class Student {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Authenticate user
    public function authenticate($username, $password) {
        $query = "SELECT * FROM students WHERE name = :name AND birthday = :birthday";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $username);
        $stmt->bindParam(':birthday', $password);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get all students
    public function getAll() {
        $query = "SELECT * FROM students";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
?>