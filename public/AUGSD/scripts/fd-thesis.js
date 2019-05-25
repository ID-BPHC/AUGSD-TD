let addListItem = document.getElementsByClassName("add-form")[0];
let newForms = document.getElementsByClassName("new-forms")[0];
let oldForms = document.getElementsByClassName("old-forms")[0];
addListItem.onclick = function() {
  let li = document.createElement("li");
  liCount = newForms.childElementCount;
  newForms.appendChild(li);
  let input = document.createElement("input");
  input.name = "form" + liCount;
  input.type = "file";

  i = document.createElement("i");
  i.className = "mdl-icon-toggle__label";
  i.classList.add("material-icons");
  i.classList.add("delete-icon");
  i.innerHTML = "minimize";
  span = document.createElement("span");
  span.appendChild(i);
  li.appendChild(input);
  li.appendChild(span);
  updateNewList();
};
function updateNewList() {
  deleteIcons = document.getElementsByClassName("delete-icon");
  for (let i = 0; i < deleteIcons.length; i++) {
    deleteIcons[i].onclick = function() {
      let liDelete = deleteIcons[i].parentElement.parentElement;
      newForms.removeChild(liDelete);
      updateNewList();
    };
  }
}
function updateOldList() {
  deleteIcons = document.getElementsByClassName("delete-icon");
  for (let i = 0; i < deleteIcons.length; i++) {
    deleteIcons[i].onclick = function() {
      let liDelete = deleteIcons[i].parentElement.parentElement;
      oldForms.removeChild(liDelete);
      updateOldList();
    };
  }
}
deleteIcons = document.getElementsByClassName("delete-icon");
if (deleteIcons) {
  updateNewList();
  updateOldList();
}
