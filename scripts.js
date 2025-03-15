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

document.addEventListener("DOMContentLoaded", function(){
    var modal = document.getElementById("addStudent");
    var createButton = document.querySelector(".btn-create");
        
    function openModal(){
        modal.style.display = "block";
    }

    function closeModal(){
        modal.style.display = "none";
    }

    window.onclick = function(event){
        if (event.target == modal){
            modal.style.display = "none";
        }
    }

    function addStudent(event){
        event.preventDefault();
        var group = document.getElementById("group").value;
        var name = document.getElementById("name").value;
        var surname = document.getElementById("surname").value;
        var gender = document.getElementById("gender").value;
        var birthday = document.getElementById("birthday").value;

        if(!group || !name || !surname || !gender || !birthday){
            alert("All fields must be filled!");
            return;
        }

        var table = document.querySelector("table");
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

        checkboxCell.innerHTML = '<input type = "checkbox">';
        groupCell.innerHTML = `<b>${group}</b>`;
        nameCell.innerHTML = `<b>${name} ${surname}</b>`;
        genderCell.innerHTML = gender;
        birthdayCell.innerHTML = `<b>${birthday}</b>`;
        statusCell.innerHTML = '<span class = "status-dot gray"</span>';
        optionCell.innerHTML = '<img src = "https://cdn-icons-png.flaticon.com/512/1159/1159633.png" title="Edit" onclick="openModal()"> <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" title="Delete" onclick="deleteRow(this)">';

        closeModal();
    }              

    function deleteRow(element) {
        element.closest("tr").remove();
    }

    createButton.addEventListener("click", addStudent);    
});

document.addEventListener("DOMContentLoaded", function(){
    var modal = document.getElementById("addStudent");    
    var okButton = document.querySelector(".btn-ok");
    
    function openModal(){
        modal.style.display = "block";
    }

    function closeModal(){
        modal.style.display = "none";
    }

    window.onclick = function(event){
        if (event.target == modal){
            modal.style.display = "none";
        }
    }

function addStudent(event){
    event.preventDefault();
    var group = document.getElementById("group").value;
    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var gender = document.getElementById("gender").value;
    var birthday = document.getElementById("birthday").value;


    if(group && name && surname && gender && birthday){
       
    var table = document.querySelector("table");
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

    checkboxCell.innerHTML = '<input type = "checkbox">';
    groupCell.innerHTML = `<b>${group}</b>`;
    nameCell.innerHTML = `<b>${name} ${surname}</b>`;
    genderCell.innerHTML = gender;
    birthdayCell.innerHTML = `<b>${birthday}</b>`;
    statusCell.innerHTML = '<span class = "status-dot gray"</span>';
    optionCell.innerHTML = '<img src = "https://cdn-icons-png.flaticon.com/512/1159/1159633.png" title="Edit" onclick="openModal()"> <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" title="Delete" onclick="deleteRow(this)">';

    closeModal();
    }
}              

function deleteRow(element) {
    element.closest("tr").remove();
}

okButton.addEventListener("click", addStudent);
});


document.addEventListener("DOMContentLoaded", function() {
    const selectAllCheckbox = document.getElementById("selectAll");
    
    const deleteButton = document.getElementById("deleteSelected");
    const editButton = document.getElementById("editSelected");

    function getRowCheckboxes() {
        return document.querySelectorAll(".rowCheckbox");
    }

    function updateButtons() {
        const checkedRows = document.querySelectorAll(".rowCheckbox:checked");
        deleteButton.disabled = checkedRows.length === 0;
        editButton.disabled = checkedRows.length !== 1;
    }

    // Вибір усіх чекбоксів
    selectAllCheckbox.addEventListener("change", function() {
        getRowCheckboxes().forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
            toggleRowButtons(checkbox);
        });        
        updateButtons();
    });

     // Оновлення стану кнопок у кожному рядку
     function attachCheckboxListeners() {
        getRowCheckboxes().forEach(checkbox => {
            checkbox.addEventListener("change", function() {
                selectAllCheckbox.checked = [...getRowCheckboxes()].every(chk => chk.checked);
                toggleRowButtons(checkbox);
                updateButtons();
            });
        });
    }

    function toggleRowButtons(checkbox) {
        const row = checkbox.closest("tr");
        const editBtn = row.querySelector(".edit-btn");
        const deleteBtn = row.querySelector(".delete-btn");

        if (checkbox.checked) {
            editBtn.removeAttribute("disabled");
            deleteBtn.removeAttribute("disabled");
        } else {
            editBtn.setAttribute("disabled", "true");
            deleteBtn.setAttribute("disabled", "true");
        }
    }

    // Видалення вибраних студентів
    window.deleteSelected = function() {
        document.querySelectorAll(".rowCheckbox:checked").forEach(row => row.closest("tr").remove());
        updateButtons();
    };

    // Видалення одного студента через кнопку в таблиці
    window.deleteRow = function(btn) {
        const row = btn.closest("tr");
        row.remove();
        updateButtons();
    };

    // Редагування одного вибраного студента
    window.editRow = function(btn) {
        const row = btn.closest("tr");
        const checkbox = row.querySelector(".rowCheckbox");
        if (checkbox.checked) {
            openModal();
        }
    };

    window.addStudent = function() {
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
        var newRow = table.insertRow();
    
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
            <img src="https://cdn-icons-png.flaticon.com/512/1159/1159633.png" title="Edit" onclick="openModal()"> 
            <img src="https://cdn-icons-png.flaticon.com/512/1828/1828778.png" title="Delete" onclick="deleteRow(this)">
        `;
    
        closeModal();
    
        // Підключаємо новий чекбокс до системи вибору
        attachCheckboxListeners();
    };
    

    // При першому завантаженні сторінки прикріплюємо обробники подій
    attachCheckboxListeners();
});

