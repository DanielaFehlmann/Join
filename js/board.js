let loadedBoard = [];
let loadedContacts = [];
let currentDragElement;
let allradySet = false;


async function initBoard() {
    setURL('https://daniela-fehlmann.at/join/smallest_backend_ever-master');
    await loadAllTaskFromBackend();
    await loadContactsFromBackend();
    await getCurrentUserFromStorage();
    await loadTasks();
    await loadContacts();
    renderBoard();
    setUserImgTest();
    checkForColor();
    datepicker();
    checkWindow();
}


function setUserImgTest() {
    if (!allradySet) {
        setUserImg();
        allradySet = true;
    }
}


function dragStart(id) {
    currentDragElement = id;
}


async function drop(progress) {
    loadedBoard[currentDragElement]['progress'] = progress;
    renderBoard();
    await boardSaveToBackend()
}


function allowDrop(ev) {
    ev.preventDefault();
}


/**
 * function to load from and to backend
 */
async function boardSaveToBackend() {
    await downloadFromServer();
    let JSONAsText = JSON.stringify(loadedBoard);
    await backend.setItem("all_tasks", JSONAsText);
}


async function loadAllTaskFromBackend() {
    await downloadFromServer();
    loadedBoard = JSON.parse(backend.getItem("all_tasks"));
    if (!loadedBoard) {
        loadedBoard = [];
    };
}


async function loadContactsFromBackend() {
    await downloadFromServer();
    loadedContacts = JSON.parse(backend.getItem("contacts"));
    if (!loadedContacts) {
        loadedContacts = [];
    };
}


/**
 * filter all task with searchBar
 * 
 */
function filterTasks() {
    let search = document.getElementById('filterTasks').value;
    search = search.toLowerCase();
    clearRender();
    for (let i = 0; i < loadedBoard.length; i++) {
        let contact = loadedBoard[i];
        let contactTitel = contact['title'].toLowerCase();
        let contactDescription = contact['description'].toLowerCase();
        let contactProgress = contact.progress;
        let progressId = getProgressWithoutSpace(contactProgress);
        if (search == "") {
            renderBoard();
        }
        else if (contactTitel.includes(search) || contactDescription.includes(search)) {
            renderSearchedTasks(contactProgress, progressId, search);
        }
    }
}


/**
 * Render all filtered tasks
 * 
 * @param {string} contactProgress includes progress of task
 * @param {string} progressId includes progress of task without space between 2 words
 */
function renderSearchedTasks(contactProgress, progressId, search) {
    let length = loadedBoard.length - 1;
    for (let i = length; i >= 0; i--) {
        const currentProgress = loadedBoard[i]['progress'];
        let contactTitel = loadedBoard[i]['title'].toLowerCase();
        let contactDescription = loadedBoard[i]['description'].toLowerCase();
        if (currentProgress.includes(contactProgress) && contactTitel.includes(search) || contactDescription.includes(search)) {
            renderBoardFiltered(i, progressId);
        }
    }
}


/**
 * Render all tasks
 * 
 */
function renderBoard() {
    clearRender();
    let length = loadedBoard.length - 1;
    for (let i = length; i >= 0; i--) {
        const currentProgress = loadedBoard[i]['progress'];
        if (currentProgress.includes('todo')) {
            renderBoardFiltered(i, 'todo');
        } else if (currentProgress.includes('in Process')) {
            renderBoardFiltered(i, 'inProcess');
        } else if (currentProgress.includes('awaiting Feedback')) {
            renderBoardFiltered(i, 'awaitingFeedback');
        } else if (currentProgress.includes('done')) {
            renderBoardFiltered(i, 'done');
        } else {
            alert('Failed to load all Tasks - try to reload the page')
        }
    }
}


/**
 * clear entire area
 * 
 */
