const Enumify = require('Enumify');

class UserType extends Enumify.Enum { 
    isTutor () {
        switch(this){
            case UserType.Tutor:
                return true;
            default:
                return false;
        }
    }

    isStudent () {
        switch(this){
            case UserType.Student:
                return true;
            default:
                return false;
        }
    }

    isAdmin () {
        switch(this){
            case UserType.Admin:
                return true;
            default:
                return false;
        }
    }

}
UserType.initEnum(['Admin', 'Student', 'Tutor', 'StudentTutor']);

module.exports = UserType;