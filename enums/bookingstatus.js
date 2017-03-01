// 'enumify' has to be lowercase
const Enumify = require('enumify');

class BookingStatus extends Enumify.Enum { }
BookingStatus.initEnum(['requested', 'accepted', 'rejected', 'cancelled']);

module.exports = BookingStatus;