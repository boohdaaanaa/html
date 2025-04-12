<?php
require_once '../models/Student.php';

class StudentController {
    private $studentModel;

    public function __construct($db) {
        $this->studentModel = new Student($db);
    }

    public function index() {
        session_start();
        if (!isset($_SESSION['user'])) {
            header('Location: index.php?page=login');
            exit;
        }
        // Redirect to the static HTML page
        header('/students.html');
        exit;
    }
}
?>