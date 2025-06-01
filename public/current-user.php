<?php
// current-user.php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['user'])) {
    // Return user data from session
    echo json_encode($_SESSION['user']);
} else {
    // Return error if user is not logged in
    http_response_code(401);
    echo json_encode(['error' => 'User not logged in']);
}
?>