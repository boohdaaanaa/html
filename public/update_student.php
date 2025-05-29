<?php
require_once '../config/database.php';
require_once '../models/Student.php';

header('Content-Type: application/json');

$db = (new Database())->getConnection();
$studentModel = new Student($db);

$data = json_decode(file_get_contents("php://input"), true);
$errors = [];

if (!isset($data['id']) || !is_numeric($data['id'])) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid ID"]);
    exit;
}

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

if (empty($errors)) {
    $query = "SELECT COUNT(*) FROM students WHERE name = :name AND surname = :surname AND birthday = :birthday AND id != :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':surname', $data['surname']);
    $stmt->bindParam(':birthday', $data['birthday']);
    $stmt->bindParam(':id', $data['id']);
    $stmt->execute();
    if ($stmt->fetchColumn() > 0) {
        $errors['duplicate'] = "Another student with the same data already exists.";
    }
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(["errors" => $errors]);
    exit;
}

if ($studentModel->updateStudent($data['id'], $data)) {
    echo json_encode(["success" => true]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Database error"]);
}
