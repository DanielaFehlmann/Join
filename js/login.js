let loadedContacts=[]


/**
 *function for moving the start-logo from center to left corner 
 */
function moveLogo() {
  let logo = document.getElementById("start-pic");
  backgroundOpacity();
  logo.classList.remove("logo-big");
  logo.classList.add("logo-small");
  showLogin();
  setTimeout(removeStartbackground,100)
}


/**
 * function for undisplay the startbackground by adding class
 */
function removeStartbackground(){
    document.getElementById("start-background").classList.add("d-none");
}


/**
 * function to change background-opacity bei class-change
 */
function backgroundOpacity(){
    let bg = document.getElementById("start-background");
    bg.classList.remove("start");
    bg.classList.add("stop");
}


/**
 *function to wait some time before moving logo and getting login-box 
 */
async function getLogin() {
  setTimeout(moveLogo, 500)
  getUsers();
}


/**
 * funtion to set Location of Storage 
 */
async function setBackend() {
  setURL(
    'https://daniela-fehlmann.at/join/smallest_backend_ever-master'
  );
}


/**
 * function for showing the login-box and sign-in 
 */
function showLogin() {
  document.getElementById("login-container").classList.remove("d-none");
  document.getElementById("newuser-container").classList.remove("d-none");
}


/**
 * function to get all registrated Users and Contacts from storage 
 */
async function getUsers() {
  await setBackend();
  await downloadFromServer();
  users = JSON.parse(backend.getItem("users")) || [];
  loadedContacts = JSON.parse(backend.getItem("contacts")) || [];
}

function remberValueInLogin(){
  rememberToForm();
  let email=getJustRegistratedEmail();
  let pw=getJustRegistratedPW();
  if(pw){
    document.getElementById("mail-login").value=email;
    document.getElementById("password-login").value=pw;
    removeJustRegistrated();
  }
}


/**
 * function to find the logged User 
*/
async function getCurrentUser() {
  let logname = document.getElementById("mail-login");
  let logpassword = document.getElementById("password-login");
  current_user = users.find(
    (u) => u.password == logpassword.value && u.email == logname.value
  );
  if (!current_user) {
    tryOneMore();
  } else {
    removeTrys();
    setCurrentUserToLocal(current_user);
    deleteRemember();
    checkRemember(logname.value,logpassword.value);
    window.location.href = "summary.html";
  }
}


/**
 * function to reset value of loginfields 
*/
function resetLogin(){
  document.getElementById("mail-login").value="";
  document.getElementById("password-login").value="";
}


/**
 * function to storage current User local 
 */
function setCurrentUserToLocal(currentUser) {
  let currentUserAsText = JSON.stringify(currentUser);
  localStorage.setItem("current_user", currentUserAsText);
}


/**
 * function to show/hide the password by changing type of input 
 * 
 * @param {string} id -Parameter contains id of input-field
 * @param {string} id2 -Parameter contains id of button, which is used to get action on input-field
 * */
function togglePassword(id, id2) {
  let input_password = document.getElementById(id);
  let type = input_password.getAttribute("type");
  let text = document.getElementById(id2);
  if (type == "password") {
    input_password.setAttribute("type", "text");
    text.innerHTML = `Passwort verbergen`;
  } else {
    input_password.setAttribute("type", "password");
    text.innerHTML = `Passwort zeigen`;
  }
}


/**
 * function to login a guestUser 
 */
function guestLogin() {
  current_user = {
    username: "Guest",
    email: "guest@guest.de",
    color:"grey"
  };
  setCurrentUserToLocal(current_user);
  getDemoSummary();
}


/**
 * function to get the summary as guest 
 */
function getDemoSummary() {
  window.location.href = "summary.html";
}


/**
 * function to registrate as new User 
 */
