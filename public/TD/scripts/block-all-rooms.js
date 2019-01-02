(function() {
  var datePicker = new mdDateTimePicker.default({
    type: "date",
    past: moment(),
    future: moment().add(6, "months")
  });

  var startTimePicker = new mdDateTimePicker.default({
    type: "time",
    mode: true
  });

  var endTimePicker = new mdDateTimePicker.default({
    type: "time",
    mode: true
  });

  document.getElementById("date").addEventListener("focus", function() {
    document.getElementById("date").blur();
    document.getElementById("dateBtn").click();
  });

  document.getElementById("time-start").addEventListener("focus", function() {
    document.getElementById("time-start").blur();
    document.getElementById("startBtn").click();
  });

  document.getElementById("time-end").addEventListener("focus", function() {
    document.getElementById("time-end").blur();
    document.getElementById("endBtn").click();
  });

  document.getElementById("dateBtn").addEventListener("click", function() {
    datePicker.toggle();
    document.getElementById("resDiv").innerHTML = "";
    document.getElementById("time-end").value = "";
    document.getElementById("time-end").parentNode.classList.remove("is-dirty");
    document.getElementById("time-start").value = "";
  });

  document.getElementById("startBtn").addEventListener("click", function() {
    startTimePicker.toggle();
  });

  document.getElementById("endBtn").addEventListener("click", function() {
    endTimePicker.toggle();
  });

  datePicker.trigger = document.getElementById("date");
  startTimePicker.trigger = document.getElementById("time-start");
  endTimePicker.trigger = document.getElementById("time-end");

  document.getElementById("date").addEventListener("onOk", function() {
    this.value = moment(datePicker.time).format("ddd DD MMM YYYY");
    this.parentNode.classList.add("is-dirty");
  });

  document.getElementById("time-start").addEventListener("onOk", function() {
    this.value = moment(startTimePicker.time).format("HH:mm");
    this.parentNode.classList.add("is-dirty");
  });

  document.getElementById("time-end").addEventListener("onOk", function() {
    this.value = moment(endTimePicker.time).format("HH:mm");
    this.parentNode.classList.add("is-dirty");
  });
}.call(this));
