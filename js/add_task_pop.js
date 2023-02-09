/**function to open the add task popup on contacts */
async function openAddTask() {
  await loadTasks();
  await loadContacts();
  getLocalCurrentUser();
  await renderContactsToAssigned();
  addPrio(0);
  datepicker();
  document.getElementById("addTaskPopup").classList.add("outside");
  document.getElementById("close-taskpop").classList.remove("d-none");
  let bg = document.getElementById("contAddTaskToContact");
  bg.classList.remove("d-none");
  setTimeout(easein, 50);
}

/**function to ease the popup in by changing classnames */
function easein() {
  let task_popup = document.getElementById("addTaskPopup");
  let bg = document.getElementById("contAddTaskToContact");
  task_popup.classList.remove("outside");
  task_popup.classList.add("inside");
}

/**function to undisplay the creator */
function closeTaskCreator() {
  let task_popup = document.getElementById("addTaskPopup");
  let bg = document.getElementById("contAddTaskToContact");
  bg.classList.add("d-none");
  task_popup.classList.remove("inside");
  task_popup.classList.add("outside");
}

/**function to render the possible contacts you can choose the assign from */
async function renderContactsToAssigned() {
  for (let i = 0; i < allContacts.length; i++) {
    const contact = allContacts[i]["name"];
    document.getElementById("openedContacts").innerHTML += `
      <div class="oneContact" onclick="addContact(${i})">
        <div id="contact${i}">${contact}</div>
        <div class="contactButton" id="contactButton${i}"></div>
      </div>
      `;
  }
}