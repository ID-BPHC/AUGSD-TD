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
    document
      .getElementById("time-start")
      .parentNode.classList.remove("is-dirty");
  });

  document.getElementById("startBtn").addEventListener("click", function() {
    startTimePicker.time = moment()
      .endOf("hour")
      .add(1, "minute");
    document.getElementById("resDiv").innerHTML = "";

    var selectedDate = parseInt(datePicker.time.get("date").toString());
    var selectedMonth = parseInt(datePicker.time.get("month").toString());
    var todayDate = parseInt(
      moment()
        .get("date")
        .toString()
    );
    var todayMonth = parseInt(
      moment()
        .get("month")
        .toString()
    );
    var hours = document.getElementById("mddtp-time__hourView").childNodes;

    var i = 1;
    startTimePicker.toggle();

    for (i = 1; i <= 24; i++) {
      hours[i - 1].style.visibility = "visible";
    }

    if (selectedDate == todayDate && selectedMonth == todayMonth) {
      var nowHour = parseInt(
        moment()
          .get("hour")
          .toString()
      );
      for (i = 1; i <= nowHour; i++) {
        hours[i - 1].style.visibility = "hidden";
      }
    }

    document.getElementById("time-end").value = "";
    document.getElementById("time-end").parentNode.classList.remove("is-dirty");
  });

  document.getElementById("endBtn").addEventListener("click", function() {
    document.getElementById("resDiv").innerHTML = "";
    endTimePicker.time = startTimePicker.time;
    var hours = document.getElementById("mddtp-time__hourView").childNodes;
    endTimePicker.toggle();
    var startHour = parseInt(startTimePicker.time.get("hour").toString());
    var i = 1;
    for (i = 1; i <= startHour - 1; i++) {
      hours[i - 1].style.visibility = "hidden";
    }
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

  document.getElementById("findBtn").addEventListener("click", function() {
    document.getElementById("resDiv").innerHTML =
      "<br><div class='loadingSign'></div><br>";
    axios
      .post("./fetch-list/" + +new Date(), {
        date: document.getElementById("date").value,
        "time-start": document.getElementById("time-start").value,
        "time-end": document.getElementById("time-end").value,
        purpose: document.getElementById("purpose").value,
        phone: document.getElementById("phone").value,
        av: document.getElementById("av").value
      })
      .then(function(res) {
        document.getElementById("resDiv").innerHTML = res.data;

        var listItems = Array.prototype.slice.call(
          document.getElementsByClassName("room-list-item")
        );
        listItems.forEach(function(item) {
          item.onclick = function() {
            let state = document.getElementById("room-" + item.id).checked;
            document.getElementById("room-" + item.id).checked = !state;
          };
        });

        document
          .getElementById("bookBtn")
          .addEventListener("click", function() {
            let checkboxes = document.getElementsByClassName("room-checkbox");
            let accept = document.getElementById("damage-agree");
            let rooms = [];
            let i = 0;

            for (i = 0; i < checkboxes.length; i++) {
              if (checkboxes[i].checked) rooms.push(checkboxes[i].name);
            }

            axios.post("./submit", { rooms }).then(function(res) {
              if(accept.checked){
              if (res.data.booked == 1) {
                materialAlert(
                  "Success",
                  "Your booking request has been placed. Please check your email for further details.",
                  function(result) {
                    window.location.replace("./view");
                  }
                );
              } else if (res.data.partialBooking == 1) {
                materialAlert(
                  "Error",
                  "The following rooms were booked by someone else while you were doing the booking. Please select some other rooms to continue or click the find button again to refresh this list. <br><br>" +
                    res.data.notAvailable.toString(),
                  function(result) {}
                );
              } else if (res.data.noWorkingHours == 1) {
                materialAlert(
                  "Error",
                  "There are no working office-hours to process your booking.",
                  function(result) {}
                );
              } else if (res.data.allBlocked == 1) {
                materialAlert(
                  "Error",
                  "All rooms for the selected date/time are blocked.",
                  function(result) {}
                );
              }
            }
            else
            {
              materialAlert(
                    "Error",
                    "Please agree to the Terms and Conditions",
                    function(result) {}
                  );
            }
            });
          });
      })
      .catch(function(err) {
        document.getElementById("resDiv").innerHTML = err.response.data;
      });
  });
}.call(this));
