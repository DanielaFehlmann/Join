let colors = ['#e200be','#1fd7c1','#0038ff','#ff8a00','#2ad300','#ff0000','#8aa4ff'];
let selectedCategory;
let selectedColor;


/**
 * function to disable and enable the category-inputfield
 */
function disableInput () {
  if (document.getElementById('category').disabled = true) {
    document.getElementById('category').disabled = false;
  } else {
    document.getElementById('category').disabled = true;
  }
}


/**
 * function to add a existing category and its color to the array "selectedCategory"
 *
 * @param {number} i - number to get the correct ID
 */
function addCategory(i) {
  let categoryName = document.getElementById('category');
  categoryName.style.color = 'black';
  document.getElementById('category').value = document.getElementById('category' + i).innerHTML;
  document.getElementById('categoryColor').innerHTML = document.getElementById('imageCat' + i).innerHTML;
  document.getElementById('categoryImage').innerHTML = `<img src="assets/img/arrow_drop.svg">`;
  openCloseCategories();
  selectedCategory = '';
  selectedColor = '';
  selectedCategory = categoryName.value;
  selectedColor = colors[i];
}


/**
 * function to make the container editable that you can write in your own category and select a color
 */
function addNewCategory() {
  let categoryName = document.getElementById('category');
  openCloseCategories();
  categoryName.value = '';
  categoryName.style.color = 'black';
  selectedCategory = '';
  selectedColor = '';
  document.getElementById('categoryImage').innerHTML = `<div onclick="notOpenCloseCategories(event)" class="crossAndCheck"><img src="assets/img/cross.svg" onclick="cancelNewCategory()"> <img src="assets/img/finish.svg" onclick="acceptNewCategory()"></div>`;
  document.getElementById('categoryColors').classList.remove('d-none');
  document.getElementById('selectField').removeAttribute('onclick');
  document.getElementById('categoryColor').innerHTML = '';
  categoryName.focus();
}


/**
 * function to add the selected color to the new category
 * 
 * @param {number} i - number to get the correct color
 */
function changeColor(i) {
  document.getElementById('categoryColor').innerHTML = document.getElementById('changeColor' + i).innerHTML;
  document.getElementById('category').focus();
  selectedColor = '';
  selectedColor = colors[i];
}


/**
 * function to delete the new category and reset the category-field
 */
function cancelNewCategory() {
  let categoryName = document.getElementById('category');
  categoryName.value = '';
  categoryName.placholder = 'Select task category';
  categoryName.style.color = '#dcdcdc';
  document.getElementById('categoryImage').innerHTML = `<img src="assets/img/arrow_drop.svg">`;
  document.getElementById('categoryColors').classList.add('d-none');
  document.getElementById('selectField').setAttribute('onclick', 'openCloseCategories()');
  document.getElementById('categoryColor').innerHTML = '';
}


/**
 * function to add the new category and its color to the array "selectedCategory"
 */
function acceptNewCategory() {
  if (selectedColor && !(document.getElementById('category').value == '')) {
    let categoryName = document.getElementById('category');
    document.getElementById('categoryImage').innerHTML = `<img src="assets/img/arrow_drop.svg">`;
    document.getElementById('selectField').setAttribute('onclick', 'openCloseCategories()');
    document.getElementById('categoryColors').classList.add('d-none');
    selectedCategory = '';
    selectedCategory = categoryName.value;
  }
}


/**
 * function to open or close the category-field by clicking on it
 */
function openCloseCategories() {
  if (document.getElementById('selectField').style.height == '192px') {
    if ($(window).width() > 720) {
    document.getElementById('selectField').style.height = '53px';
    } else {
      document.getElementById('selectField').style.height = '43px';
    }
    document.getElementById('openedCategories').classList.add('d-none');
  } else {
    document.getElementById('selectField').setAttribute('style', 'height: 192px !important;');
    setTimeout(function () {
      document.getElementById('openedCategories').classList.remove('d-none');
    }, 150)
  }
  disableInput();
}


// function checkMediaQuery() {
//   if ((window.innerWidth == 715) || (window.innerWidth == 725)) {
//     console.log('bigscreen');
//     openCloseCategories();
//   }
// }


// window.addEventListener('resize', checkMediaQuery);


/**
 * function to prevent to open or close the category-field
 */
function notOpenCloseCategories(event) {
  event.stopPropagation();
}