function clearRender() {
    let todo = document.getElementById('todo');
    let inProcess = document.getElementById('inProcess');
    let awaitingFeedback = document.getElementById('awaitingFeedback');
    let done = document.getElementById('done');
    todo.innerHTML = '';
    inProcess.innerHTML = '';
    awaitingFeedback.innerHTML = '';
    done.innerHTML = '';
}


/**
 * Render function
 * 
 * @param {string} index includes progress of task
 * @param {string} id includes progress of task without space between 2 words
 */
function renderBoardFiltered(index, id) {
    let progress = document.getElementById(id);
    let task = loadedBoard[index];
    let { color, category, title, description, date, priority, assignedTo, assignedToLength } = getTaskInfos(task);
    progress.innerHTML += renderBoardTemp(color, category, title, description, date, priority, assignedTo, id, index);
    let assignedToId = document.getElementById(`assignedTo${id}${index}`);
    assignedToId.innerHTML = '';
    renderAssignedTo(assignedToLength, assignedTo, assignedToId);

    showProgressSubtasks(task, index);
}


/**
 * render assigned to names
 * 
 * @param {number} assignedToLength includes count of names
 * @param {string} assignedTo includes names
 * @param {string} assignedToId id for innerHTML
 */
function renderAssignedTo(assignedToLength, assignedTo, assignedToId) {
    if (assignedToLength > 3) {
        for (let x = 0; x < 2; x++) {
            let currentName = assignedTo[x];
            let bothFirstLetters = splitName(currentName);
            let color = getContactColor(currentName);
            assignedToId.innerHTML += `<div style="background-color: ${color};" class="assigned">${bothFirstLetters}</div>`;
        }
        let numberOf = assignedToLength - 2;
        assignedToId.innerHTML += `<div style="background-color: #000000;" class="assigned">+${numberOf}</div>`;
    } else {
        for (let x = 0; x < assignedToLength; x++) {
            let currentName = assignedTo[x];
            let bothFirstLetters = splitName(currentName);
            let color = getContactColor(currentName);
            assignedToId.innerHTML += `<div style="background-color: ${color};" class="assigned">${bothFirstLetters}</div>`;

        }
    }
}


/**
 * opens and render current task by clicking on it
 * 
 * @param {number} color includes #code
 * @param {string} category includes task category
 * @param {string} title includes task title
 * @param {string} description includes task description
 * @param {string} date includes task date
 * @param {string} priority includes task priority
 * @param {string} assignedTo includes task assigned to names
 */
function openBoardTask(color, category, title, description, date, priority, assignedTo, progress, index) {
    let openPopup = document.getElementById('boardPopupTask');
    let priorityColor = getPriorityColor(priority);
    let assignedToArray = stringToArray(assignedTo)
    openPopup.classList.remove('d-none');

    openPopup.innerHTML = openBoardTaskTemp(color, category, title, description, date, priority, priorityColor, progress, index);
    openTaskAssignedTo(assignedToArray);
}


function closeBoardTask() {
    let closePopup = document.getElementById('boardPopupTask');
    closePopup.classList.add('d-none');
}


/**
 * render assigned to names in openBoardTask()
 * 
 * @param {string} assignedTo includes task assigned to names
 */
function openTaskAssignedTo(assignedTo) {
    let openTaskAssignedTo = document.getElementById('openTaskAssignedTo');
    for (let i = 0; i < assignedTo.length; i++) {
        let contact = assignedTo[i];
        let bothFirstLetters = splitName(contact);
        let nameColor = getContactColor(contact);
        openTaskAssignedTo.innerHTML += openTaskAssignedToTemp(contact, bothFirstLetters, nameColor);
    }
}


/**
 * opens and render popup window to edit task
 * 
 * @param {string} title includes current task title
 * @param {string} description includes current task description
 * @param {string} date includes current task date example "22/10/2022"
 * @param {number} index includes index number of current task
 */
