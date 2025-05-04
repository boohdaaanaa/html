<?php
require_once '../config/database.php';
require_once '../models/Student.php';

header('Content-Type: application/json');

$db = (new Database())->getConnection();
$studentModel = new Student($db);

$data = json_decode(file_get_contents("php://input"), true);
$errors = [];

// Валідація
if (empty($data['group'])) $errors['group'] = "Please select a group.";
if (empty($data['name']) || strlen($data['name']) < 2) $errors['name'] = "First name must be at least 2 characters.";
if (empty($data['surname']) || strlen($data['surname']) < 2) $errors['surname'] = "Last name must be at least 2 characters.";
if (empty($data['gender']) || !in_array($data['gender'], ['M', 'F'])) $errors['gender'] = "Invalid gender.";
if (empty($data['birthday'])) {
    $errors['birthday'] = "Please select a birthday.";
} else {
    $birthday = strtotime($data['birthday']);
    if ($birthday < strtotime('1970-01-01') || $birthday > strtotime('2010-01-01')) {
        $errors['birthday'] = "Birthday must be between 1970 and 2010.";
    }
}

// Дублікат
if (empty($errors) && $studentModel->isDuplicate($data['name'], $data['surname'], $data['birthday'])) {
    $errors['duplicate'] = "Student already exists.";
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["errors" => $errors]);
    exit;
}

if ($studentModel->addStudent($data)) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
?>
