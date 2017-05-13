/**
 * @typedef TimekitUserDaysUntilExpiration 
 * @type {Object}
 */

var TimekitUserExpiry = function (userDocument) {
    this.userDocument = userDocument;
    // Expiration Date of Timekit User Token
    this._expirationDate = new Date(Date.parse(userDocument.timekit_token_expiration));
    // Ten Days before this Timekit User Token Expiration.
    this._tenDaysBeforeExpiration = new Date(this._expirationDate).setUTCDate(this._expirationDate.getUTCDate() - 10);
    // Today's Date 
    this._currentDate = new Date();
}


TimekitUserExpiry.prototype.getDaysBetween = function () {
     // Get the number of days between two dates
    var days  = this._tenDaysBeforeExpiration - this._currentDate;    
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.floor(days / millisecondsPerDay);
}

/**
 * Returns true if 
 */
TimekitUserExpiry.prototype.isExpiringSoon = function () {
        if(this.userDocument.timekit_token_expiration){
            if(this.getDaysBetween() <= 10)
                return true;
            else 
                return false;
        }
        else
            return false;
}

module.exports = TimekitUserExpiry;

