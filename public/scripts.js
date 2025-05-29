const selectAllCheckbox = document.getElementById("selectAll");

function getRowCheckboxes() {
    return document.querySelectorAll(".rowCheckbox");
}

//Глобальні змінні для пагінації
let studentsData = [];
let currentPage = 1;
const rowsPerPage = 5;

function toggleRowButtons(checkbox) {
    const row = checkbox.closest("tr");
    const editBtn = row.querySelector(".edit-btn");
    const deleteBtn = row.querySelector(".delete-btn");

    if (editBtn && deleteBtn) {
        if (checkbox.checked) {
            editBtn.removeAttribute("disabled");
            deleteBtn.removeAttribute("disabled");
        } else {
            editBtn.setAttribute("disabled", "true");
            deleteBtn.setAttribute("disabled", "true");
        }
    }
}

function editRow(btn) {
    const row = btn.closest("tr");
    const checkbox = row.querySelector(".rowCheckbox");
    if (checkbox && checkbox.checked) {
        openModal(row);
    } else {
        alert("Виберіть студента, щоб редагувати його!");
    }
}

function openModal(editingRow = null) {
    const modal = document.getElementById("addStudent");
    const modalTitle = document.getElementById("modalTitle");
    const submitButton = document.getElementById("submitStudent");
    const studentIdField = document.getElementById("studentId");

    if (editingRow) {
        modalTitle.textContent = "Edit student";
        submitButton.textContent = "Save";
        submitButton.setAttribute("data-editing", "true");

        const studentId = editingRow.getAttribute("data-id");
        studentIdField.value = studentId;

        document.getElementById("group").value = editingRow.cells[1].textContent.trim();
        const fullName = editingRow.cells[2].textContent.trim().split(" ");
        document.getElementById("name").value = fullName[0] || "";
        document.getElementById("surname").value = fullName[1] || "";
        document.getElementById("gender").value = editingRow.cells[3].textContent.trim();
        document.getElementById("birthday").value = editingRow.cells[4].textContent.trim();
    } else {
        modalTitle.textContent = "Add student";
        submitButton.textContent = "Create";
        submitButton.removeAttribute("data-editing");
        studentIdField.value = "";

        document.getElementById("group").value = "";
        document.getElementById("name").value = "";
        document.getElementById("surname").value = "";
        document.getElementById("gender").value = "";
        document.getElementById("birthday").value = "";
    }

    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById("addStudent");
    if (modal) modal.style.display = "none";
}

function displayErrors(errors) {
    const fields = ['name', 'surname', 'group', 'gender', 'birthday'];
    fields.forEach(field => {
        const errorEl = document.getElementById(`${field}-error`);
        if (errorEl) errorEl.textContent = errors[field] || '';
    });

    if (errors.duplicate) {
        alert(errors.duplicate);
    } else if (typeof errors === 'string') {
        alert(errors);
    }
}

function loadStudents() {
    fetch('/students')  // ① Відправляє HTTP-запит до PHP-файлу на сервері
        .then(response => response.json())  // ② Очікує відповідь і перетворює її з JSON
        .then(students => {                 // ③ Отримує масив студентів
            studentsData = students;       // ④ Зберігає дані в змінну
            renderPage(currentPage);       // ⑤ Малює таблицю на поточній сторінці
            renderPaginationButtons();     // ⑥ Малює кнопки пагінації
        })
        .catch(error => {                  // ⑦ Обробка помилки
            console.error("Помилка при завантаженні студентів:", error);
        });
}


document.addEventListener("DOMContentLoaded", function () {
    const mainCheckbox = document.getElementById("selectAll");
    if (mainCheckbox) {
        mainCheckbox.addEventListener("change", () => {
            const rowCheckboxes = document.querySelectorAll(".rowCheckbox");
            rowCheckboxes.forEach(cb => {
                cb.checked = mainCheckbox.checked;
                toggleRowButtons(cb);
            });
            updateSelectAllCheckbox();
        });
    }
});


