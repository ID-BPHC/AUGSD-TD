let mapByDays = function(bookings) {
  let mappedBookings = {};
  bookings.forEach(function(booking) {
    if (
      typeof mappedBookings[booking.start.toString().substring(0, 14)] ===
      "undefined"
    ) {
      mappedBookings[booking.start.toString().substring(0, 14)] = [booking];
    } else {
      mappedBookings[booking.start.toString().substring(0, 14)].push(booking);
    }
  });
  return mappedBookings;
};

module.exports = {
  mapByDays
};
