<?php
header('Content-Type: application/json');
require '../config/db_connection.php'; 

$data = json_decode(file_get_contents("php://input"), true);
$ids = $data['ids'] ?? [];

if (empty($ids) || !is_array($ids)) {
    http_response_code(400); // (Bad Request)
    echo json_encode(["error" => "Невірний запит"]);
    exit;
}

$success = [];
$failed = [];

foreach ($ids as $id) {
    $stmt = $conn->prepare("DELETE FROM students WHERE id = ?");
    if ($stmt->execute([$id])) {
        if ($stmt->rowCount()) {
            $success[] = $id;
        } else {
            $failed[] = $id;
        }
    } else {
        $failed[] = $id;
    }
}

echo json_encode([
    "success" => $success,
    "failed" => $failed
]);

file_put_contents("log.txt", print_r($ids, true));

?>
