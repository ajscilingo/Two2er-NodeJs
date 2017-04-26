// For the booking routes, we will have three possible routes
// 1) Request (i.e. create) the booking,
// 2) Accept the booking (confirmed)
// 3) Reject the booking (rejected)

const router = require('express').Router();
const Booking = require('../models/booking.js');
const User = require('../models/user.js')
const Location = require('../models/schemas/location.js')
const timekit = require('../timekit.js');
const mongoose = require('mongoose');
const dateFormat = require('dateformat');
const Promise = require('bluebird');
// Enums used for BookingStatus
const BookingStatus = require('../enums/bookingstatus.js');
const fcm = require('../messaging.js');

/**
 * Submit booking request and send Firebase Notification to Tutor
 * @param {*} err
 * @param {*} tutor
 * @param {*} student
 * @param {*} booking
 * @param {*} res
 */
function saveBookingAndSendNotificationToTutor(err, tutor, student, booking, res) {
  // if tutor not found send error
  if (err) {
    res.status(404).send(err);
  }

  // update booking to include tutor's name
  booking.tutor_name = tutor.name;

  // try to save booking and send notification, if can't send error
  booking.save((err) => {
    if (err)
      res.status(404).send(err);

    // send a message only if there's fcm_tokens
    if (tutor.fcm_tokens.length > 0) {

      // create new notification message
      var fcm_message = {
        registration_ids: tutor.fcm_tokens,
        notification: {
          title: 'Booking Requested',
          body: `Booking Requested By ${student.name}`
        }
      };

      // attempt to send notification message
      fcm.send(fcm_message, (err, res) => {
        if (err)
          console.log("failure sending message");
        else
          console.log(`Successfully sent with response: ${res}`);
        }
      );
    }

    console.log(`${booking.student_user_id} requesting appointment`);
    res.json({message: `${booking.student_user_id} requesting appointment`});

  });
}

function updateBookingStatusAndSendNotificaitonToStudent(booking_id, status, res) {
  Booking.findByIdAndUpdate(booking_id, {
    status: status
  }, (err, booking) => {
    if (err)
      res.status(404).send(err);

    User.findById(mongoose.Types.ObjectId(booking.tutor_user_id), (err, tutor) => {
      if (err) {
        res.status(404).send(err);
      }

      User.findById(mongoose.Types.ObjectId(booking.student_user_id), (err, student) => {
        if (err) {
          res.status(404).send(err);
        }

        // send a message only if there's fcm_tokens
        if (student.fcm_tokens.length > 0) {
          // create new message
          var fcm_message = {
            registration_ids: student.fcm_tokens,
            notification: {
              title: `Booking ${status}`,
              body: `Booking ${status} By ${tutor.name}`
            }
          };

          fcm.send(fcm_message, (err, res) => {
            if (err)
              console.log("failure sending message");
            else
              console.log(`Successfully sent with response: ${res}`);
            }
          );
        }

        console.log(`Booking ${booking._id} has been ${status} by ${tutor._id}`);
        res.json({message: `Booking ${booking._id} has been ${status} by ${tutor._id}`});
      });

    });
  });
}

// a middleware function with no mount path. This code is executed for every request to the router
router.use(function(req, res, next) {
  console.log('Time:', dateFormat(Date.now(), 'dd-mmm-yyyy HH:mm:ss'));
  next();
});

// Request a booking with a tutor
// student has to be logged in and authenticated
// through stormpath for this to work.
// the student_user_id is obtained this way
// remember to put date in epoch-time for storage

