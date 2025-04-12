<?php
require_once '../models/Student.php';

class AuthController {
    private $studentModel;

    public function __construct($db) {
        $this->studentModel = new Student($db);
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $username = $_POST['username'] ?? '';
            $password = $_POST['password'] ?? '';

            $user = $this->studentModel->authenticate($username, $password);
            if ($user) {
                session_start();
                $_SESSION['user'] = $user;
                header('Location: index.php?page=students');
                exit;
            } else {
                $error = "Invalid login credentials";
                require_once '../views/login.php';
            }
        } else {
            require_once '../views/login.php';
        }
    }

    public function logout() {
        session_start();
        session_destroy();
        header('Location: index.php?page=login');
        exit;
    }
}
?>