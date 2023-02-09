let loadedContacts=[];
let letters = [];

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


/**
 * all funktions for load all contacts from backend and render them from here
 */
async function initContacts() {
    setURL('https://daniela-fehlmann.developerakademie.net/Join/smallest_backend_ever-master');
    await loadContactsFromBackend();
    checkForColor();
    sort();
    renderContacts();
    sort();
    await getCurrentUserFromStorage();
    setUserImg();
}


function sort() {
    var mylist = document.getElementById('contAllContacts');
    var divs = mylist.getElementsByClassName('sort');
    var listitems = [];
    for (i = 0; i < divs.length; i++) {
            listitems.push(divs.item(i));
    }
    listitems.sort(function(a, b) {
        var compA = a.getAttribute('id');
        var compB = b.getAttribute('id');
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    });
    for (i = 0; i < listitems.length; i++) {
        mylist.appendChild(listitems[i]);
    }
}


async function loadContactsFromBackend() {
    await downloadFromServer();
    loadedContacts = JSON.parse(backend.getItem("contacts"));
    if (!loadedContacts) {
        loadedContacts = [];
    };
}


/**
 * save contact and load to backend
 */
async function saveContactsToBackend() {
    await downloadFromServer();
    let contactAsText = JSON.stringify(loadedContacts);
    await backend.setItem("contacts", contactAsText);
}


/**
 * all funktions for render contacts from here
 */
function renderContacts() {
    filterFirstLetters();
    renderLetterSection();
}


function renderLetterSection() {
    let contContacts = document.getElementById('contAllContacts');
    contContacts.innerHTML = '';
    for (let i = 0; i < letters.length; i++) {
        let smallLetter = letters[i];
        let bigLetter = smallLetter.charAt(0).toUpperCase();
        contContacts.innerHTML += renderLetterSectionLayOut(bigLetter, i);
        renderContactsInSection(smallLetter, i);
    }
}


function renderContactsInSection(currentLetter, x) {
    for (let i = 0; i < loadedContacts.length; i++) {
        let contactId = document.getElementById(`contContactSection${x}`);
        let outerId = x;
        let innerId = i;
        let contactName = loadedContacts[i]['name'];
        let contactMail = loadedContacts[i]['email'];
        let contactPhone = loadedContacts[i]['phone'];
        let contactColor = loadedContacts[i]['color'];
        let bothFirstLetters = splitName(contactName);
        let contactFirstLetter = contactName.charAt(0).toLowerCase();
        if (contactFirstLetter.includes(currentLetter)) {
            contactId.innerHTML += renderContactsInSectionTemp(contactColor, bothFirstLetters, contactName, contactMail, contactPhone, outerId, innerId);
        }
    }
}


function filterFirstLetters() {
    //push`s first letter from all contacts['name'] but only 1 time per letter
    for (let i = 0; i < loadedContacts.length; i++) {
        const contact = loadedContacts[i];
        let firstLetter = contact['name'].charAt(0).toLowerCase();
        if (!letters.includes(firstLetter)) {
            letters.push(firstLetter);
        }
    }

}


function splitName(fullName) {
    // let fullName = "David Eisenberg";
    let nameParts = fullName.split(" ");
    let firstName = nameParts[0];
    let lastName = nameParts[nameParts.length - 1];
    let bothFirstLetters = firstName.charAt(0) + lastName.charAt(0);
    return bothFirstLetters
    // console.log(firstName); Output: "David"
    // console.log(lastName); Output: "Eisenberg"
}


/**
 * all funktions from open contact from here
 * + change background color to dark-blue 
 * + change font color to white
 * 
 * @param {number} i id from outer section
 * @param {number} j id from inner section
 */
function openCloseDetails(contactColor, contact, contactMail, contactPhone, bothFirstLetters, outerId, innerId) {
    checkIfOneOpen(outerId, innerId);
    renderDetails(contact, contactMail, contactColor, contactPhone, bothFirstLetters);
}


function renderDetails(contact, contactMail, contactColor, contactPhone, bothFirstLetters) {
    let openContact = document.getElementById('openContact');
    openContact.innerHTML = renderDetailsTemp(contact, contactMail, contactColor, contactPhone, bothFirstLetters);
}


function checkIfOneOpen(i, j) {
    resetAllBgrColors();
    let openDetails = document.getElementById('openContact');
    let contactBgr = document.getElementById(`contactBgr${i}${j}`);
    let contactNameColor = document.getElementById(`contactNameColor${i}${j}`);
    if (openDetails.classList.contains('d-none')) {
        openDetails.classList.remove('d-none');
        contactBgr.style = "background-color: #2A3647;";
        contactNameColor.style = "color: white;";
    } else {
        openDetails.classList.add('d-none');
    }
}


