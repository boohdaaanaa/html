<?php
// Підключення до бази даних
require_once '../config/database.php';
require_once '../models/Student.php';

// Підключення до бази
$database = new Database();
$db = $database->getConnection();

$student = new Student($db);
$students = $student->getAllStudents();

// Повернення даних у форматі JSON
header('Content-Type: application/json');
echo json_encode($students);
?>
