function materialAlert(e, t, a) {
  (document.getElementById("materialModalTitle").innerHTML = e),
    (document.getElementById("materialModalText").innerHTML = t),
    (document.getElementById("materialModalButtonCANCEL").style.display =
      "none"),
    (document.getElementById("materialModal").className = "show"),
    (materialCallback = a);
}
function materialConfirm(e, t, a) {
  materialAlert(e, t, a),
    (document.getElementById("materialModalButtonCANCEL").style.display =
      "block");
}
function closeMaterialAlert(e, t) {
  e.stopPropagation(),
    (document.getElementById("materialModal").className = "hide"),
    "function" == typeof materialCallback && materialCallback(t);
}
(materialCallback = null),
  window.addEventListener("load", function() {
    console.log("material-modal.js v1.1");
    var e = document.createElement("div");
    (e.id = "materialModal"),
      (e.className = "hide"),
      e.setAttribute("onclick", "closeMaterialAlert(event, false);");
    var t = document.createElement("div");
    t.id = "materialModalCentered";
    var a = document.createElement("div");
    (a.id = "materialModalContent"),
      a.setAttribute("onclick", "event.stopPropagation();");
    var l = document.createElement("div");
    l.id = "materialModalTitle";
    var n = document.createElement("div");
    n.id = "materialModalText";
    var d = document.createElement("div");
    d.id = "materialModalButtons";
    var i = document.createElement("div");
    (i.id = "materialModalButtonOK"),
      (i.className = "materialModalButton"),
      i.setAttribute("onclick", "closeMaterialAlert(event, true);"),
      (i.innerHTML = "OK");
    var o = document.createElement("div");
    (o.id = "materialModalButtonCANCEL"),
      (o.className = "materialModalButton"),
      o.setAttribute("onclick", "closeMaterialAlert(event, false);"),
      (o.innerHTML = "CANCEL"),
      d.appendChild(i),
      d.appendChild(o),
      a.appendChild(l),
      a.appendChild(n),
      a.appendChild(d),
      t.appendChild(a),
      e.appendChild(t),
      document.body.appendChild(e);
  });