function renderPage(pageNumber) {
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = "";

    const start = (pageNumber - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageStudents = studentsData.slice(start, end);

    pageStudents.forEach(student => {
        const row = document.createElement('tr');
        row.setAttribute("data-id", student.id);
        row.innerHTML = `
            <td><input type="checkbox" class="rowCheckbox"></td>
            <td>${student.group_name}</td>
            <td>${student.name} ${student.surname}</td>
            <td>${student.gender}</td>
            <td>${student.birthday}</td>
            <td class="status">
              <span class="status-dot ${student.status === 'active' ? 'green' : 'gray'}"></span>
            </td>
            <td class="option">
                <img src="edit.png" alt="Edit" class="edit-btn" disabled>
                <img src="delete.png" alt="Delete" class="delete-btn" disabled>
            </td>
        `;
        tbody.appendChild(row);

        const editBtn = row.querySelector('.edit-btn');
        const deleteBtn = row.querySelector('.delete-btn');
        const checkbox = row.querySelector('.rowCheckbox');

        if (editBtn) {
            editBtn.addEventListener('click', () => editRow(editBtn));
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteRow(deleteBtn));
        }

        if (checkbox) {
            checkbox.addEventListener('change', () => {
                toggleRowButtons(checkbox);
                updateSelectAllCheckbox();
            });
        }
    });

    updateSelectAllCheckbox();
}