router.post('/request', (req, res) => {

  console.log(`${req.ip} is doing a POST via /booking/request`);

  if (req.user) {

    var booking = new Booking();

    var creationDate = new Date();

    // make default ending date 1 hour from now
    var endingDate = new Date();

    var scheduledmeetingdate = (req.body.scheduledmeetingdate
      ? new Date(Date.parse(req.body.scheduledmeetingdate))
      : creationDate);

    // send error response if scheduledmeetingdate is not a date
    if (!(scheduledmeetingdate instanceof Date)) {
      res.status(500).send({message: "scheduledmeetingdate is not a valid Date Object!"});
      return;
    }

    endingDate.setHours(scheduledmeetingdate.getHours() + 1);

    var scheduledendingdate = (req.body.scheduledendingdate
      ? new Date(Date.parse(req.body.scheduledendingdate))
      : endingDate);

    if (!(scheduledendingdate instanceof Date)) {
      res.status(500).send({message: "scheduledending date is not a valid Date Object!"});
      return;
    }

    // timekit.io wants dates as strings in ISO-8601 format
    var startTime = dateFormat(scheduledmeetingdate, "isoDateTime");
    var endTime = dateFormat(scheduledendingdate, "isoDateTime");

    booking.bookingcreationdate = creationDate;
    booking.scheduledendingdate = scheduledendingdate;
    booking.scheduledmeetingdate = scheduledmeetingdate;
    booking.tutor_user_id = req.body.tutor_user_id;
    booking.student_user_id = req.user.customData.user_id;
    booking.status = "requested";

    User.findById(mongoose.Types.ObjectId(req.user.customData.user_id), (err, student) => {
      if (student) {
        booking.student_name = student.name;
        User.findById(mongoose.Types.ObjectId(req.body.tutor_user_id), (err, tutor) => {
          // save booking and send notification to tutor
          //saveBookingAndSendNotificationToTutor(err, tutor, student, booking ,res);

          // send booking to timekit.io if user has timekit info
          if (tutor.timekit_token != null) {
            // set timekit scheduling to tutor user
            timekit.setUser(tutor.email, tutor.timekit_token);

            if (tutor.timekit_calendar_id != null) {
              // creating booking in tutor's calendar
              timekit.createBooking({
                graph: 'confirm_decline',
                action: 'create',
                event: {
                  start: startTime,
                  end: endTime,
                  what: 'Tutoring Session',
                  where: '1 E. Jackson Blvd, Chicago, IL 60604, USA',
                  calendar_id: tutor.timekit_calendar_id,
                  description: 'HELP!!'
                },
                customer: {
                  name: student.name,
                  email: student.email,
                  phone: '(312) 588-2300',
                  voip: 'voip',
                  timezone: 'America/Chicago'
                },
                settings: {
                  allow_double_bookings: false
                }
              }).then((response) => {
                // record timekit event id
                booking.timekit_booking_id = response.data.id;
                // save booking and send notification to tutor
                saveBookingAndSendNotificationToTutor(err, tutor, student, booking, res);
              }).catch((response) => {
                if (response.data)
                  res.status(response.status).send(response.data.error);
                else
                  res.status(response.status).send(response.statusText)
              });
            } else
              res.status(500).send({message: "timekit calendar missing!"});
            }
          else {
            // save booking and send notification to tutor using our booking system
            // WE WILL WANT TO REMOVE THIS ELSE CONDITION ONCE WE FULLY IMPLEMENT TIMEKIT.IO
            // AND JUST FAIL THE CALL IF TIMEKIT INFO IS MISSING.
            saveBookingAndSendNotificationToTutor(err, tutor, student, booking, res);
          }
        });
      }
    });
  } else {
    res.json({student_user_id: 0});
  }
});

// Route for tutor to reject booking
// Also used later if tutor needs to cancel
// To use this route you must be a tutor
router.post('/reject', (req, res) => {

  console.log(`${req.ip} is doing a POST via /booking/reject`);

  if (req.user) {
    updateBookingStatusAndSendNotificaitonToStudent(req.body.booking_id, BookingStatus.rejected.name, res);
  } else {
    res.json({tutor_user_id: 0});
  }

});

// Route for tutor to confirm booking
router.post('/accept', (req, res) => {

  console.log(`${req.ip} is doing a POST via /booking/accept`)

  if (req.user) {
    updateBookingStatusAndSendNotificaitonToStudent(req.body.booking_id, BookingStatus.accepted.name, res);
  } else {
    res.json({tutor_user_id: 0});
  }
});

// Route for student to cancel booking
router.post('/cancel', (req, res) => {

  console.log(`${req.ip} is doing a POST via /booking/cancel`)

  if (req.user) {
    Booking.findByIdAndUpdate(req.body.booking_id, {
      status: "cancelled"
    }, (err, booking) => {
      if (err)
        re.status(404).send(err);
      else {
        console.log(`Booking ${booking._id} has been cancelled by ${req.user.customData.user_id}`);
        res.json({message: `Booking ${booking._id} has been cancelled by ${req.user.customData.user_id}`});
      }
    });
  } else {
    res.json({student_user_id: 0});
  }
});

router.get('/', (req, res) => {
  console.log(`${req.ip} is doing a GET via /booking`);

  if (req.user) {
    Booking.find({
      $or: [
        {
          student_user_id: req.user.customData.user_id
        }, {
          tutor_user_id: req.user.customData.user_id
        }
      ]
    }).lean().exec((err, booking) => {
      if (err)
        res.status(404).send(err);

      var obj = JSON.parse(JSON.stringify(booking));

      // this code block is async and does not execute before the response

      // booking.forEach( function(b, index, theArray) {
      //     User.findById(mongoose.Types.ObjectId(b.student_user_id), (err2, stu) => {
      //         if (err2)
      //             res.status(404).send(err2);
      //         User.findById(mongoose.Types.ObjectId(b.tutor_user_id), (err3, tut) => {
      //             if (err3)
      //                 res.status(404).send(err3);

      //             if (stu)
      //                 theArray[index]["student_name"] = stu.name;
      //             else
      //                 theArray[index]["student_name"] = "N/A";

      //             if (tut)
      //                 theArray[index]["tutor_name"] = tut.name;
      //             else
      //                 theArray[index]["tutor_name"] = "N/A";
      //         });
      //     });
      // });

      res.json(booking);
    });
  }
});