async function sign() {
  let username = document.getElementById("name-registration").value;
  let email = document.getElementById("mail-registration").value;
  let password = document.getElementById("password-registration").value;
  let color=getRandomColor();
  let newUser = {username: username,email: email,password: password,color:color};
  let isNewUser = await checknewUser(newUser);
  if (isNewUser) {
    await saveUser(newUser);
    let isNewContact=await checkifContact(newUser)
    if(isNewContact){
    await createNewContactFromUser(newUser)
    }
    cleanValue(username,email,password);
    setJustRegistratedToSessStore(newUser)
    window.location.href = "login.html";
  } else {
    openPopup();
  }
}


function cleanValue(username,email,password){
  username = "";
  email = "";
  password = "";
}


/**
 * function to set a new user to local store
 * @param {string} newUser -Parameter is name of user,who wants to registrate
 */
function setJustRegistratedToSessStore(newUser){
  sessionStorage.setItem("just_reg_email",newUser["email"]);
  sessionStorage.setItem("just_reg_pw",newUser["password"]);
}


function removeJustRegistrated(){
  sessionStorage.removeItem("just_reg_email");
  sessionStorage.removeItem("just_reg_pw");
}


function getJustRegistratedEmail(){
  let email=sessionStorage.getItem("just_reg_email");
  return email
}


function getJustRegistratedPW(){
  let pw=sessionStorage.getItem("just_reg_pw");
  return pw
}


/**
 * function checks if user, who wants to registrate, is new
 * @param {string} newUser -Parameter is name of user,who wants to registrate
 * @returns {boolean} -true if user is new
 */
async function checknewUser(newUser) {
    let isNewUser = true;
    for (let i = 0; i < users.length; i++) {
      if (
        newUser["email"] == users[i]["email"] ||
        newUser["username"] == users[i]["username"]
      ) {
        isNewUser = false;
        break;
      }
    }
    return isNewUser;
  }
    

/**
 * function checks if new user is already in contacts
 * @param {string} newUser -Parameter is name of registrating user
 * @returns {boolean} - true if user is not in contacts yet
 */
async function checkifContact(newUser) {
    let isNewContact = true;
    for (let i = 0; i < loadedContacts.length; i++) {
      if (
        newUser["email"] == loadedContacts[i]["email"]
      ) {
        isNewContact = false;
        break;
      }
    }
    return isNewContact;
  }


/**
 * functions creates a contact from userdates
 * @param {string} newUser - Parameter is name of registrating user
 */
async function createNewContactFromUser(newUser) {
    let newName = newUser["username"];
    let newMail = newUser["email"];
    let newPhone="";
    let color = newUser["color"];
    let newObjekt = { name: newName, email: newMail, phone: newPhone, color: color};
    loadedContacts.push(newObjekt);
    await saveContactsToBackend();
}


/**
 * function creates a random color to new user
 */

function getRandomColor() {
  let letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}


/**
 * function saves all contacts to backend
 */
async function saveContactsToBackend() {
    await downloadFromServer();
    let contactAsText = JSON.stringify(loadedContacts);
    await backend.setItem("contacts", contactAsText);
}


/**
 * function to save all Users at backend
 */
async function saveUsers() {
  let usersAsText = JSON.stringify(users);
  await downloadFromServer();
  await backend.setItem("users", usersAsText);
}


/**
 * function to save Users at Storage
 * @param {string} newUser-Parameter is name of new user
 */
async function saveUser(newUser) {
  users.push(newUser);
  let usersAsText = JSON.stringify(users);
  await downloadFromServer();
  await backend.setItem("users", usersAsText);
}


/**
 * function for opening popups
 */
function openPopup() {
  let popup = document.getElementById("popup-user");
  popup.classList.remove("d-none");
  setTimeout(locateToLogin, 2000);
}


function openPopupMail() {
  let currentmail = document.getElementById("mail-registration").value;
  current_user = users.find((u) => u.email == currentmail);
  if (!current_user) {
    window.location.href = "registration.html";
  } else {
    let popup = document.getElementById("popup-mail");
    popup.classList.remove("d-none");
    setTimeout(changeClass, 100);
  }
}


