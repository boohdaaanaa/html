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

function openModal(){
    modal.style.display = "block";
}

function closeModal(){
    modal.style.display = "none";
}

window.onclick = function(event){
    if(event.target == modal) {
        modal.style.display = "none";
    }
}


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
    const deleteButtons = document.querySelectorAll(".delete-btn"); // Використовуємо клас замість ID
    const editButtons = document.querySelectorAll(".edit-btn");     // Використовуємо клас замість ID
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
        delete window.currentRow; // Очищаємо посилання на рядок
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
        showConfirmDelete(row); // Показуємо модальне вікно перед видаленням
    };

    // Редагування одного вибраного студента
    window.editRow = function(btn) {
        const row = btn.closest("tr");
        const checkbox = row.querySelector(".rowCheckbox");
        if (checkbox.checked) {
            openModal();
        }
    };

    // Додавання нового студента через кнопку "Create"
    window.createStudent = function(event) {
        event.preventDefault();

        var group = document.getElementById("group").value;
        var name = document.getElementById("name").value;
        var surname = document.getElementById("surname").value;
        var gender = document.getElementById("gender").value;
        var birthday = document.getElementById("birthday").value;

        if (!group || !name || !surname || !gender || !birthday) {
            alert("All fields must be filled!");
            return;
        }

        var table = document.querySelector("table tbody");
        var newRow = table.insertRow(3);

        var checkboxCell = newRow.insertCell(0);
        var groupCell = newRow.insertCell(1);
        var nameCell = newRow.insertCell(2);
        var genderCell = newRow.insertCell(3);
        var birthdayCell = newRow.insertCell(4);
        var statusCell = newRow.insertCell(5);
        var optionCell = newRow.insertCell(6);

        statusCell.classList.add("status");
        optionCell.classList.add("option");

        checkboxCell.innerHTML = '<input type="checkbox" class="rowCheckbox">';
        groupCell.innerHTML = `<b>${group}</b>`;
        nameCell.innerHTML = `<b>${name} ${surname}</b>`;
        genderCell.innerHTML = gender;
        birthdayCell.innerHTML = `<b>${birthday}</b>`;
        statusCell.innerHTML = '<span class="status-dot gray"></span>';
        optionCell.innerHTML = `
            <img src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png" title="Edit" class="edit-btn" onclick="openModal()" disabled>
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" title="Delete" class="delete-btn" onclick="deleteSelected()" disabled>
        `;

        const newCheckbox = checkboxCell.querySelector(".rowCheckbox");
        newCheckbox.addEventListener("change", handleCheckboxChange);

        if (selectAllCheckbox.checked) {
            newCheckbox.checked = true;
            toggleRowButtons(newCheckbox);
        }

        closeModal();
        updateButtons();
        updateSelectAllCheckbox();
        attachCheckboxListeners();
    };

    // Додавання нового студента через кнопку "OK"
    window.okStudent = function(event) {
        event.preventDefault();

        var group = document.getElementById("group").value;
        var name = document.getElementById("name").value;
        var surname = document.getElementById("surname").value;
        var gender = document.getElementById("gender").value;
        var birthday = document.getElementById("birthday").value;

        if (group && name && surname && gender && birthday) {
            var table = document.querySelector("table tbody");
            var newRow = table.insertRow(3);

            var checkboxCell = newRow.insertCell(0);
            var groupCell = newRow.insertCell(1);
            var nameCell = newRow.insertCell(2);
            var genderCell = newRow.insertCell(3);
            var birthdayCell = newRow.insertCell(4);
            var statusCell = newRow.insertCell(5);
            var optionCell = newRow.insertCell(6);

            statusCell.classList.add("status");
            optionCell.classList.add("option");

            checkboxCell.innerHTML = '<input type="checkbox" class="rowCheckbox">';
            groupCell.innerHTML = `<b>${group}</b>`;
            nameCell.innerHTML = `<b>${name} ${surname}</b>`;
            genderCell.innerHTML = gender;
            birthdayCell.innerHTML = `<b>${birthday}</b>`;
            statusCell.innerHTML = '<span class="status-dot gray"></span>';
            optionCell.innerHTML = `
                <img src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png" title="Edit" class="edit-btn" onclick="openModal()" disabled>
                <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" title="Delete" class="delete-btn" onclick="deleteSelected()" disabled>
            `;

            const newCheckbox = checkboxCell.querySelector(".rowCheckbox");
            newCheckbox.addEventListener("change", handleCheckboxChange);

            if (selectAllCheckbox.checked) {
                newCheckbox.checked = true;
                toggleRowButtons(newCheckbox);
            }

            closeModal();
            updateButtons();
            updateSelectAllCheckbox();
            attachCheckboxListeners();
        }
    };

    function openModal() {
        modal.style.display = "block";
    }

    function closeModal() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        } else if (event.target == confirmModal) {
            closeConfirmModal();
        }
    };

    createButton.addEventListener("click", createStudent);
    okButton.addEventListener("click", okStudent);

    attachCheckboxListeners();
    updateButtons();
    updateSelectAllCheckbox();
});

