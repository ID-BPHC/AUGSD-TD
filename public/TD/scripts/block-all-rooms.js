(function() {
  var startDatePicker = flatpickr("#start-date", {
    dateFormat: "D d M Y",
    minDate: moment().toDate(),
    maxDate: moment().add(6, "months").toDate(),
    onChange: function() {
      document.getElementById("start-date").parentNode.classList.add("is-dirty");
      document.getElementById("time-end").value = "";
      document.getElementById("time-end").parentNode.classList.remove("is-dirty");
      document.getElementById("time-start").value = "";
    }
  });

  var endDatePicker = flatpickr("#end-date", {
    dateFormat: "D d M Y",
    minDate: moment().toDate(),
    maxDate: moment().add(6, "months").toDate(),
    onChange: function() {
      document.getElementById("end-date").parentNode.classList.add("is-dirty");
      document.getElementById("time-end").value = "";
    }
  });

  var startTimePicker = flatpickr("#time-start", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    onChange: function() {
      document.getElementById("time-start").parentNode.classList.add("is-dirty");
    }
  });

  var endTimePicker = flatpickr("#time-end", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    onChange: function() {
      document.getElementById("time-end").parentNode.classList.add("is-dirty");
    }
  });

  document.getElementById("startDateBtn").addEventListener("click", function() {
    startDatePicker.open();
  });

  document.getElementById("startBtn").addEventListener("click", function() {
    startTimePicker.open();
  });

  document.getElementById("endDateBtn").addEventListener("click", function() {
    endDatePicker.open();
  });

  document.getElementById("endBtn").addEventListener("click", function() {
    endTimePicker.open();
  });
}.call(this));