/**
 * Get availabilty for logged in student user and tutor(pass in as param)
 * from timekit.io calendar
 */
router.get('/getTutorSchedule/:id?', (req, res) => {

  console.log(`${req.ip} is doing a GET via /booking/getTutorSchedule/${req.params.id}`);

  if (req.user) {

    var userid = mongoose.Types.ObjectId(req.user.customData.user_id);
    var tutorCalId;
    var userCalId;

    // Getting tutor calendar_id using passed params
    User.findOne({
      _id: req.params.id
    }, (err, user) => {
      if (err) {
        res.status(500).send({message: 'Provide a valid tutor id'});
      }
      if (user != null) {
        tutorCalId = user.timekit_calendar_id;
      }
    });

    // Get availability
    User.findOne({
      _id: userid
    }, (err, user) => {
      if (err)
        res.status(404).send(err);

      if (user.timekit_token != null) {

        userCalId = user.timekit_calendar_id;

        availabilityData = {
          "calendar_ids": [
            userCalId, tutorCalId
          ],
          "future": "5 days",
          "length": "60 minutes"
        }

        if (req.user.email != null) {

          // set timekit to use current user
          timekit.setUser(req.user.email, user.timekit_token);

          timekit.findTime(availabilityData).then((response) => {
            res.json(response.data);
          }).catch((response) => {
            res.status(response.status).send(response.statusText);
          });

        } else
          res.status(500).send({message: 'email address required!'});
        }
      else
        res.status(500).send({message: 'timekit.io token required'});

      }
    );

  } else {
    req.status(500).send({message: 'this endpoint requires authentication!'});
  }
});

/**
 * Get list of bookings for authenticated user
 * from timekit.io calendar
 */
router.get('/timekit', (req, res) => {
  console.log(`${req.ip} is doing a GET via /booking/timekit`);

  if (req.user) {

    var userid = mongoose.Types.ObjectId(req.user.customData.user_id);

    User.findOne({
      _id: userid
    }, (err, user) => {
      if (err)
        res.status(404).send(err);

      if (user.timekit_token != null) {

        if (req.user.email != null) {

          // set timekit to use current user
          timekit.setUser(req.user.email, user.timekit_token);

          timekit.include('attributes').getBookings().then((response) => {
            res.json(response.data);
          }).catch((response) => {
            res.status(response.status).send(response.statusText);
          });

        } else
          res.status(500).send({message: 'email address required!'});
        }
      else
        res.status(500).send({message: 'timekit.io token required'});

      }
    );

  } else {
    req.status(500).send({message: 'this endpoint requires authentication!'});
  }
});

// router.get('/', (req, res) => {
//     console.log(`${req.ip} is doing a GET via /booking`);

//     // used to
//     // var UserData = {
//     //     mo : (id) => {
//     //         User.findById(mongoose.Types.ObjectId(id)).then( ;
//     //     }
//     // }    if(req.user) {
//         Booking.find( {$or :[{student_user_id : req.user.customData.user_id}, {tutor_user_id : req.user.customData.user_id}]}).then((bookings) => {

//             Promise.map(bookings, (booking) => {
//                console.log(`student_user_id ${booking.student_user_id}`);
//                console.log(`tutor_user_id ${booking.tutor_user_id}`);
//                return {
//                    booking_name: "booking 1234",
//                    booking_title: "my booking",
//                    student_user_id : booking.student_user_id,
//                    tutor_user_id: booking.tutor_user_id
//                }
//             }).then( (transformedBookings) => {
//                 res.json(transformedBookings);
//             }).catch( (err) => {
//                 console.log(err);
//                 res.status(500).send(err);
//             });
//             //   booking.forEach( (document, index, array) => {
//             //         User.findById(mongoose.Types.ObjectId(booking.student_user_id)).then( (student) =>{
//             //             student_name = student.name;
//             //             console.log(`Student Name: ${student_name}`);
//             //         }).catch( (err) => {
//             //             res.status(500).send(err);
//             //         });
//             //         User.findById(mongoose.Types.ObjectId(booking.tutor_user_id)).then( (tutor) => {
//             //             tutor_name = tutor.name;
//             //             console.log(`Tutor Name: ${tutor_name}`);
//             //         }).catch( (err) => {
//             //             res.status(500).send(err);
//             //         });
//             //   });
//             //   booking[0]["test"] = "test";
//             //   var response = {student_user_id : booking[0].student_user_id, test : User.findById()};
//             //   res.json(response);

//         }).catch( (err) => {
//             res.status(500).send(err);
//             console.log(err);
//         });
//     }
// });

module.exports = router;
