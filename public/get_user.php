<?php
// Увімкнути показ помилок для налагодження
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Credentials: true');

// Створюємо детальний лог
$debug_info = [
    'session_id' => session_id(),
    'session_data' => $_SESSION,
    'timestamp' => date('Y-m-d H:i:s')
];

file_put_contents('debug_getuser.log', json_encode($debug_info, JSON_PRETTY_PRINT) . "\n", FILE_APPEND);

// Перевіряємо чи існує користувач в сесії
if (isset($_SESSION['user']) && !empty($_SESSION['user'])) {
    $user = $_SESSION['user'];
    
    // Логуємо що знайшли
    file_put_contents('debug_getuser.log', "User found: " . json_encode($user) . "\n", FILE_APPEND);
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'] ?? null,
            'name' => $user['name'] ?? 'Unknown',
            'surname' => $user['surname'] ?? 'User',
            'username' => $user['username'] ?? '',
            'email' => $user['email'] ?? ''
        ],
        'debug' => 'User session found'
    ]);
} else {
    // Логуємо що не знайшли
    file_put_contents('debug_getuser.log', "No user in session\n", FILE_APPEND);
    
    echo json_encode([
        'success' => false,
        'message' => 'No user logged in',
        'debug' => 'No session data found',
        'session_exists' => isset($_SESSION['user'])
    ]);
}
?>