/**
*function to change classname of popup 
*/
function popupPassChange(){
    let popup = document.getElementById("popup-pw");
    popup.classList.remove("d-none");
    setTimeout(changeClass2, 100);
}


/**
*function to change classname of popup 
*/
function changeClass2() {
    let popup_p = document.getElementById("popup-pw-p");
    popup_p.classList.remove("bottom");
    popup_p.classList.add("center");
    setTimeout(locateToLogin, 3000);
  }


/**
*function to change classname of popup 
*/
function changeClass() {
  let popup_p = document.getElementById("popup-mail-p");
  popup_p.classList.remove("bottom");
  popup_p.classList.add("center");
  setTimeout(newPassword, 3000);
}


/** 
 * function to render site for resetting password
 */
function newPassword() {
  let password_content = document.getElementById("login-container");
  password_content.innerHTML = "";
  password_content.innerHTML = generateResetPassword();
  document.getElementById("popup-mail").classList.add("d-none");
}


/**
 * function to generate the passwort-reset
 */
function generateResetPassword() {
  return `
  <h1>Reset your password</h1>
  <div id="blue-line"></div>
  <p>Change your account password</p>

  <form
    onsubmit="set_new_password();return false"
    onclick="cleanLogin('reseted-password','reseted-password2')"
  >
    <div id="password-cont">
      <img
        id="eyelock"
        src="assets/img/password-icon.svg"
        onclick="event.stopPropagation();changePic('reseted-password','eyelock')"
      />
      <input
        onclick="event.stopPropagation()"
        id="reseted-password"
        class="password-input"
        required
        type="password"
        placeholder="Password"
      />
    </div>
    <div id="password-cont">
      <img
        id="eyelock2"
        src="assets/img/password-icon.svg"
        onclick="event.stopPropagation();changePic('reseted-password2','eyelock2')"
      />
      <input
        onclick="event.stopPropagation()"
        id="reseted-password2"
        class="password-input"
        required
        type="password"
        placeholder="Confirm password"
      />
    </div>
    <div id="confirm-info" class="d-none">Passwörter ungleich</div>
    <!-- <div class="help-container">
    <p
      id="passwordreg-toggle"
      onclick="togglePassword('reseted-password','passwordreg-toggle');togglePassword('reseted-password2','passwordreg-toggle')"
    >
     Passwort zeigen
    </p>
  </div>-->
    <div id="btn-box">
      <button
        id="sign-btn"
        class="login-btn"
        onclick="event.stopPropagation()"
      >
        Continue
      </button>
    </div>
  </form>`;
}


/**
 * function for setting the new password 
 */
async function set_new_password() {
  let password1 = document.getElementById("reseted-password").value;
  let password2 = document.getElementById("reseted-password2").value;
  if (password1 == password2) {
    current_user["password"] = password1;
    for (let i = 0; i < users.length; i++) {
      if (users[i]["username"] == current_user["username"]) {
        users[i]["password"] = current_user["password"];
      }
    }
    await saveUsers();
    popupPassChange();
   
  }else{
    showWarnPW();
    setTimeout(clearWarn,1000)
  }
}


/**functions to change window */
function locateToLogin() {
  window.location.href = "login.html";
}


/**function to change window */
function locateToSignin() {
  window.location.href = "registration.html";
}


/**function to count on session Storage*/
function getNumberOfTry(){
  let tryNumber=sessionStorage.getItem("trynumber");
  if (tryNumber){
  return tryNumber}
  else{
    return 0
  }
}


/**function to count Trys of Login */
function tryOneMore(){
  let n=getNumberOfTry();
  n++;
  if(n<3){
  sessionStorage.setItem("trynumber",n);
  passwordWrong();
  /*openInfoTrysOneMore()*/
}else{
  removeTrys();
  openInfoTrys();
}
}