async function editPopupTask(title, description, date, index) {
    let id = 'w3-include-html-edit-task';
    await includeHTMLForBoard(id);
    let { titleId, descriptionId, dateId, formId, closeEditPopup, closePopup } = getEditPopupVariables();
    let currentTask = loadedBoard[index];
    let prioIndex = getPrioIndexEdit(currentTask);
    closePopup.classList.add('d-none');
    closeEditPopup.classList.remove('d-none');
    titleId.value = (`${title}`);
    descriptionId.innerHTML = `${description}`;
    dateId.value = (`${date}`);
    formId.setAttribute("onsubmit", "saveEditPopupBoard('" + index + "');return false;");
    
    addContactLoop(index);
    datepicker();
    addPrio(prioIndex);
    renderAllContacts();
}


/**
 * 
 * @param {number} index includes index number of current task
 */
async function saveEditPopupBoard(index) {
    let { titleValue, descriptionValue, dateValue, prioValue, assignedToValue } = getnewValuesFromEdit();
    loadedBoard[index].title = titleValue;
    loadedBoard[index].description = descriptionValue;
    loadedBoard[index].contactNames = assignedToValue;
    loadedBoard[index].date = dateValue;
    loadedBoard[index].prio = prioValue;
    await boardSaveToBackend();
    closeEditedTask();
    initBoard();
}


function closeEditedTask() {
    let closeEditPopup = document.getElementById('boardPopupTaskEdit');
    closeEditPopup.classList.add('d-none');
    resetVariables();
    document.getElementById('includeHTMLEdit').innerHTML = '';
}


function cancleEditTask() {
    let closeEditPopup = document.getElementById('boardPopupTaskEdit');
    closeEditPopup.classList.add('d-none');
    let closePopup = document.getElementById('boardPopupTask');
    closePopup.classList.remove('d-none');
    resetVariables();
    document.getElementById('includeHTMLEdit').innerHTML = '';
}


/**
 * 
 * @param {string} param includes onclicked progress as parameter
 */
async function addTaskBoard(param) {
    let id = 'w3-include-html-add-task';
    await includeHTMLForBoard(id);
    let addTaskId = document.getElementById('popupAddTaskBoard');
    let formId = document.getElementById('popupAddTastBoardForm');
    addTaskId.classList.remove('d-none');
    formId.setAttribute("onsubmit", "createTaskBoard('" + param + "');return false;");
    renderAllContacts();
    datepicker();
    addPrio(0);
}


function closeAddTaskBoard() {
    document.getElementById('includeHTMLAdd').innerHTML = '';
    let addTaskId = document.getElementById('popupAddTaskBoard');
    addTaskId.classList.add('d-none');
}


/**
 * add all current assignedTo contacts for edit popup
 * 
 * @param {number} index includes index number of current task
 */
function addContactLoop(index) {
    let contacts = loadedBoard[index]['contactNames'];
    for (let i = 0; i < contacts.length; i++) {
        let contact = loadedBoard[index]['contactNames'][i];
        let contactId = getContactId(contact);
        addContactBoard(contactId);
    }
}


/**
 * function to add/delete a existing contact to/from the array ""selectedContactNames"
 * 
 * @param {number} i - number to get the correct contact
 */
function addContactBoard(i) {
    let contactID = document.getElementById('contact' + i);
    let index = selectedContactNames.indexOf(contactID.innerHTML);
    let index2 = selectedLetters.findIndex(obj => obj.bothLetters == firstLetters[i]['bothLetters']);
    if (index > -1) {
        resetSelectBoard(index, index2, i);
    } else {
        selectBoard(contactID, i);
    };
    if (!(selectedContactNames == '')) {
        document.getElementById('contact').value = 'Contacts selected';
    } else {
        document.getElementById('contact').value = '';
    }
}


function resetSelectBoard(index, index2, i) {
    document.getElementById('contactButton' + i).innerHTML = '';
    selectedContactNames.splice(index, 1);
    selectedLetters.splice(index2, 1);
    document.getElementById('addedContacts').innerHTML = '';
    for (let x = 0; x < selectedLetters.length; x++) {
        const selectedLetter = selectedLetters[x]['bothLetters'];
        document.getElementById('addedContacts').innerHTML += `<div class="firstLetters" style="background-color: ${selectedLetters[x]['color']};">${selectedLetter}</div>`;
    }
}


