<?php
// Підключення до бази даних
require_once 'database.php';

class Student {
    private $conn;
    private $table_name = "students";  // Назва таблиці з даними студентів

    public function __construct($db) {
        $this->conn = $db;
    }

    // Отримати всіх студентів
    public function getAllStudents() {
        $query = "SELECT id, name, gender, birthday, status, group_name FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();

        $students = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $students[] = $row;
        }

        return $students;
    }
}

// Підключення до бази
$database = new Database();
$db = $database->getConnection();

$student = new Student($db);
$students = $student->getAllStudents();

// Повернення даних у форматі JSON
header('Content-Type: application/json');
echo json_encode($students);
?>
