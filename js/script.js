let all_tasks=[];
let current_img;
let users=[];
let current_task=[];
let current_user=[];


async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        file = element.getAttribute("w3-include-html"); // "includes/header.html"
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}


function checkWindow() {
  if (window.location.href.indexOf("summary") > -1) {
    document.getElementById('summaryBg').classList.add('bgColor');
  } else if (window.location.href.indexOf("board") > -1) {
    document.getElementById('boardBg').classList.add('bgColor');
  } else if (window.location.href.indexOf("add") > -1) {
    document.getElementById('addTaskBg').classList.add('bgColor');
  } else if (window.location.href.indexOf("contacts") > -1) {
    setInterval(() => {
    document.getElementById('contactsBg').classList.add('bgColor');
    }, 500);
  } else if (window.location.href.indexOf("legal") > -1) {
    document.getElementById('legalNoticeBg').classList.add('bgColor');
  }
}