function getContactId(contact) {
    let contactId;
    for (let i = 0; i < allContacts.length; i++) {
        let currentContact = allContacts[i].name;
        if (currentContact.includes(contact)) {
            contactId = i
            break;
        }
    }
    return contactId;
}


function selectBoard(contactID, i) {
    document.getElementById('contactButton' + i).innerHTML = `<img src="assets/img/button_rectangle.svg">`; //macht Häkchen neben Kontakt
    selectedContactNames.push(contactID.innerHTML);
    selectedLetters.push(firstLetters[i]);
    document.getElementById('addedContacts').innerHTML = '';
    for (let x = 0; x < selectedLetters.length; x++) {
        const selectedLetter = selectedLetters[x]['bothLetters'];
        document.getElementById('addedContacts').innerHTML += `<div class="firstLetters" style="background-color: ${selectedLetters[x]['color']};">${selectedLetter}</div>`;
    }
}


/**
 * 
 * @returns all new values from edited Task
 */
function getnewValuesFromEdit() {
    let titleValue = document.getElementById('titleInput').value;
    let descriptionValue = document.getElementById('descriptionTextarea').value;
    let dateValue = document.getElementById('datepicker').value;
    let prioValue = selectedPrio;
    let assignedToValue = selectedContactNames;
    return { titleValue, descriptionValue, dateValue, prioValue, assignedToValue };
}


function getEditPopupVariables() {
    let titleId = document.getElementById('titleInput');
    let descriptionId = document.getElementById('descriptionTextarea');
    let dateId = document.getElementById('datepicker');
    let formId = document.getElementById('popupEditFormId');
    let closeEditPopup = document.getElementById('boardPopupTaskEdit');
    let closePopup = document.getElementById('boardPopupTask');
    return { titleId, descriptionId, dateId, formId, closeEditPopup, closePopup };
}


/**
 * 
 * @param {array} currentTask includes current task array
 * @returns priority index number
 */
function getPrioIndexEdit(currentTask) {
    let prio = currentTask['prio'];
    let prioIndex;
    if (prio.includes('urgent')) {
        prioIndex = 0
    }
    if (prio.includes('medium')) {
        prioIndex = 1
    }
    if (prio.includes('low')) {
        prioIndex = 2
    }
    return prioIndex;
}


/**
 * 
 * @param {string} param includes onclicked progress as parameter
 */
async function createTaskBoard(param) {
    if (param == 'undefined') {
        param = 'todo'
    }
    addDate();
    let jsonObj = {
        title: selectedTitle,
        description: selectedDescription,
        category: selectedCategory,
        color: selectedColor,
        contactNames: selectedContactNames,
        date: selectedDate,
        prio: selectedPrio,
        subtasks: selectedSubtasks,
        progress: param
    };
    loadedBoard.push(jsonObj);
    await boardSaveToBackend();
    clearTask();
    closeAddTaskBoard();
    showDivWithTransition();
    initBoard();
}


function showDivWithTransition() {
    setTimeout(function () {
        var div = document.querySelector('.cont-success-message');
        div.style.display = "flex";
        setTimeout(function () {
            div.style.transform = "translateY(0)";
            setTimeout(function () {
                div.style.transform = "translateY(200%)";
                setTimeout(function () {
                    div.style.display = "none";
                }, 1000);
            }, 2000);
        }, 100);
    }, 100);
}


function getProgressWithoutSpace(contactProgress) {
    let str = contactProgress;
    str = str.replace(/\s+/g, '');
    return str;
}


function stringToArray(string) {
    return string.split(",").map(function (name) {
        return name.trim();
    });
}


function getPriorityColor(priority) {
    if (priority == 'low') {
        return '#7AE229';
    }
    else if (priority == 'medium') {
        return '#FFA800';
    }
    else if (priority == 'urgent') {
        return '#FF3D00';
    }
}