/**
 * functions to give warning about trys 
 */
 function openInfoTrys(){
  let popup=document.getElementById("popup-trys");
  popup.classList.remove("d-none");
  setTimeout(locateToSignin,1000)
}


function openInfoTrysOneMore(){
  let popup=document.getElementById("popup-try-again");
  popup.classList.remove("d-none");
  setTimeout(locateToLogin,1000);
}


function removeTrys(){
  sessionStorage.removeItem("trynumber");
}


/**
 * functions for remember me 
 */
function checkRemember(logname,logpassword){
  if (document.getElementById("rememberme").checked==true){
    setRemember(logname,logpassword);
  }
  }


function setRemember(logname,logpassword){
  localStorage.setItem("current_logname",logname);
  localStorage.setItem("current_password",logpassword);
}


function getRememberName(){
  return localStorage.getItem("current_logname");
}


function getRememberPW(){
  return localStorage.getItem("current_password");
}


function deleteRemember(){
    localStorage.removeItem("current_logname");
    localStorage.removeItem("current_password");
}


function rememberToForm(){
  let namevalue=getRememberName();
  let pwvalue=getRememberPW();
  if(getRememberName()){
    document.getElementById("mail-login").value=namevalue;
    document.getElementById("password-login").value=pwvalue;
  }
}


  /**
   * functions for toggle value of password-input
   * @param {string} id -parameter is id of input-field
   * @param {string} id_pic -parameter is id of img in input-field
   */
    function getValueLogin(id,id_pic){
    changePic(id,id_pic);
    checkValuePic();
  }


  function changePic(id,id_pic){
    let eye=document.getElementById(id_pic);
    if(eye.getAttribute("src")=="assets/img/password-icon.svg"){
    eye.setAttribute("src","assets/img/eyeopen.svg");
    }else if(eye.getAttribute("src")=="assets/img/eyeopen.svg"){
    eye.setAttribute("src","assets/img/eyeclosed.svg");
    } else{
  eye.setAttribute("src","assets/img/password-icon.svg")
    }
    setTypePassword(id,id_pic);
  }


  function setTypePassword(id,id_pic){
    let eye=document.getElementById(id_pic).getAttribute("src");
    if (eye=="assets/img/eyeopen.svg"){
        document.getElementById(id).setAttribute("type","text");
    }else{
      document.getElementById(id).setAttribute("type","password")
    }
  }


  function checkValuePic(){
    let eye=document.getElementById("eyelock").getAttribute("src");
    if(eye=="assets/img/password-icon.svg"){
      renderValueLogin();
    }
  }


  function cleanLogin(id1,id2,id3=""){
    document.getElementById(id1).value="";
    document.getElementById(id2).value="";
    if(id3){
      document.getElementById(id3).value="";
    }
  }


  function renderValueLogin(){
    let name=getRememberName();
    let pw=getRememberPW();
    if(name && isNoValue()){
      document.getElementById("mail-login").value=name;
      document.getElementById("password-login").value=pw;
    }
  }

  
  function isNoValue(){
    if( document.getElementById("mail-login").value=="" ||
    document.getElementById("password-login").value==""){
      return true
    }
  }


  function passwordWrong(){
    let info=document.getElementById("new-password");
    info.innerHTML="Passwort falsch";
    info.style.color="red";
    info.onclick = onclickReaction(false);
    setTimeout(cleanPassword,1000)
  }


  function cleanPassword(){
    document.getElementById("password-login").value="";
    let info=document.getElementById("new-password");
    info.innerHTML="Passwort vergessen";
    info.style.color="rgb(40, 171, 226)";
    info.onclick = onclickReaction(true);
  }
  

  function onclickReaction(react){
        return react;
  }

  
  function showWarnPW(){
    document.getElementById("confirm-info").classList.remove("d-none");
  }


  function clearWarn(){
    document.getElementById("confirm-info").classList.add("d-none");
    cleanLogin("reseted-password","reseted-password2");
  }

  


 


  