function closeDetail() {
    let details = document.getElementById('openContact');
    details.classList.add('d-none');
}


function resetAllBgrColors() {
    let bgr = document.getElementsByClassName('contact');
    for (let i = 0; i < bgr.length; i++) {
        if (bgr[i].style.backgroundColor) {
            bgr[i].removeAttribute("style");
        }
    }
    let font = document.getElementsByClassName('contact-name');
    for (let i = 0; i < font.length; i++) {
        if (font[i].style.color) {
            font[i].removeAttribute("style");
        }
    }
}


/**function for closing addTask unfilled */
function closeAddTask(){
    closeDetail();
    resetAllBgrColors();
}


/**
 * all funktions from edit contact from here
 * 
 * @param {string} contactName contains Name
 * @param {string} contactMail contains Email
 * @param {string} contactColor contains Color
 * @param {string} contactPhone contains Phonenumber
 * @param {string} bothFirstLetters Contains example (AM) for "Anton Mayer"
 */
function openEditContact(contactName, contactMail, contactColor, contactPhone, bothFirstLetters) {
    let editContact = document.getElementById('contEditContact');
    editContact.classList.remove('d-none');
    editContact.innerHTML = openEditContactTemp(contactName, contactMail, contactColor, contactPhone, bothFirstLetters);
}


async function editContactSave(contactName, contactMail, contactPhone) {
    let newName = document.getElementById('editContactNameValue').value;
    let newMail = document.getElementById('editContactMailValue').value;
    let newPhone = document.getElementById('editContactPhoneValue').value;
    let index = findCurrentContact(contactName, contactMail, contactPhone);
    loadedContacts[index].name = newName;
    loadedContacts[index].email = newMail;
    loadedContacts[index].phone = newPhone;
    await saveContactsToBackend();
    closeEditContact();
    closeDetail();
    initContacts();
}


function findCurrentContact(contactName, contactMail, contactPhone) {
    let index = -1;
    for (let i = 0; i < loadedContacts.length; i++) {
        if (loadedContacts[i].name === contactName && loadedContacts[i].email === contactMail && loadedContacts[i].phone === contactPhone) {
            index = i;
            break;
        }
    }
    return index;
}


function closeEditContact() {
    let editContact = document.getElementById('contEditContact');
    editContact.classList.add('d-none');
}


/**
 * all funktions from create new contact from here
 */
function openNewContact() {
    let newContact = document.getElementById('contCreateNewContact');
    newContact.classList.remove('d-none');
    newContact.innerHTML = openNewContactTemp();
}


async function createNewContact() {
    let newName = document.getElementById('newContactNameValue').value;
    let newMail = document.getElementById('newContactMailValue').value;
    let newPhone = document.getElementById('newContactPhoneValue').value;
    let randomColor = getRandomColor();
    let newObjekt = { name: newName, email: newMail, phone: newPhone, color: randomColor };
    loadedContacts.push(newObjekt);
    await saveContactsToBackend();
    closeNewContact();
    closeDetail();
    initContacts();
    showDivWithTransition();
}


