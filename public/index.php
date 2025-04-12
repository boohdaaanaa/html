<?php
// Start session at the beginning
session_start();

require_once '../config/database.php';
require_once '../controllers/AuthController.php';
require_once '../controllers/StudentController.php';

// Initialize database connection
$database = new Database();
$db = $database->getConnection();

// Check if database connection was successful
if ($db === null) {
    die("Failed to connect to the database. Please check your configuration.");
}

$page = $_GET['page'] ?? 'login';
$action = $_GET['action'] ?? '';

// Handle AJAX request to check login status
if ($action === 'check_login') {
    $response = [
        'isLoggedIn' => isset($_SESSION['user']),
        'userName' => isset($_SESSION['user']) ? $_SESSION['user']['name'] : ''
    ];
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Route requests
switch ($page) {
    case 'login':
        $controller = new AuthController($db);
        $controller->login();
        break;
    case 'logout':
        $controller = new AuthController($db);
        $controller->logout();
        break;
    case 'students':
        if (!isset($_SESSION['user'])) {
            header('Location: index.php?page=login');
            exit;
        }
        header('Location: students.html');
        exit;
    case 'index':
        header('Location: index.html');
        exit;
    case 'messages':
        if (!isset($_SESSION['user'])) {
            header('Location: index.php?page=login');
            exit;
        }
        header('Location: messages.html');
        exit;
    case 'tasks':
        if (!isset($_SESSION['user'])) {
            header('Location: index.php?page=login');
            exit;
        }
        header('Location: tasks.html');
        exit;
    default:
        header('Location: index.php?page=login');
        exit;
}
?>