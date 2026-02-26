(function() {

  var currentDate = moment();
  var currentDay = currentDate.day();
  var currentHour = currentDate.hours();
  var currentMinutes = currentDate.minutes();
  var defaultDate = moment().add(1, "days");

    // Check if the current time is more than 4:30 pm on weekdays
  if ((currentDay !== 6 && currentDay !== 7) && (currentHour > 16 || (currentHour === 16 && currentMinutes >= 30))) {
    // If it is, set the default date to tomorrow
    defaultDate = moment().add(1, "days");
  } else if (currentDay === 6 && (currentHour > 12 || (currentHour === 12 && currentMinutes >= 30))) {
    // If it's Saturday after 12:30 pm, set the default date to the day after tomorrow
    defaultDate = moment().add(2, "days");
  } else if (currentDay === 7) {
    // If it's Sunday, set the default date to tomorrow
    defaultDate = moment().add(1, "days");
  } else {
    defaultDate = moment();
  }

  var datePicker = flatpickr("#date", {
    dateFormat: "D d M Y",
    defaultDate: defaultDate.toDate(),
    minDate: defaultDate.toDate(),
    maxDate: moment().add(6, "months").toDate(),
    onChange: function() {
      document.getElementById("date").parentNode.classList.add("is-dirty");
      document.getElementById("resDiv").innerHTML = "";
      document.getElementById("time-end").value = "";
      document.getElementById("time-end").parentNode.classList.remove("is-dirty");
      document.getElementById("time-start").value = "";
      document.getElementById("time-start").parentNode.classList.remove("is-dirty");
    }
  });

  var datePickerEnd = flatpickr("#date-end", {
    dateFormat: "D d M Y",
    defaultDate: defaultDate.toDate(),
    minDate: defaultDate.toDate(),
    maxDate: moment().add(6, "months").toDate(),
    onChange: function() {
      document.getElementById("date-end").parentNode.classList.add("is-dirty");
      document.getElementById("resDiv").innerHTML = "";
      document.getElementById("time-end").value = "";
      document.getElementById("time-end").parentNode.classList.remove("is-dirty");
      document.getElementById("time-start").value = "";
      document.getElementById("time-start").parentNode.classList.remove("is-dirty");
    }
  });


  var startTimePicker = flatpickr("#time-start", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    defaultDate: moment().endOf("hour").add(1, "minute").toDate(),
    onChange: function() {
      document.getElementById("time-start").parentNode.classList.add("is-dirty");
      document.getElementById("resDiv").innerHTML = "";
      document.getElementById("time-end").value = "";
      document.getElementById("time-end").parentNode.classList.remove("is-dirty");
    }
  });

  var endTimePicker = flatpickr("#time-end", {
    enableTime: true,
    noCalendar: true,
    dateFormat: "H:i",
    time_24hr: true,
    onChange: function() {
      document.getElementById("time-end").parentNode.classList.add("is-dirty");
      document.getElementById("resDiv").innerHTML = "";
    }
  });

  document.getElementById("dateBtn").addEventListener("click", function() {
    datePicker.open();
  });

  document.getElementById("dateBtnEnd").addEventListener("click", function() {
    datePickerEnd.open();
  });

  document.getElementById("startBtn").addEventListener("click", function() {
    startTimePicker.open();
  });

  document.getElementById("endBtn").addEventListener("click", function() {
    if (document.getElementById("time-start").value) {
      endTimePicker.setDate(document.getElementById("time-start").value);
    }
    endTimePicker.open();
  });

  function enumerateDaysBetweenDates(startDate, endDate) {
    let dates = [];
    while (moment(startDate) <= moment(endDate)) {
      dates.push(startDate);
      startDate = moment(startDate)
        .add(1, "days")
        .format("ddd DD MMM YYYY");
    }
    if (dates.length) {
      return dates;
    } else {
      return [null];
    }
  }

  document
    .getElementById("findBtn")
    .addEventListener("click", async function() {
      let startDate = document.getElementById("date").value;
      let endDate = document.getElementById("date-end").value
        ? document.getElementById("date-end").value
        : document.getElementById("date").value;
      const dates = enumerateDaysBetweenDates(startDate, endDate);
      document.getElementById("resDiv").innerHTML =
        "<br><div class='loadingSign'></div><br>";
      try {
        const responses = await Promise.all(
          dates.map(
            async (date) =>
              (await axios.post("./fetch-list/" + +new Date(), {
                date: date,
                dates: dates,
                "time-start": document.getElementById("time-start").value,
                "time-end": document.getElementById("time-end").value,
                purpose: document.getElementById("purpose").value,
                phone: document.getElementById("phone").value,
                av: document.getElementById("av").value,
              })).data
          )
        );

        const filteredResponses = responses.map((res) => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(res, "text/html");
  
          const reprographyRooms = ["D319/A", "I015"];
          const listItems = doc.querySelectorAll(".room-list-item");
          listItems.forEach((item) => {
            const roomNumber = item.id;
            if (!reprographyRooms.includes(roomNumber)) {
              item.remove();
            }
          });
  
          return doc.body.innerHTML;
        });

        if (filteredResponses.length) {
          document.getElementById("resDiv").innerHTML = filteredResponses[0];
          let startTime = document.getElementById("time-start").value;
          let endTime = document.getElementById("time-end").value;
          const dateTimeString = `${dates.join(
            ", "
          )} : ${startTime} - ${endTime}`;
          document
            .getElementById("resDiv")
            .querySelector("b").textContent = dateTimeString;
        }

        let innerHTMLContainer = document.createElement("div");
        filteredResponses.map((res) => {
          innerHTMLContainer.innerHTML += res;
        });

        let maxFrequency = filteredResponses?.length;

        var listItemsRepeat = Array.prototype.slice.call(
          innerHTMLContainer.getElementsByClassName("room-list-item")
        );

        const frequency = {};
        const listItems = [];

        for (const element of listItemsRepeat) {
          const id = element.getAttribute("id");
          if (!frequency[id]) {
            frequency[id] = 0;
          }
          frequency[id] += 1;
          if (frequency[id] === maxFrequency) {
            listItems.push(element);
          }
        }

        if (listItems.length == 0) {
          document.getElementById(
            "resDiv"
          ).innerHTML = `<br><p>The following error occoured while processing your request</p><p><b>All the rooms for the selected date-time have been blocked by the administrator. Please contact Timetable Office for further assistance.</b></p><br>`;
        } else {
          document.querySelector("#room-list-form ul.mdl-list").innerHTML = "";

          listItems.forEach(function(item) {
            document
              .querySelector("#room-list-form ul.mdl-list")
              .appendChild(item);
            document
              .getElementById("room-" + item.id)
              .addEventListener("click", (e) => {
                e.stopPropagation();
              });
            item.addEventListener("click", () => {
              let state = document.getElementById("room-" + item.id).checked;
              document.getElementById("room-" + item.id).checked = !state;
            });
          });

          document
            .getElementById("bookBtn")
            .addEventListener("click", function() {
              let checkboxes = document.getElementsByClassName("room-checkbox");
              let rooms = [];
              let i = 0;

              for (i = 0; i < checkboxes.length; i++) {
                if (checkboxes[i].checked) rooms.push(checkboxes[i].name);
              }

              if (rooms.length) {
                axios.post("./submit", { rooms }).then(function(res) {
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
                });
              } else {
                materialAlert(
                  "Error",
                  "Please select a room before booking.",
                  function(result) {}
                );
              }
            });
        }
      } catch (err) {
        console.log(err);
        document.getElementById("resDiv").innerHTML =
          err?.response?.data || err;
      }
    });
}.call(this));
