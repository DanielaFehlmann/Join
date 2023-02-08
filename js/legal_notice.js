async function init() {
  await includeHTML();
  getLocalCurrentUser();
  setUserImg();
}


function getLocalCurrentUser() {
  let currentUserAsText = localStorage.getItem('current_user');
  if (currentUserAsText) {
    current_user = JSON.parse(currentUserAsText);
  }
}
