/**function to go to login-window */
function logout() {
  document.getElementById("popup-logout").classList.add("d-none");
  resetUser();
  unstoreSession();
  window.location.href = "login.html";
}


/**function to remove session */
function unstoreSession(){
  sessionStorage.removeItem("session")
}


/**function that toogles the display of logout-opportunity*/
function showLogout() {
  let logout = document.getElementById("popup-logout");
  if (logout.classList.contains("d-none")) {
    logout.classList.remove("d-none");
  } else {
    logout.classList.add("d-none");
  }
}


/**function to clear variables at logout */
function resetUser() {
  all_tasks = [];
  current_img = "./assets/img/user_prototype.png";
  users = [];
  current_task = [];
  current_user = [];
  current_user = [];
  localStorage.removeItem("current_user");
}


/**function to set the user color as background head pic */
function setUserImg() {
  if (current_user["img"]) {
    document
      .getElementById("user-img")
      .setAttribute("src", current_user["img"]);
  } else {
    document.getElementById("real-img").classList.add("d-none");
    let user_img = document.getElementById("user-img");
    user_img.style.backgroundColor=current_user["color"];
    user_img.innerHTML = createUserPic();
  }
}


/**function to create first letters to head pic */
function createUserPic() {
  let name_part = current_user["username"].split(" ");
  for (let i = 0; i < name_part.length; i++) {
    let part1 = name_part[i].charAt(0).toUpperCase();
    let part2;
    if (name_part[1]) {
      part2 = name_part[1].charAt(0).toUpperCase();
      return `${part1}${part2}`
    }else{
    return `${part1}`;
        }
    }
}


function locateToLegalNote() {
  window.location.href = "legalnotice.html";
}


function locateToHelp() {
  window.location.href = "help.html";
}