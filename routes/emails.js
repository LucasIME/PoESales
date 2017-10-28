/**
 * Created by meirellu on 2/28/16.
 */

var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

//Loading needed config for emails
var PoEMail = require('../helpers/mailhelper.js');
var sourceEmail = process.env.sourceEmail;
var sendgridAPI = process.env.sendgridAPI;
var mailHelper = new PoEMail(sendgridAPI, sourceEmail);

if (process.env.NODE_ENV === 'dev'){
  var baseURL = 'localhost:' + String(process.env.PORT);

  router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('emails');
    collection.find({}).then(function(emails) {
      res.json(emails);
    });
  });
}

function isValidEmail( email){
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

router.post('/addemail', function(req, res) {
  var db = req.db;
  var email = req.body.email;
  email = email.toLowerCase();
  var collection = db.get('tempemails');

  if ( !isValidEmail(email)){
    res.json({msg: 'error: not valid email'});
    return;
  }

  collection.find({'email':email}).then(function(responseVector){
    if (responseVector.length > 0) {
      res.json({ msg: 'email already in our database waiting for confirmation'});
      return Promise.reject('email already in database waiting for confirmation');
    }

    return db.get('emails').find({'email':email});
  }).then(function(responseVector){
    if(responseVector.length > 0){
      res.json({msg : 'email already in our verified emails database'});
      return Promise.reject('email already in our verified emails database');
    }

    return collection.insert({'email': email});
  })
    .then(function(docInserted){
      mailHelper.sendRegistrationEmail(email, String(docInserted._id), function(err, json){
        if (err) {
          console.log(err);
          res.json({'msg': 'error: ' + err});
        }
        else{
          console.log(json);
          console.log("Message sent: " + json.response);
          res.json({msg: 'A confirmation email has been sent to you!'});
        }
      });
    })
    .catch(function(err){
      console.log('There was an error in the promise chain: ' + err);
    });
});

router.get('/validateemail/:id', function(req, res) {
  var db = req.db;
  var tempCollection = db.get('tempemails');
  var collection = db.get('emails');
  var emailID = req.params.id;

  tempCollection.find( {_id : emailID}).then(function(responseVector){
    if (responseVector.length == 1){
      var entry = responseVector[0];

      tempCollection.remove(entry);
      collection.insert({'email':entry.email});

      res.render('success');
    } else{
      res.json({msg:'error: no result found'});
    }
  });

});

router.post('/rememail', function(req, res) {
  var db = req.db;
  var userEmail = req.body.email;
  var collection = db.get('emails');

  userEmail = userEmail.toLowerCase();

  if ( !isValidEmail(userEmail)){
    res.json({msg: 'error: not valid email'});
    return;
  }

  collection.find({email: userEmail}).then(function(responseVector){
    console.log(userEmail);
    console.log(responseVector);
    if(responseVector.length == 1){
      var entry = responseVector[0];
      console.log(entry);

      mailHelper.sendUnregisterEmail(entry.email, String(entry._id), function(err, json) {
        if (err) return console.log(err);
        else{
          console.log(json);
          console.log("Message sent: " + json.response);
          res.json({"msg": "Email sent successfully!"});
        }
      });
    }
    else {
      res.json({"msg": "Sorry, we did not find this email in our database"});
    }
  });
});

router.get('/deleteemail/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('emails');
  var emailID = req.params.id;

  collection.find({_id: emailID}).then(function(responseVector){
    if(responseVector.length == 1){
      var entry = responseVector[0];
      collection.remove(entry);

      res.render('emaildelete');
    }
    else{
      res.json({msg:'error: did not find email to delete'});
    }
  });
});

router.get('/scrape/:email', function(req, res){
  var url = "https://www.pathofexile.com/shop/category/daily-deals";
  var email = req.params.email;

  if ( !isValidEmail(email)){
    res.json({msg: 'error: not valid email'});
  }
  else{
    request(url, function (error, response, html) {
      if (!error && response.statusCode == 200) {
        var $ = cheerio.load(html);
        var  itemPricesDic = {};

        //create itemprice dictionary based on items in discount
        $('.shopItemBase').each(function(){
          var itemName = $(this).children().first().next().text();
          var itemPrice = $(this).children().first().next().next().text();
          itemPricesDic[itemName] = itemPrice;
        });

        mailHelper.sendPromoMail(email, itemPricesDic, function(err, json){
          if (err) {
            console.log(err);
            res.json({msg:'error: ' + err});
          }
          else{
            console.log(json);
            console.log('Message sent: ' + json.response);
            res.json({msg:'Email sent successfully'});
          }
        });
      }
    });
  }

});

module.exports = router;
