<?php
class Student {
    private $conn;
    private $table_name = "students";

    public function __construct($db) {
        $this->conn = $db;
    }

    // Authenticate user
    public function authenticate($username, $password) {
        $query = "SELECT * FROM students WHERE name = :name AND birthday = :birthday"; // Формує SQL-запит з параметрами
        $stmt = $this->conn->prepare($query);   // prepare($query)	Готує запит до виконання
        $stmt->bindParam(':name', $username);   // Прив’язує значення до параметрів
        $stmt->bindParam(':birthday', $password);
        $stmt->execute(); // Виконує запит до бази
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get all students
    public function getAllStudents() {
        $query = "SELECT id, name, surname, gender, birthday, status, group_name FROM " . $this->table_name;
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
    
        $students = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $students[] = $row;
        }
    
        return $students;
    }

    public function isDuplicate($name, $surname, $birthday) {
        $query = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE name = :name AND surname = :surname AND birthday = :birthday";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':surname', $surname);
        $stmt->bindParam(':birthday', $birthday);
        $stmt->execute();
        return $stmt->fetchColumn() > 0;
    }
    
    public function addStudent($data) {
        $query = "INSERT INTO " . $this->table_name . " (group_name, name, surname, gender, birthday, status)
                  VALUES (:group, :name, :surname, :gender, :birthday, 'active')";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':group', $data['group']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':surname', $data['surname']);
        $stmt->bindParam(':gender', $data['gender']);
        $stmt->bindParam(':birthday', $data['birthday']);
        return $stmt->execute();
    }
    
    public function updateStudent($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET group_name = :group, name = :name, surname = :surname, gender = :gender, birthday = :birthday
                  WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':group', $data['group']);
        $stmt->bindParam(':name', $data['name']);
        $stmt->bindParam(':surname', $data['surname']);
        $stmt->bindParam(':gender', $data['gender']);
        $stmt->bindParam(':birthday', $data['birthday']);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    
}
?>
