if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("Service Worker registration failed", err));
  }

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

document.getElementById("bellIcon").addEventListener("dblclick", doubleClickOnBell);

var currentPage = window.location.pathname.split("/").pop();
var navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach(function(link){
    if(link.getAttribute("href") === currentPage) {
        link.classList.add("active");
    }
}) ;


var modal = document.getElementById("addStudent");

function openModal(editingRow = null) {
    const modalTitle = document.getElementById("modalTitle");
    const submitButton = document.getElementById("submitStudent");
    const studentIdField = document.getElementById("studentId");

    if (editingRow) {
        // Редагування студента
        modalTitle.textContent = "Edit student";
        submitButton.textContent = "Save";
        submitButton.setAttribute("data-editing", "true");
        submitButton.setAttribute("data-row-index", editingRow.rowIndex);

        // Заповнення полів форми
        const studentId = editingRow.getAttribute("data-id") || editingRow.rowIndex; 
        studentIdField.value = studentId;
        document.getElementById("group").value = editingRow.cells[1].textContent.trim();
        const fullName = editingRow.cells[2].textContent.trim().split(" ");
        document.getElementById("name").value = fullName[0] || "";
        document.getElementById("surname").value = fullName[1] || "";
        document.getElementById("gender").value = editingRow.cells[3].textContent.trim();
        document.getElementById("birthday").value = editingRow.cells[4].textContent.trim();
    } else {
        // Додавання нового студента
        modalTitle.textContent = "Add student";
        submitButton.textContent = "Create";
        submitButton.removeAttribute("data-editing");
        submitButton.removeAttribute("data-row-index");

        // Очистка полів
        studentIdField.value = ""; // Очищаємо id
        document.getElementById("group").value = "";
        document.getElementById("name").value = "";
        document.getElementById("surname").value = "";
        document.getElementById("gender").value = "";
        document.getElementById("birthday").value = "";
    }

    modal.style.display = "block";
}

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


// Обробник submit форми
document.getElementById('studentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (validateForm()) {
        console.log('Форма валідна, відправляємо...');
        // closeModal(); // Закрити модалку після успішної валідації
    }
});

// Обробник кнопки OK
function handleOk() {
    if (validateForm()) {
        console.log('OK натиснуто, форма валідна');
        closeModal();
    }
}


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
}

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
        const checkedRows = document.querySelectorAll(".rowCheckbox:checked");
        deleteButtons.forEach(btn => btn.disabled = checkedRows.length === 0);
        editButtons.forEach(btn => btn.disabled = checkedRows.length !== 1);
    }

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

    // Видалення вибраних студентів
    window.deleteSelected = function() {
        const checkedRows = document.querySelectorAll(".rowCheckbox:checked");
        if (checkedRows.length > 0) {
            if (checkedRows.length > 1) {
                // Якщо вибрано більше одного рядка, видаляємо всі одразу
                checkedRows.forEach(checkbox => checkbox.closest("tr").remove());
                updateButtons();
                updateSelectAllCheckbox();
                attachCheckboxListeners();
            } else {
                // Якщо вибрано один рядок, показуємо модальне вікно
                const firstCheckedRow = checkedRows[0].closest("tr");
                showConfirmDelete(firstCheckedRow);
            }
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

    window.editRow = function(btn) {
        const row = btn.closest("tr");
        const checkbox = row.querySelector(".rowCheckbox");
        if (checkbox && checkbox.checked) {
            openModal(row); // Відкриваємо форму редагування лише якщо чекбокс вибрано
        } else {
            alert("Виберіть студента, щоб редагувати його!");
        }
    };

    document.getElementById("studentForm").addEventListener("submit", submitStudent);    

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

document.getElementById('loginForm').addEventListener('submit', function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    fetch('index.php?page=login', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    })
    .catch(() => {
        document.getElementById('loginError').style.display = 'block';
    });
});


// logout

document.addEventListener("DOMContentLoaded", function () {
    fetch('header.html')
        .then(res => res.text())
        .then(html => {
            document.getElementById('header-container').innerHTML = html;
            console.log("Header loaded");

            const logoutBtn = document.getElementById("logoutBtn");
            if (logoutBtn) {
                console.log("Logout button found");
                logoutBtn.addEventListener("click", function () {
                    console.log("Logout clicked");
                    fetch('index.php?page=logout')
                        .then(() => {
                            document.querySelector(".container").style.display = "none";
                            logoutBtn.style.display = "none";
                            const loginModal = document.getElementById("loginModal");
                            if (loginModal) loginModal.style.display = "block";
                        })
                        .catch(error => console.error('Logout failed:', error));
                });
            } else {
                console.warn("Logout button not found after inserting header");
            }
        });
});



