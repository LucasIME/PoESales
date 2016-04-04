/**
 * Created by meirellu on 2/28/16.
 */

var express = require('express');
var router = express.Router();

//Loading needed condig for emails
var configjs = require('config-js')
var config = new configjs('./config.js')
var sourceEmail = config.get('sourceEmail')
var sourceEmailPassword = config.get('sourceEmailPassword')

//declaring emailing object
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: sourceEmail,
    pass: sourceEmailPassword
  }
});

router.get('/', function(req, res) {
  var db = req.db;
  var collection = db.get('emails');
  collection.find({}, {}, function(e, emails) {
    res.json(emails);
  });
});

router.post('/addemail', function(req, res) {
  var db = req.db;

  var email = req.body.email;

  var collection = db.get('tempemails');

  //add email to tempemail db
  collection.insert({
    "email": email
  }, function(err, docInserted) {
    if (err == null) {
      console.log(docInserted)
        //send email with hash URL to validate entry
      var emailObject = {
        from: "Poe Sales Bot <" + sourceEmail + ">",
        to: email,
        subject: "PoESales Validation Email",
        text: "id:" + String(docInserted._id),
      };

      transporter.sendMail(emailObject, function(error, info) {
        if (error) {
          return console.log(error);
        } else console.log("Message sent: " + info.response);
      })
      res.send({msg: ''});
    } else {
      res.send({msg: 'error' + err});
    }
  })
})

router.post('/validateemail/:id', function(req, res) {
  var db = req.db;
  var tempCollection = db.get('tempemails');
  var collection = db.get('emails');
  var emailID = req.params.id

  //check if id exists in tempemail

  //remove entry from tempemail

  //insert entry in email
})

router.delete('/deleteemail/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('emails');
  var emailID = req.params.id
  collection.remove(
    //{'_id':emailToDelete},
    req.body,
    function(err) {
      res.send((err == null) ? {
        msg: ''
      } : {
        msg: 'error' + err
      })
    })
})

module.exports = router;
