(function() {
  var currentDate = moment();
  var currentDay = currentDate.day();
  var currentHour = currentDate.hours();
  var currentMinutes = currentDate.minutes();
  var defaultDate;

  // Check if the current time is more than 4:30 pm on weekdays
  if (
    currentDay !== 0 &&
    currentDay !== 6 &&
    (currentHour > 16 || (currentHour === 16 && currentMinutes >= 30))
  ) {
    // If it is, set the default date to tomorrow
    defaultDate = moment().add(1, "days");
  } else if (currentDay === 6 && currentHour > 12) {
    // If it's Saturday after 12 pm, set the default date to the next Monday
    defaultDate = moment().add(2, "days");
  } else if (currentDay === 0) {
    // If it's Sunday, set the default date to Monday
    defaultDate = moment().add(1, "days");
  } else {
    // If it's before 4:30 pm, set the default date to today
    defaultDate = moment();
  }

  var datePicker = new mdDateTimePicker.default({
    type: "date",
    defaultDate: defaultDate,
    past: defaultDate, // Set the default date
    future: moment().add(6, "months"),
  });

  var datePickerEnd = new mdDateTimePicker.default({
    type: "date",
    defaultDate: defaultDate,
    past: defaultDate, // Set the default date
    future: moment().add(6, "months"),
  });

  var startTimePicker = new mdDateTimePicker.default({
    type: "time",
  });

  var endTimePicker = new mdDateTimePicker.default({
    type: "time",
  });

  document.getElementById("date").addEventListener("focus", function() {
    document.getElementById("date").blur();
    document.getElementById("dateBtn").click();
  });

  document.getElementById("date-end").addEventListener("focus", function() {
    document.getElementById("date-end").blur();
    document.getElementById("dateBtnEnd").click();
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

  document.getElementById("dateBtnEnd").addEventListener("click", function() {
    datePickerEnd.toggle();
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
        // hours[i - 1].style.visibility = "hidden";
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
      // hours[i - 1].style.visibility = "hidden";
    }
  });

  datePicker.time = defaultDate;
  datePicker.toggle();

  datePickerEnd.time = defaultDate;
  datePickerEnd.toggle();

  datePicker.trigger = document.getElementById("date");
  datePickerEnd.trigger = document.getElementById("date-end");
  startTimePicker.trigger = document.getElementById("time-start");
  endTimePicker.trigger = document.getElementById("time-end");

  document.getElementById("date").addEventListener("onOk", function() {
    this.value = moment(datePicker.time).format("ddd DD MMM YYYY");
    this.parentNode.classList.add("is-dirty");
  });

  document.getElementById("date-end").addEventListener("onOk", function() {
    this.value = moment(datePickerEnd.time).format("ddd DD MMM YYYY");
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
      // Validate duration before proceeding
      let startTime = document.getElementById("time-start").value;
      let endTime = document.getElementById("time-end").value;
      
      if (startTime && endTime) {
        const start = moment(startTime, "HH:mm");
        const end = moment(endTime, "HH:mm");
        const duration = moment.duration(end.diff(start));
        const hours = duration.asHours();
        
        if (hours > 2) {
          document.getElementById("resDiv").innerHTML = 
            "<br><p>The following error occurred while processing your request</p><p><b>Booking duration cannot exceed 2 hours</b></p><br>";
          return;
        }
        
        // Check if start time is between 9:30 PM and 6:00 AM
        if ((start.isSameOrAfter(moment("21:30", "HH:mm")) && start.isSameOrBefore(moment("23:59", "HH:mm"))) ||
            (start.isSameOrAfter(moment("00:00", "HH:mm")) && start.isSameOrBefore(moment("06:00", "HH:mm")))) {
          document.getElementById("resDiv").innerHTML = 
            "<br><p>The following error occurred while processing your request</p><p><b>Start time must not be between 9:30 PM and 6:00 AM</b></p><br>";
          return;
        }
        
        // Check if end time is between 9:30 PM and 6:00 AM
        if ((end.isSameOrAfter(moment("21:30", "HH:mm")) && end.isSameOrBefore(moment("23:59", "HH:mm"))) ||
            (end.isSameOrAfter(moment("00:00", "HH:mm")) && end.isSameOrBefore(moment("06:00", "HH:mm")))) {
          document.getElementById("resDiv").innerHTML = 
            "<br><p>The following error occurred while processing your request</p><p><b>End time must not be between 9:30 PM and 6:00 AM</b></p><br>";
          return;
        }
      }
      
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
          reprographyRooms.forEach((room) => {
            const reprographyElement = doc.getElementById(room);
            if (reprographyElement) {
              reprographyElement.remove();
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
            .getElementById("room-list-filter-max-input")
            .addEventListener("focusin", function() {
              let ele = document.getElementById("room-list-filter-max-input");
              ele.parentNode.classList.add("is-dirty");
            });

          document
            .getElementById("room-list-filter-max-input")
            .addEventListener("focusout", function() {
              let ele = document.getElementById("room-list-filter-max-input");
              if (ele.value.trim() == "")
                ele.parentNode.classList.remove("is-dirty");
            });

          document
            .getElementById("room-list-filter-max-input")
            .addEventListener("change", function() {
              let ele = document.getElementById("room-list-filter-max-input");
              if (ele.value.trim() != "")
                ele.parentNode.classList.add("is-dirty");
              else ele.parentNode.classList.remove("is-dirty");
            });

          document
            .getElementById("room-list-filter-min-input")
            .addEventListener("focusin", function() {
              let ele = document.getElementById("room-list-filter-min-input");
              ele.parentNode.classList.add("is-dirty");
            });

          document
            .getElementById("room-list-filter-min-input")
            .addEventListener("focusout", function() {
              let ele = document.getElementById("room-list-filter-min-input");
              if (ele.value.trim() == "")
                ele.parentNode.classList.remove("is-dirty");
            });

          document
            .getElementById("room-list-filter-min-input")
            .addEventListener("change", function() {
              let ele = document.getElementById("room-list-filter-min-input");
              if (ele.value.trim() != "")
                ele.parentNode.classList.add("is-dirty");
              else ele.parentNode.classList.remove("is-dirty");
            });

          document
            .getElementById("filterBtn")
            .addEventListener("click", function() {
              let maxCapacity = parseInt(
                document
                  .getElementById("room-list-filter-max-input")
                  .value.trim()
              );
              let minCapacity = parseInt(
                document
                  .getElementById("room-list-filter-min-input")
                  .value.trim()
              );
              let items = Array.from(
                document.getElementsByClassName("room-list-item")
              );
              items.forEach(function(item) {
                item.style.display = "flex";
              });
              if (maxCapacity != NaN) {
                items.forEach(function(item) {
                  if (
                    parseInt(
                      item.children[0].children[2].textContent.match(
                        /Lecture Capacity: (\d+) -/
                      )[1]
                    ) > maxCapacity
                  )
                    item.style.display = "none";
                });
              }
              if (minCapacity != NaN) {
                items.forEach(function(item) {
                  if (
                    parseInt(
                      item.children[0].children[2].textContent.match(
                        /Lecture Capacity: (\d+) -/
                      )[1]
                    ) < minCapacity
                  )
                    item.style.display = "none";
                });
              }
            });

          Array.from(document.getElementsByClassName("room-checkbox")).forEach(
            function(item) {
              item.addEventListener("click", function() {
                let totalRooms = parseInt(
                  document.getElementById("total-rooms").textContent
                );
                let totalLectureCapacity = parseInt(
                  document.getElementById("total-lecture-capacity").textContent
                );
                let totalExamCapacity = parseInt(
                  document.getElementById("total-exam-capacity").textContent
                );

                if (item.checked) {
                  totalRooms++;
                  totalLectureCapacity += parseInt(
                    item.getAttribute("lecture-capacity")
                  );
                  totalExamCapacity += parseInt(
                    item.getAttribute("exam-capacity")
                  );
                } else {
                  totalRooms--;
                  totalLectureCapacity -= parseInt(
                    item.getAttribute("lecture-capacity")
                  );
                  totalExamCapacity -= parseInt(
                    item.getAttribute("exam-capacity")
                  );
                }

                document.getElementById("total-rooms").textContent = totalRooms;
                document.getElementById(
                  "total-lecture-capacity"
                ).textContent = totalLectureCapacity;
                document.getElementById(
                  "total-exam-capacity"
                ).textContent = totalExamCapacity;
              });
            }
          );

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
                  } else if (res.data.dailyLimitExceeded == 1) {
                    materialAlert(
                      "Error",
                      res.data.message || "Daily booking limit exceeded. You have reached the maximum of 2 hours per day.",
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