function getRandomColor() {
    let letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


function showDivWithTransition() {
    var div = document.querySelector('.cont-success-message');
        div.style.display = "flex";
        setTimeout(function () {
            div.style.transform = "translateY(0)";
            setTimeout(function () {
                div.style.transform = "translateY(200%)";
                setTimeout(function () {
                    div.style.display = "none";
                }, 1000);
            }, 3000);
    }, 1000);
}


function closeNewContact() {
    let newContact = document.getElementById('contCreateNewContact');
    newContact.classList.add('d-none');
}


async function getCurrentUserFromStorage() {
    let currentUserAsText = localStorage.getItem("current_user");
    if (!currentUserAsText) {
        window.location.href = "login.html";
    } else {
        current_user = JSON.parse(currentUserAsText);
    }
}


/**
 * all innerHTML returns from here
 */
function openNewContactTemp() {
    return `
    <div class="cont-new-contact-pup">
        <!--close popup-->
    <img onclick="closeNewContact()" class="popup-close" src="./assets/img/board_popup_close.png" alt="">

        <!-- left side from popup create new contact -->
        <div class="cont-left-contact-pup">
            <img src="./assets/img/contacts_logo.png" alt="">
            <h2>Add Contact</h2>
            <span>Tasks are better with a team!</span>
            <div></div>
        </div>

        <!-- right side from popup create new contact -->
        <div class="cont-right-contact-pup">
            <div class="cont-create-contact-infos">
                <img class="create-contact-pp" src="./assets/img/contact_empty_pp.png" alt="">

                <form onsubmit="createNewContact();return false" class="cont-create-contact-input">
                    <input id="newContactNameValue" required placeholder="Vorname Nachname" pattern="[A-ZÄÜÖ][a-zäüö]* +[A-ZÄÜÖ][a-zäüö]*"  type="text" />
                    <input id="newContactMailValue" required placeholder="Email" type="email" />
                    <input id="newContactPhoneValue" required placeholder="Phone" type="number" />
                    <div class="cont-create-contact-buttons">
                        <button type="reset" onclick="closeNewContact()" class="create-new-contact-deny">
                            Cancel <img src="./assets/img/contact_add_task.png" alt="">
                        </button>
                        <button type="submit" class="create-new-contact-check">
                            Create contact <img src="./assets/img/contact_check.png" alt="">
                        </button>
                    </div>
                </form>

            </div>
        </div>
    </div>
    `;
}


function openEditContactTemp(contactName, contactMail, contactColor, contactPhone, bothFirstLetters) {
    return `
    <div id="cont-new-contact-pup" class="cont-new-contact-pup translated">
        <!--close popup-->
        <img onclick="closeEditContact()" class="popup-close" src="./assets/img/board_popup_close.png" alt="">

        <!-- left side from popup edit contact -->
        <div class="cont-left-contact-pup">
            <img src="./assets/img/contacts_logo.png" alt="">
            <h2>Edit Contact</h2>
            <div></div>
        </div>

        <!-- right side from popup edit contact -->
        <div class="cont-right-contact-pup">
            <div class="cont-create-contact-infos">
                <div style="background-color: ${contactColor};" class="edit-contact-img">${bothFirstLetters}</div>
                <form onsubmit="editContactSave('${contactName}', '${contactMail}', '${contactPhone}');return false" class="cont-create-contact-input">
                    <input id="editContactNameValue" required value="${contactName}"  type="name" placeholder="Vorname Nachname" pattern="[A-ZÄÜÖ][a-zäüö]* +[A-ZÄÜÖ][a-zäüö]*" >
                    <input id="editContactMailValue" required value="${contactMail}" placeholder="Email" type="email">
                    <input id="editContactPhoneValue" required value="${contactPhone}" placeholder="Phone" type="number">
                    <div class="cont-create-contact-buttons">
                        <button type="submit" class="create-new-contact-check"> Save </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `;
}


function renderDetailsTemp(contactName, contactMail, contactColor, contactPhone, bothFirstLetters) {
    return `
    <div id="backarrow" onclick="closeAddTask()"><-</div>
    <div class="open-contact-head">
        <div style="background-color: ${contactColor};" class="open-contact-img">${bothFirstLetters}</div>
        <div class="open-contact-head-name">
            <h2>${contactName}</h2>
            <span onclick="openAddTask()"><img src="./assets/img/contact_add_task.png" alt="">Add Task</span>
        </div>
    </div>
    <div class="open-contact-edit">
        <span class="contact-information-text">Contact Information</span>
        <span onclick="openEditContact('${contactName}', '${contactMail}', '${contactColor}', '${contactPhone}', '${bothFirstLetters}')" class="contact-edit-info"><img src="./assets/img/edit_contact.png"
                alt=""> Edit Contact</span>
    </div>
    <div class="open-contact-infos">
        <span class="contact-information">Email</span>
        <a class="contact-mail" href="mailto:${contactMail}">${contactMail}</a>
        <span class="contact-information">Phone</span>
        <a class="contact-tel" href="tel:${contactPhone}">${contactPhone}</a>
    </div>
    `;
}


function renderLetterSectionLayOut(bigLetter, i) {
    return `
    <div class="cont-contact sort" id='${bigLetter}'>
        <div class="cont-first-letter">
            <h2 class="first-letter-contact">${bigLetter}</h2>
        </div>
        <div class="parting-line"></div>

        <div class="contact-out" id="contContactSection${i}">

        </div>
    </div>
    `;
}


function renderContactsInSectionTemp(contactColor, bothFirstLetters, contact, contactMail, contactPhone, outerId, innerId) {
    return `
    <div onclick="openCloseDetails('${contactColor}', '${contact}', '${contactMail}', '${contactPhone}', '${bothFirstLetters}', '${outerId}', '${innerId}')" class="contact" id="contactBgr${outerId}${innerId}">
    <div style="background-color: ${contactColor};" class="contact-img">${bothFirstLetters}</div>
    <div class="contact-infos">
        <span id="contactNameColor${outerId}${innerId}" class="contact-name">${contact}</span>
        <a class="contact-mail" href="mailto:${contactMail}">${contactMail}</a>
    </div>
    </div>
    `;
}


