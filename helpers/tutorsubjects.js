/**
 * @typedef TutorSubjects 
 * @type {Object}
 */

/**
 * Helper Class For Adding a Tutor's Subjects
 * to Subjects Collection
 * @constructor
 * @param {Tutor} tutorDocument - Reference to Tutor MongoDB Document
 * @param {Collection} subjectCollection - Reference to Subject MongoDb Collection
 */
var TutorSubjects = function (tutorDocument, subjectCollection){
    this.tutorDocument = tutorDocument;
    this.subjectCollection = subjectCollection;
}

/**
 * Adds tutors subjects to Subjects Collection
 */
TutorSubjects.prototype.addToSubjectsCollection = function() {
    
    // intialize bulk operations array
    // for efficient insertion of multiple documents
    var bulkOps = [];

    // syncronous loop to add each string based subject
    // name to array of bulk operations.
    this.tutorDocument.subjects.forEach( (subject) => {
        bulkOps.push({
            "insertOne": {
                "document": {
                    "name": subject
                }
            }
        });
    });

    // return Promise <BulkOpWriteResult>
    return this.subjectCollection.bulkWrite(bulkOps, {ordered : false, w : 1});
}


TutorSubjects.prototype.getSubjects = function () {
    return this.tutor.subjects;
}

module.exports = TutorSubjects;