function renderPaginationButtons() {
    const totalPages = Math.ceil(studentsData.length / rowsPerPage);
    const pagesContainer = document.querySelector(".pages");
    pagesContainer.innerHTML = `<button onclick="changePage(-1)">&lt;</button>`;

    for (let i = 1; i <= totalPages; i++) {
        pagesContainer.innerHTML += `<button class="page-btn${i === currentPage ? ' active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    pagesContainer.innerHTML += `<button onclick="changePage(1)">&gt;</button>`;
}

function updatePaginationButtons() {
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.textContent) === currentPage) {
            btn.classList.add('active');
        }
    });
}


function updateButtons() {
    const checkboxes = Array.from(document.querySelectorAll('.rowCheckbox'));
    const anyChecked = checkboxes.some(cb => cb.checked);
    checkboxes.forEach(cb => toggleRowButtons(cb));
}


function updateSelectAllCheckbox() {
    const rowCheckboxes = document.querySelectorAll(".rowCheckbox");
    const mainCheckbox = document.getElementById("selectAll");
    if (!rowCheckboxes.length) {
        mainCheckbox.checked = false;
        mainCheckbox.indeterminate = false;
        return;
    }
    const total = rowCheckboxes.length;
    const checkedCount = [...rowCheckboxes].filter(cb => cb.checked).length;

    mainCheckbox.checked = (checkedCount === total);
    mainCheckbox.indeterminate = (checkedCount > 0 && checkedCount < total);
}



function handleOk() {
    const form = document.getElementById("studentForm");
    if (form) form.dispatchEvent(new Event("submit"));
}

function closeConfirmModal() {
    const modal = document.getElementById("confirmDeleteModal");
    if (modal) modal.style.display = "none";
}

function showConfirmDelete(row = null) {
    const modal = document.getElementById("confirmDeleteModal");
    const confirmMessage = document.getElementById("confirmMessage");

    if (row) {
        const fullName = row.cells[2].textContent.trim();
        window.studentsToDelete = [{ id: row.getAttribute("data-id"), name: fullName }];
        confirmMessage.innerHTML = `Are you sure you want to delete student <strong>${fullName}</strong>?`;
    } else {
        const checkedRows = Array.from(document.querySelectorAll(".rowCheckbox:checked"));
        window.studentsToDelete = checkedRows.map(cb => {
            const tr = cb.closest("tr");
            return {
                id: tr.getAttribute("data-id"),
                name: tr.cells[2].textContent.trim()
            };
        });

        if (studentsToDelete.length === 0) {
            alert("No students selected for deletion.");
            return;
        }

        if (studentsToDelete.length === 1) {
            confirmMessage.innerHTML = `Are you sure you want to delete student <strong>${studentsToDelete[0].name}</strong>?`;
        } else {
            const namesList = studentsToDelete.map(s => `<strong>${s.name}</strong>`).join(", ");
            confirmMessage.innerHTML = `Are you sure you want to delete the following students: ${namesList}?`;
        }
    }

    modal.style.display = "block";
}


window.confirmDelete = async function () {
    if (!studentsToDelete || studentsToDelete.length === 0) {
        alert("Немає студентів для видалення");
        return;
    }

    try {
        const response = await fetch('delete_students.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ids: studentsToDelete.map(s => s.id) })
        });

        const result = await response.json();
        if (result.success) {
            closeConfirmModal();
            loadStudents();
        } else {
            alert("Помилка: " + (result.error || "Невідомо"));
        }
    } catch (error) {
        console.error(error);
        alert("Серверна помилка.");
    }
};

window.deleteRow = function (btn) {
    const row = btn.closest("tr");

    const checkbox = row.querySelector(".rowCheckbox");

    if (checkbox && checkbox.checked) {        
        showConfirmDelete(); 
    } else {
        alert("Виберіть студента, щоб видалити його!");
    }
};


document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("addStudent");
    const studentForm = document.getElementById("studentForm");
    const okButton = document.querySelector(".btn-ok");
    const closeButtons = document.querySelectorAll(".close");

    if (okButton) {
        okButton.addEventListener("click", handleOk);
    }

    closeButtons.forEach(btn => btn.addEventListener("click", closeModal));

    if (studentForm) {
        studentForm.addEventListener("submit", async function (e) {
            e.preventDefault();

            const isEditing = document.getElementById("submitStudent").getAttribute("data-editing") === "true";
            const studentId = document.getElementById("studentId").value;

            const formData = {
                group: document.getElementById('group').value,
                name: document.getElementById('name').value.trim(),
                surname: document.getElementById('surname').value.trim(),
                gender: document.getElementById('gender').value,
                birthday: document.getElementById('birthday').value
            };

            if (isEditing) formData.id = studentId;
            const url = isEditing ? 'update_student.php' : 'add_student.php';

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (!response.ok) {
                    displayErrors(result.errors || result.error || "Validation failed");
                    return;
                }

                closeModal();
                studentForm.reset();
                loadStudents();
            } catch (error) {
                console.error('Error:', error);
                alert("Server error");
            }
        });
    }

    loadStudents();
});

function changePage(step) {
    const totalPages = Math.ceil(studentsData.length / rowsPerPage);
    const newPage = currentPage + step;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        renderPage(currentPage);
        updatePaginationButtons();
    }
}

function goToPage(pageNumber) {
    const totalPages = Math.ceil(studentsData.length / rowsPerPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
        currentPage = pageNumber;
        renderPage(currentPage);
        updatePaginationButtons();
    }
}


// Глобальні прив'язки
window.handleOk = handleOk;
window.openModal = openModal;
window.closeModal = closeModal;
window.displayErrors = displayErrors;
window.loadStudents = loadStudents;
window.editRow = editRow;








/*
 document.addEventListener('DOMContentLoaded', () => {
        
    /*if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("Service Worker registration failed", err));
  } */

      
      /*
function clearNotificationIndicator(){
    var indicator = document.getElementById("notificationInd");
    if(indicator){
        indicator.style.display = "none";
    }
}

function doubleClickOnBell(){  
    var bellIcon = document.getElementById("bellIcon");
    var notificationInd = document.getElementById("notificationInd");

    bellIcon.classList.add("shake-animation");

    setTimeout(function() {
        notificationInd.style.display = "block";
    }, 500);
}

const bellIcon = document.getElementById("bellIcon");
if (bellIcon) {
    bellIcon.addEventListener("dblclick", doubleClickOnBell);
}

var currentPage = window.location.pathname.split("/").pop();
var navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(function(link){
    if(link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
}) ;


var modal = document.getElementById("addStudent");


// Додаємо обробник для відключення стандартної валідації
document.getElementById('studentForm').addEventListener('invalid', function(e) {
    e.preventDefault(); // Відключаємо стандартну валідацію
}, true);

// Додаємо setCustomValidity для всіх полів, щоб прибрати стандартні повідомлення
document.querySelectorAll('#studentForm input, #studentForm select').forEach(input => {
    input.addEventListener('invalid', function(e) {
        e.target.setCustomValidity(''); // Очищаємо стандартне повідомлення
    });
    input.addEventListener('input', function(e) {
        e.target.setCustomValidity(''); // Очищаємо повідомлення при введенні
    });
});

/*
function validateForm() {
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error-message').forEach(error => error.textContent = '');
    document.querySelectorAll('input, select').forEach(input => {
        input.classList.remove('error');
    });

    // Validate group
    const group = document.getElementById('group');
    if (!group.value) {
        isValid = false;
        group.classList.add('error');
        document.getElementById('group-error').textContent = 'Please select a group';
    }

    // Validate first name
    const name = document.getElementById('name');
    const namePattern = /^[A-Za-z]+([A-Za-z'-]*[A-Za-z]+)*$/;
    if (!name.value) {
        isValid = false;
        name.classList.add('error');
        document.getElementById('name-error').textContent = 'Please enter a first name';
    } else if (!namePattern.test(name.value) || name.value.length < 2) {
        isValid = false;
        name.classList.add('error');
        document.getElementById('name-error').textContent = 'First name must contain only letters, apostrophes, or hyphens and be at least 2 characters long';
    }

    // Validate last name
    const surname = document.getElementById('surname');
    if (!surname.value) {
        isValid = false;
        surname.classList.add('error');
        document.getElementById('surname-error').textContent = 'Please enter a last name';
    } else if (!namePattern.test(surname.value) || surname.value.length < 2) {
        isValid = false;
        surname.classList.add('error');
        document.getElementById('surname-error').textContent = 'Last name must contain only letters, apostrophes, or hyphens and be at least 2 characters long';
    }

    // Validate gender
    const gender = document.getElementById('gender');
    if (!gender.value) {
        isValid = false;
        gender.classList.add('error');
        document.getElementById('gender-error').textContent = 'Please select a gender';
    }

    // Validate birthday
    const birthday = document.getElementById('birthday');
    const minDate = new Date('1970-01-01');
    const maxDate = new Date('2010-01-01');
    const selectedDate = new Date(birthday.value);
    
    if (!birthday.value) {
        isValid = false;
        birthday.classList.add('error');
        document.getElementById('birthday-error').textContent = 'Please select a birth date';
    } else if (selectedDate < minDate || selectedDate > maxDate) {
        isValid = false;
        birthday.classList.add('error');
        document.getElementById('birthday-error').textContent = 'Please select a date between 1970-01-01 and 2010-01-01';
    }

    return isValid;
}

*/


/*
// Обробник кнопки OK
function handleOk() {
    if (validateForm()) {
        console.log('OK натиснуто, форма валідна');
        closeModal();
    }
}
    */

/*
function submitStudent(event) {
    event.preventDefault();

    if (!validateForm()) {
        return; // Зупиняємо, якщо валідація не пройдена
    }

    const studentId = document.getElementById("studentId").value;
    const group = document.getElementById("group").value;
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const gender = document.getElementById("gender").value;
    const birthday = document.getElementById("birthday").value;
    const isEditing = document.getElementById("submitStudent").getAttribute("data-editing") === "true";

    const table = document.querySelector("table tbody");

    if (isEditing) {
        const rowIndex = document.getElementById("submitStudent").getAttribute("data-row-index");
        const row = table.rows[rowIndex];

        // Зберігаємо початкові дані перед редагуванням
        const originalData = {
            studentId: row.getAttribute("data-id"),
            group: row.cells[1].textContent.trim(),
            fullName: row.cells[2].textContent.trim(),
            gender: row.cells[3].textContent.trim(),
            birthday: row.cells[4].textContent.trim()
        };

        // Оновлюємо таблицю
        row.cells[1].innerHTML = `<b>${group}</b>`;
        row.cells[2].innerHTML = `<b>${name} ${surname}</b>`;
        row.cells[3].innerHTML = gender;
        row.cells[4].innerHTML = `<b>${birthday}</b>`;
        row.setAttribute("data-id", studentId);

        // Формуємо нові дані
        const updatedData = {
            studentId,
            group,
            fullName: `${name} ${surname}`,
            gender,
            birthday
        };

        // Порівнюємо і виводимо зміни у JSON
        const changes = {};
        for (const key in originalData) {
            if (originalData[key] !== updatedData[key]) {
                changes[key] = {
                    oldValue: originalData[key],
                    newValue: updatedData[key]
                };
            }
        }

        if (Object.keys(changes).length > 0) {
            console.log("Змінені дані студента:", JSON.stringify(changes, null, 2));
        } else {
            console.log("Дані студента не змінено.");
        }
    } else {
        let emptyRow = null;
        for (let i = 2; i < table.rows.length; i++) {
            if (table.rows[i].cells[1].innerHTML.trim() === "") {
                emptyRow = table.rows[i];
                break;
            }
        }

        if (!emptyRow) {
            emptyRow = table.insertRow();
            for (let j = 0; j < 7; j++) {
                emptyRow.insertCell(j);
            }
        }

        emptyRow.innerHTML = "";
        const rowIndex = emptyRow.rowIndex;
        const checkboxId = `rowCheckbox${rowIndex}`;
        const newId = Date.now().toString();

        emptyRow.setAttribute("data-id", newId);
        emptyRow.innerHTML = `
            <td><input type="checkbox" id="${checkboxId}" class="rowCheckbox"><label for="${checkboxId}" class="sr-only">Select ${name} ${surname}</label></td>
            <td><b>${group}</b></td>
            <td><b>${name} ${surname}</b></td>
            <td>${gender}</td>
            <td><b>${birthday}</b></td>
            <td class="status"><span class="status-dot gray"></span></td>
            <td class="option">
                <img src="edit.png" alt="Edit Icon" class="edit-btn" onclick="editRow(this)">
                <img src="delete.png" alt="Delete Icon" class="delete-btn" onclick="deleteSelected()">
            </td>
        `;

        const newCheckbox = emptyRow.querySelector(".rowCheckbox");
        newCheckbox.addEventListener("change", handleCheckboxChange);
        if (document.getElementById("selectAll").checked) {
            newCheckbox.checked = true;
            toggleRowButtons(newCheckbox);
        }
    }

    closeModal();
    updateButtons();
    updateSelectAllCheckbox();
    attachCheckboxListeners();
} */
/*
function handleOk() {
    const group = document.getElementById("group").value;
    const name = document.getElementById("name").value;
    const surname = document.getElementById("surname").value;
    const gender = document.getElementById("gender").value;
    const birthday = document.getElementById("birthday").value;

    if (!group || !name || !surname || !gender || !birthday || !validateForm()) {
        closeModal(); // Закриваємо модальне вікно, якщо поля не заповнені
    } else {
        document.getElementById("studentForm").dispatchEvent(new Event("submit")); // Викликаємо подію submit
    }
}

function closeModal(){
    modal.style.display = "none";
}

window.onclick = function(event){
    if(event.target == modal) {
        modal.style.display = "none";
    }
};

*/
/*
function changePage(step) {
    let activePage = document.querySelector('.page-btn.active');
    let newPage = parseInt(activePage.innerText) + step;
    if (newPage >= 1 && newPage <= 4) {
        goToPage(newPage);
    }
}

function goToPage(pageNumber) {
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector('.page-btn:nth-child(' + (pageNumber + 1) + ')').classList.add('active');    
}


document.addEventListener("DOMContentLoaded", function() {
    const selectAllCheckbox = document.getElementById("selectAll");
    const deleteButtons = document.querySelectorAll(".delete-btn"); 
    const editButtons = document.querySelectorAll(".edit-btn");     
    const modal = document.getElementById("addStudent");
    const okButton = document.querySelector(".btn-ok");
    const createButton = document.querySelector(".btn-create");
    const confirmModal = document.getElementById("confirmDeleteModal");
    const userNameSpan = document.getElementById("userName");

    if (!confirmModal || !userNameSpan) {
        console.error("Confirm modal or userNameSpan not found!");
        return;
    }

    function getRowCheckboxes() {
        return document.querySelectorAll(".rowCheckbox");
    }

    function updateButtons() {
        const checkboxes = document.querySelectorAll('.rowCheckbox');
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);
        const editBtns = document.querySelectorAll('.edit-btn');
        const deleteBtns = document.querySelectorAll('.delete-btn');
    
        editBtns.forEach(btn => btn.disabled = !anyChecked);
        deleteBtns.forEach(btn => btn.disabled = !anyChecked);
    }
    
    window.updateButtons = updateButtons;
    

    function updateSelectAllCheckbox() {
        const allCheckboxes = getRowCheckboxes();
        const allChecked = allCheckboxes.length > 0 && Array.from(allCheckboxes).every(checkbox => checkbox.checked);
        const someChecked = allCheckboxes.length > 0 && Array.from(allCheckboxes).some(checkbox => checkbox.checked);
        selectAllCheckbox.checked = allChecked;
        selectAllCheckbox.indeterminate = !allChecked && someChecked;
    }

    // Вибір усіх чекбоксів при зміні головного
    selectAllCheckbox.addEventListener("change", function() {
        const allCheckboxes = getRowCheckboxes();
        allCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
            toggleRowButtons(checkbox);
        });
        updateButtons();
    });

    // Оновлення стану кнопок у кожному рядку
    function attachCheckboxListeners() {
        const allCheckboxes = getRowCheckboxes();
        allCheckboxes.forEach(checkbox => {
            checkbox.removeEventListener("change", handleCheckboxChange);
            checkbox.addEventListener("change", handleCheckboxChange);
        });
    }

    function handleCheckboxChange() {
        toggleRowButtons(this);
        updateButtons();
        updateSelectAllCheckbox();
    }

    function toggleRowButtons(checkbox) {
        const row = checkbox.closest("tr");
        const editBtn = row.querySelector(".edit-btn");
        const deleteBtn = row.querySelector(".delete-btn");

        if (editBtn && deleteBtn) {
            if (checkbox.checked) {
                editBtn.removeAttribute("disabled");
                deleteBtn.removeAttribute("disabled");
            } else {
                editBtn.setAttribute("disabled", "true");
                deleteBtn.setAttribute("disabled", "true");
            }
        }
    }

    // Відкриття модального вікна для підтвердження видалення
    function showConfirmDelete(row) {
        if (!row) return;
        const nameCell = row.querySelector("td:nth-child(3)"); // Індекс колонки з ім'ям
        const fullName = nameCell ? nameCell.textContent.trim() : "Unknown";
        userNameSpan.textContent = fullName;
        confirmModal.style.display = "block";
        window.currentRow = row; // Зберігаємо поточний рядок для подальшого видалення
    }

    // Закриття модального вікна підтвердження
    window.closeConfirmModal = function() {
        confirmModal.style.display = "none";
        delete window.currentRow; 
    };

    // Підтвердження видалення
    window.confirmDelete = function() {
        if (window.currentRow) {
            window.currentRow.closest("tr").remove();
            closeConfirmModal();
            updateButtons();
            updateSelectAllCheckbox();
            attachCheckboxListeners();
        }
    };

    
    // Видалення одного студента через кнопку в таблиці
    window.deleteRow = function(btn) {
        const row = btn.closest("tr");
        const checkbox = row.querySelector(".rowCheckbox");
        if (checkbox && checkbox.checked) {
            showConfirmDelete(row); // Показуємо модальне вікно лише якщо чекбокс вибрано
        } else {
            alert("Виберіть студента, щоб видалити його!");
        }
    };

    
    //document.getElementById("studentForm").addEventListener("submit", submitStudent);    

    // Функція для перемикання сайдбару
    window.toggleSidebar = function() {
        const sidebar = document.querySelector(".sidebar");
        sidebar.classList.toggle("active");
    };

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        } else if (event.target == confirmModal) {
            closeConfirmModal();
        }
    };


    attachCheckboxListeners();
    updateButtons();
    updateSelectAllCheckbox();
    }
);


// Check if user is logged in
document.addEventListener('DOMContentLoaded', function () {
    fetch('index.php?action=check_login', { method: 'GET' })
        .then(response => response.json())
        .then(data => {
            const isLoggedIn = data.isLoggedIn;
            const userName = data.userName || '';

            // Elements to show/hide based on login status
            const loginBtn = document.querySelector('.login-btn');
            const bellIcon = document.querySelector('#bellIcon');
            const profileContainer = document.querySelector('.profile-container');
            const addStudentBtn = document.querySelector('.add-student-btn');
            const editButtons = document.querySelectorAll('.edit-btn');
            const deleteButtons = document.querySelectorAll('.delete-btn');
            const taskLink = document.querySelector('a[href="tasks.html"]');
            const messageLink = document.querySelector('a[href="messages.html"]');
            const profileName = document.querySelector('.profile-name');

            if (isLoggedIn) {
                // Show elements for logged-in users
                if (loginBtn) loginBtn.style.display = 'none';
                if (bellIcon) bellIcon.style.display = 'block';
                if (profileContainer) profileContainer.style.display = 'block';
                if (addStudentBtn) addStudentBtn.style.display = 'block';
                if (editButtons) editButtons.forEach(btn => btn.style.display = 'block');
                if (deleteButtons) deleteButtons.forEach(btn => btn.style.display = 'block');
                if (taskLink) taskLink.style.pointerEvents = 'auto';
                if (messageLink) messageLink.style.pointerEvents = 'auto';
                if (profileName) profileName.textContent = userName;
            } else {
                // Hide elements for non-logged-in users
                if (loginBtn) loginBtn.style.display = 'block';
                if (bellIcon) bellIcon.style.display = 'none';
                if (profileContainer) profileContainer.style.display = 'none';
                if (addStudentBtn) addStudentBtn.style.display = 'none';
                if (editButtons) editButtons.forEach(btn => btn.style.display = 'none');
                if (deleteButtons) deleteButtons.forEach(btn => btn.style.display = 'none');
                if (taskLink) taskLink.style.pointerEvents = 'none';
                if (messageLink) messageLink.style.pointerEvents = 'none';
            }
        })
        .catch(error => console.error('Error checking login status:', error));
});


document.querySelector('.login-btn').addEventListener('click', () => {
    document.getElementById('loginModal').style.display = 'block';
});

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}
 

document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("addStudent");
    const studentForm = document.getElementById("studentForm");
    const okButton = document.querySelector(".btn-ok");
    const closeButtons = document.querySelectorAll(".close");

    // Прив’язка кнопки OK
    if (okButton) {
        okButton.addEventListener("click", handleOk);
    }

    // Прив’язка кнопок закриття
    closeButtons.forEach(btn => {
        btn.addEventListener("click", closeModal);
    });

    // Обробник надсилання форми
    studentForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = {
            group: document.getElementById('group').value,
            name: document.getElementById('name').value.trim(),
            surname: document.getElementById('surname').value.trim(),
            gender: document.getElementById('gender').value,
            birthday: document.getElementById('birthday').value
        };

        try {
            const response = await fetch('add_student.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                displayErrors(result.errors || result.error || "Validation failed");
                return;
            }

            closeModal();
            studentForm.reset();
            loadStudents();
        } catch (error) {
            console.error('Error:', error);
            alert("Server error");
        }
    });

    loadStudents(); // початкове завантаження таблиці
});

function displayErrors(errors) {
    const fields = ['name', 'surname', 'group', 'gender', 'birthday'];
    fields.forEach(field => {
        const errorEl = document.getElementById(`${field}-error`);
        if (errorEl) errorEl.textContent = errors[field] || '';
    });

    if (errors.duplicate) {
        alert(errors.duplicate);
    } else if (typeof errors === 'string') {
        alert(errors);
    }
}

function loadStudents() {
    fetch('get_students.php')
        .then(response => response.json())
        .then(students => {
            const tbody = document.querySelector('#studentsTable tbody');
            tbody.innerHTML = "";
            students.forEach((student, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" class="rowCheckbox"></td>
                    <td>${student.group_name}</td>
                    <td>${student.name} ${student.surname}</td>
                    <td>${student.gender}</td>
                    <td>${student.birthday}</td>
                    <td class="status"><span class="status-dot ${student.status === 'active' ? 'green' : 'gray'}"></span></td>
                    <td class="option">
                        <img src="edit.png" alt="Edit" class="edit-btn">
                        <img src="delete.png" alt="Delete" class="delete-btn">
                    </td>
                `;
                tbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Помилка при завантаженні студентів:", error);
        });
}

function handleOk() {
    document.getElementById("studentForm").dispatchEvent(new Event("submit"));
    if (!formData.group || !formData.name || !formData.surname || !formData.gender || !formData.birthday) {
        closeModal();
        return;
    }
}

function closeModal() {
    const modal = document.getElementById("addStudent");
    modal.style.display = "none";
}

// Глобальні прив'язки (на всяк випадок для onclick з HTML)
window.handleOk = handleOk;
window.closeModal = closeModal;
window.displayErrors = displayErrors;
window.loadStudents = loadStudents;
// Додаємо функції до глобального об'єкта
window.editRow = editRow;
window.deleteSelected = deleteSelected;
window.openModal = openModal;

 })
*/