function getTaskLength(progress) {
    let length = 0;
    for (let i = 0; i < loadedBoard.length; i++) {
        const currentProgress = loadedBoard[i]['progress'];
        if (currentProgress.includes(progress)) {
            length++;
        }
    }
    return length;
}


function getContactColor(currentName) {
    for (let i = 0; i < loadedContacts.length; i++) {
        let contact = loadedContacts[i].name;
        if (currentName.toLowerCase().includes("you")) {
            currentName = current_user.username;
        }
        if (contact.includes(currentName)) {
            return loadedContacts[i].color;
        }
    }
}



function getTaskInfos(task) {
    let color = task['color']
    let category = task['category'];
    let title = task['title'];
    let description = task['description'];
    let date = task['date'];
    let priority = task['prio'];
    let assignedTo = task['contactNames'];
    let assignedToLength = task['contactNames'].length;
    return { color, category, title, description, date, priority, assignedTo, assignedToLength };
}


function splitName(fullName) {
    let nameParts = fullName.split(" ");
    let firstName = nameParts[0];
    let lastName = nameParts[nameParts.length - 1];
    let bothFirstLetters = firstName.charAt(0) + lastName.charAt(0);
    return bothFirstLetters
}


async function getCurrentUserFromStorage() {
    let currentUserAsText = localStorage.getItem("current_user");
    if (!currentUserAsText) {
        window.location.href = "login.html";
    } else {
        current_user = JSON.parse(currentUserAsText);
    }
}


function checkForColor() {
    for (let i = 0; i < loadedContacts.length; i++) {
        let currentContact = loadedContacts[i];
        if (!currentContact.color) {
            let name = currentContact.name;
            let email = currentContact.email;
            let phone = currentContact.phone;
            let randomColor = getRandomColor();
            let newObjekt = { name: name, email: email, phone: phone, color: randomColor };
            loadedContacts.splice(i, 1, newObjekt);
        }
    }
}


async function includeHTMLForBoard(id) {
    let includeElements = document.querySelectorAll(`[${id}]`);
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute(`${id}`); // "includes/header.html"
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}


function renderBoardTemp(color, category, title, description, date, priority, assignedTo, progress, index) {
    return `
    <div draggable="true" ondragstart="dragStart(${index})" onclick="openBoardTask('${color}', '${category}', '${title}', '${description}', '${date}', '${priority}', '${assignedTo}', '${progress}', '${index}');renderSubtasks(${index})" class="todo-tasks">
        <h2 style="background-color: ${color};" class="task-head">${category}</h2>
        <span class="task-titel">${title}</span> <br><br>
        <span class="task-description">${description}</span>

        <div id="progressbar${index}" class="progressbar">
        <div class="progress-subtasks" id="progress-subtasks${index}"><span class="progress-numb" id="progress-numb${index}">0/2 done</span></div>
        </div>

        <div class="task-footer">
            <div id="assignedTo${progress}${index}" class="cont-assigned">

            </div>
            <img class="board-priority" src="./assets/img/priority_${priority}.png" alt="">
        </div>
    </div>
    `;
}


function deleteTaskMobile(index) {
    loadedBoard.splice(index, 1);
    saveOpenedTask();
}


function nextSection(index) {
    if (loadedBoard[index]['progress'] == 'todo') {
        loadedBoard[index]['progress'] = 'in Process';
    } else if (loadedBoard[index]['progress'] == 'in Process') {
        loadedBoard[index]['progress'] = 'awaiting Feedback';
    } else if (loadedBoard[index]['progress'] == 'awaiting Feedback') {
        loadedBoard[index]['progress'] = 'done';
    }
    saveOpenedTask();
}


