module.exports = {
    userSchema : ['name', 'email', 'age', 'location','education','usergroups','image_url'
        ,'fcm_tokens','about','creationdate','defaultlocation','userMode'],
    locationSchema : ['coordinates', 'type'],
    userLocationSchema : ['createdAt', 'location'],
    studentSchema : ['courses'],
    tutorSchema : ['subjects'],
    educationSchema : ['school','field','degree','year','inProgress']
}