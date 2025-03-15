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
    const deleteButton = document.getElementById("delete-btn");
    const editButton = document.getElementById("edit-btn");
    const modal = document.getElementById("addStudent");
    const okButton = document.querySelector(".btn-ok");
    const createButton = document.querySelector(".btn-create");

    function getRowCheckboxes() {
        return document.querySelectorAll(".rowCheckbox");
    }

    function updateButtons() {
        const checkedRows = document.querySelectorAll(".rowCheckbox:checked");
        deleteButton.disabled = checkedRows.length === 0;
        editButton.disabled = checkedRows.length !== 1;
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
            // Видаляємо попередні слухачі, щоб уникнути дублювання
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

        if (editBtn && deleteBtn) { // Перевіряємо, чи є кнопки в рядку
            if (checkbox.checked) {
                editBtn.removeAttribute("disabled");
                deleteBtn.removeAttribute("disabled");
            } else {
                editBtn.setAttribute("disabled", "true");
                deleteBtn.setAttribute("disabled", "true");
            }
        }
    }

    // Видалення вибраних студентів
    window.deleteSelected = function() {
        document.querySelectorAll(".rowCheckbox:checked").forEach(row => row.closest("tr").remove());
        updateButtons();
        updateSelectAllCheckbox();
        attachCheckboxListeners();
    };

    // Видалення одного студента через кнопку в таблиці
    window.deleteRow = function(btn) {
        const row = btn.closest("tr");
        row.remove();
        updateButtons();
        updateSelectAllCheckbox();
        attachCheckboxListeners();
    };

    // Редагування одного вибраного студента
    window.editRow = function(btn) {
        const row = btn.closest("tr");
        const checkbox = row.querySelector(".rowCheckbox");
        if (checkbox.checked) {
            openModal();
        }
    };

    // Додавання нового студента
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
            <img src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png" id = "delete-btn" title="Edit" class="edit-btn" onclick="openModal()" disabled>
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" id = "edit-btn" title="Delete" class="delete-btn" onclick="deleteSelected()" disabled>
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
            <img src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png" id = "delete-btn" title="Edit" class="edit-btn" onclick="openModal()" disabled>
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" id = "edit-btn" title="Delete" class="delete-btn" onclick="deleteSelected()" disabled>
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
            modal.style.display = "none";
        }
    };

    createButton.addEventListener("click", createStudent);
    okButton.addEventListener("click", okStudent);

    attachCheckboxListeners();
    updateButtons();
    updateSelectAllCheckbox();
});

