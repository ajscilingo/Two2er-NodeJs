// 'enumify' has to be lowercase
const Enumify = require('enumify');

class BookingStatus extends Enumify.Enum { }
BookingStatus.initEnum(['tentative', 'confirmed', 'declined', 'cancelled', "completed"]);

module.exports = BookingStatus;