function openBoardTaskTemp(color, category, title, description, date, priority, priorityColor, progress, index) {
    return `
    <div class="cont-popup-board-task" onclick="event.stopPropagation()">
        <!--buttons-->
        <img onclick="saveOpenedTask()" class="popup-close" src="./assets/img/board_popup_close.png" alt="">
        <!--Head area-->
        <h2 style="background-color: ${color};" class="task-head">${category}</h2>
        <span class="popup-task-titel">${title}</span>
        <span class="popup-task-description">${description}</span>
        <!--Date-->
        <div class="cont-popup-details">
            <span class="popup-details">Due date:</span>
            <span class="popup-date">${date}</span>
        </div>
        <!--Priority-->
        <div class="cont-popup-details">
            <span class="popup-details">Priority:</span>
            <h2 style="background-color: ${priorityColor};" class="popup-priority">
            ${priority}
                <img class="board-priority" src="./assets/img/priority_${priority}.png" alt="">
            </h2>
        </div>
        <!--Assigned To-->
        <span id="openTaskAssignedTo" class="popup-details">Assigned To:</span>

        <div id="subtask-container"></div>
        <div class="buttonsBelow">
          <button onclick="deleteTaskMobile(${index})" class="popup-edit-button deleteTask"><img src="./assets/img/trash.png"></button>
          <button onclick="nextSection(${index})" class="popup-edit-button nextSection">next Section</button>
          <button onclick="editPopupTask('${title}', '${description}', '${date}', '${index}')" class="popup-edit-button"><img src="./assets/img/board_popup_edit.png"></button>
        </div>

    </div>
    `;
}




function openTaskAssignedToTemp(contact, bothFirstLetters, nameColor) {
    return `
    <div class="popup-assigned-to-contacts">
        <div style="background-color: ${nameColor};" class="popup-assigned">${bothFirstLetters}</div>
        <span>${contact}</span>
    </div>
    `;
}


/**
 * Functions for delete Tasks from here
 */

async function deleteTask() {
    loadedBoard.splice(currentDragElement, 1);
    renderBoard();
    await boardSaveToBackend();
}


/**function calculate subtasks */

function showProgressSubtasks(task, index) {
    let number_subtasks = task["subtasks"].length;
    if (number_subtasks > 0) {
        let array_done_subt = task["subtasks"].filter((s) => s["state"] == "done");
        let numb_done = array_done_subt.length;
        let width_done = 100 * (numb_done / number_subtasks)
        let width_progress = document.getElementById("progress-subtasks" + index);
        width_progress.style.width = width_done + "%";
        document.getElementById("progress-numb" + index).innerHTML = `${numb_done}/${number_subtasks}`
        checkNoSubtasksDone(width_done, width_progress)
    } else {
        document.getElementById("progressbar" + index).classList.add("d-none")
    }
}


function checkNoSubtasksDone(width_done, width_progress) {
    if (width_done == 0) {
        width_progress.style.width = "100%";
        width_progress.style.backgroundColor = "white";
        width_progress.style.border = "transparent";
    }
}


function renderSubtasks(index) {
    for (let i = 0; i < loadedBoard[index]["subtasks"].length; i++) {
        document.getElementById("subtask-container").innerHTML += `
    <div class=cont-subtask>
    <input class="check" id="check${index}${i}"type="checkbox" onclick="checkSubtask(${index},${i})">
    <span> ${loadedBoard[index]["subtasks"][i]["name"]}</span>
    `
        setCheckValue(index, i)
    }
}


function setCheckValue(index, i) {
    if (loadedBoard[index]["subtasks"][i]["state"] == "done") {
        document.getElementById("check" + index + i).setAttribute("checked", "true")
    }
}


function checkSubtask(index, i) {
    let value_checkbox = document.getElementById("check" + index + i);
    if (value_checkbox.checked) {
        loadedBoard[index]["subtasks"][i]["state"] = "done";
    } else {
        loadedBoard[index]["subtasks"][i]["state"] = "todo";
    }
}


async function saveOpenedTask() {
    await boardSaveToBackend();
    closeBoardTask();
    initBoard();
}