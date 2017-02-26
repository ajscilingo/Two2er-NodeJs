// 'enumify' has to be lowercase
const Enumify = require('enumify');

class Degree extends Enumify.Enum { }
Degree.initEnum({
    AA: {
        description: 'Associate of Arts'
    },  
    AS: {
        description: 'Associate of Science'
    }, 
    BA: {
        description: 'Bachelor of Arts'
    }, 
    BS: {
        description: 'Bachelor of Science'
    }, 
    MA: {
        description: 'Master of Arts'
    }, 
    MS: {
        description: 'Master of Science'
    }, 
    MBA: {
        description: 'Master of Business Administration'
    }, 
    PHD: {
        description: 'Doctor of Philosophy'
    }
});

module.exports = Degree;