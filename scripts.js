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
            var emptyRow = null;
                
            for (var i = 2; i < table.rows.length; i++) {
                var cells = table.rows[i].cells;
                if (cells.length > 1 && cells[1].innerHTML.trim() === "") {
                    emptyRow = table.rows[i];
                    break;
                }
            }
                
            if (!emptyRow) {
                emptyRow = table.insertRow();
                for (var j = 0; j < 7; j++) {
                    emptyRow.insertCell(j);
                }
            }
    
            emptyRow.innerHTML = ""; 
    
            var checkboxCell = emptyRow.insertCell(0);
            var groupCell = emptyRow.insertCell(1);
            var nameCell = emptyRow.insertCell(2);
            var genderCell = emptyRow.insertCell(3);
            var birthdayCell = emptyRow.insertCell(4);
            var statusCell = emptyRow.insertCell(5);
            var optionCell = emptyRow.insertCell(6);
    
            statusCell.classList.add("status");
            optionCell.classList.add("option");
    
            var rowIndex = emptyRow.rowIndex; 
            var checkboxId = `rowCheckbox${rowIndex}`;
    
            checkboxCell.innerHTML = `
                <input type="checkbox" id="${checkboxId}" class="rowCheckbox">
                <label for="${checkboxId}" class="sr-only">Select ${name} ${surname}</label>
            `;
    
            groupCell.innerHTML = `<b>${group}</b>`;
            nameCell.innerHTML = `<b>${name} ${surname}</b>`;
            genderCell.innerHTML = gender;
            birthdayCell.innerHTML = `<b>${birthday}</b>`;
            statusCell.innerHTML = '<span class="status-dot gray"></span>';
            optionCell.innerHTML = `
                <img src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png" title="Edit" class="edit-btn" onclick="openModal()">
                <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" title="Delete" class="delete-btn" onclick="deleteSelected()">
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
    window.okStudent = function (event) {
        event.preventDefault();
    
        var group = document.getElementById("group").value;
        var name = document.getElementById("name").value;
        var surname = document.getElementById("surname").value;
        var gender = document.getElementById("gender").value;
        var birthday = document.getElementById("birthday").value;
    
        if (group && name && surname && gender && birthday) {
            var table = document.querySelector("table tbody");
            var emptyRow = null;
                
            for (var i = 2; i < table.rows.length; i++) {
                var cells = table.rows[i].cells;
                if (cells.length > 1 && cells[1].innerHTML.trim() === "") {
                    emptyRow = table.rows[i];
                    break;
                }
            }    
            
            if (!emptyRow) {
                emptyRow = table.insertRow();
                for (var j = 0; j < 7; j++) {
                    emptyRow.insertCell(j);
                }
            }
    
            emptyRow.innerHTML = ""; 
    
            var checkboxCell = emptyRow.insertCell(0);
            var groupCell = emptyRow.insertCell(1);
            var nameCell = emptyRow.insertCell(2);
            var genderCell = emptyRow.insertCell(3);
            var birthdayCell = emptyRow.insertCell(4);
            var statusCell = emptyRow.insertCell(5);
            var optionCell = emptyRow.insertCell(6);
    
            statusCell.classList.add("status");
            optionCell.classList.add("option");
    
            var rowIndex = emptyRow.rowIndex;
            var checkboxId = `rowCheckbox${rowIndex}`;
    
            checkboxCell.innerHTML = `
                <input type="checkbox" id="${checkboxId}" class="rowCheckbox">
                <label for="${checkboxId}" class="sr-only">Select ${name} ${surname}</label>
            `;
    
            groupCell.innerHTML = `<b>${group}</b>`;
            nameCell.innerHTML = `<b>${name} ${surname}</b>`;
            genderCell.innerHTML = gender;
            birthdayCell.innerHTML = `<b>${birthday}</b>`;
            statusCell.innerHTML = '<span class="status-dot gray"></span>';
            optionCell.innerHTML = `
                <img src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png" title="Edit" class="edit-btn" onclick="openModal()">
                <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" title="Delete" class="delete-btn" onclick="deleteSelected()">
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

    createButton.addEventListener("click", createStudent);
    okButton.addEventListener("click", okStudent);

    attachCheckboxListeners();
    updateButtons();
    updateSelectAllCheckbox();
    }
);

