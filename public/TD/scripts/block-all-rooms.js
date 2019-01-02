(function() {
  var startDatePicker = new mdDateTimePicker.default({
    type: "date",
    past: moment(),
    future: moment().add(6, "months")
  });
  var endDatePicker = new mdDateTimePicker.default({
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

  document.getElementById("start-date").addEventListener("focus", function() {
    document.getElementById("start-date").blur();
    document.getElementById("startDateBtn").click();
  });

  document.getElementById("time-start").addEventListener("focus", function() {
    document.getElementById("time-start").blur();
    document.getElementById("startBtn").click();
  });
  document.getElementById("end-date").addEventListener("focus", function() {
    document.getElementById("end-date").blur();
    document.getElementById("endDateBtn").click();
  });

  document.getElementById("time-end").addEventListener("focus", function() {
    document.getElementById("time-end").blur();
    document.getElementById("endBtn").click();
  });

  document.getElementById("startDateBtn").addEventListener("click", function() {
    startDatePicker.toggle();
    document.getElementById("time-end").value = "";
    document.getElementById("time-end").parentNode.classList.remove("is-dirty");
    document.getElementById("time-start").value = "";
  });

  document.getElementById("startBtn").addEventListener("click", function() {
    startTimePicker.toggle();
  });

  document.getElementById("endDateBtn").addEventListener("click", function() {
    endDatePicker.toggle();
    document.getElementById("time-end").value = "";
  });

  document.getElementById("endBtn").addEventListener("click", function() {
    endTimePicker.toggle();
  });

  startDatePicker.trigger = document.getElementById("start-date");
  startTimePicker.trigger = document.getElementById("time-start");
  endDatePicker.trigger = document.getElementById("end-date");
  endTimePicker.trigger = document.getElementById("time-end");

  document.getElementById("start-date").addEventListener("onOk", function() {
    this.value = moment(startDatePicker.time).format("ddd DD MMM YYYY");
    this.parentNode.classList.add("is-dirty");
  });
  document.getElementById("end-date").addEventListener("onOk", function() {
    this.value = moment(endDatePicker.time).format("ddd DD MMM YYYY");
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
