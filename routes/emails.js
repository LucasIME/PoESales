/**
 * Created by meirellu on 2/28/16.
 */

var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

//Loading needed condig for emails
var sourceEmail = process.env.sourceEmail;
var sourceEmailPassword = process.env.sourceEmailPassword;
var baseURL = process.env.baseURL;
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

//declaring emailing object
var sendgripAPI = process.env.sendgridAPI;
var sendgrid  = require('sendgrid')(sendgripAPI);

router.post('/addemail', function(req, res) {
  var db = req.db;

  var email = req.body.email;
  email = email.toLowerCase();

  var collection = db.get('tempemails');

  //check if email trying to be inserted is valid
  if ( !isValidEmail(email)){
    res.json({msg: 'error: not valid email'});
    return;
  }
  //checks if email is already in tempemails collection
  collection.find({'email':email}).then(function(responseVector){
    console.log(responseVector);
    console.log('em temp ^');
    if (responseVector.length > 0) {
      res.json({ msg: 'email already in our database waiting for confirmation'});
      return;
    }
    else{

      //checks if email is already in emails collection
      db.get('emails').find({'email':email}).
      then(function(responseVector){
        console.log(responseVector);
        console.log('em emails ^');
        if(responseVector.length > 0){
          res.json({msg : 'email already in our verified emails database'});
          return;
        }
        else{

          //add email to tempemail db
          collection.insert({
            "email": email
          }).then(function(docInserted) {
              console.log(docInserted);
                //send email with hash URL to validate entry
              var emailObject = new sendgrid.Email({
                to : email,
                from : "Poe Sales Bot <" + sourceEmail + ">",
                subject : "PoESales Validation Email",
                html : '<h3>Click the link bellow to confirm your registration:</h3><br><a href="http://' +  baseURL + '/emails/validateemail/' + String(docInserted._id) + '">' + baseURL + '/emails/validateemail/'+ String(docInserted._id) + "</a>"
              });
              sendgrid.send(emailObject, function(err, json){
                if (err) return console.log(error);
                else{
                  console.log(json);
                  console.log("Message sent: " + json.response);
                }
              });

              res.json({msg: 'A confirmation email has been sent to you!'});
          });

        }

      });

    }
  });

});

router.get('/validateemail/:id', function(req, res) {
  var db = req.db;
  var tempCollection = db.get('tempemails');
  var collection = db.get('emails');
  var emailID = req.params.id;

  //check if id exists in tempemail
  tempCollection.find( {_id : emailID}).then(function(responseVector){
    if (responseVector.length == 1){
      var entry = responseVector[0];

      //remove entry from tempemail
      tempCollection.remove(entry);

      //insert entry in email
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

      var emailObject = new sendgrid.Email({
        to : entry.email,
        from : "Poe Sales Bot <" + sourceEmail + ">",
        subject : "PoESales Removal Email",
        html : '<h3>Click the link bellow to confirm your unregistration</h3><br><a href="http://' + baseURL + '/emails/deleteemail/' + String(entry._id) + '">' + baseURL + '/emails/deleteemail/'+ String(entry._id) + "</a>"
      });
      sendgrid.send(emailObject, function(err, json){
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
        //remove entry from permanent collection
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
          //console.log(html);
          var  itemPricesDic = {};
          //create itemprice dictionary based on items in discount
          $('.shopItemBase').each(function(){
            var itemName = $(this).children().first().next().text();
            var itemPrice = $(this).children().first().next().next().text();
            itemPricesDic[itemName] = itemPrice;
          });

          //setting up email body

          var emailObject = new sendgrid.Email({
            to : email,
            from : "Poe Sales Bot <" + sourceEmail + ">",
            subject : "PoE Discounts",
            html : "<h3>The Following items are in discount:</h3>"
          });

          for (var item in itemPricesDic){
            emailObject.html += '<p>' + item + ' for ' + itemPricesDic[item] + ' coins</p>';
          }
          //link to the store
          emailObject.html += '<p>Liked the item? Don\'t miss the opportunity and go straight to the shop! <a href="https://www.pathofexile.com/shop/category/daily-deals">https://www.pathofexile.com/shop/category/daily-deals</a></p>';

          //adding unregister footer message
          emailObject.html += '<br><p><small>Are you tired of receiving this emails? Click <a href="http://' + baseURL +  '/unregister">here</a> to unsubscribe</small></p>';
          //sends email
          sendgrid.send(emailObject, function(err, json){
            console.log(emailObject.html);
            if (err) {
              console.log(err);
              res.json({msg:'error: ' + err});
            }
            else{
              console.log(json);
              console.log("Message sent: " + json.response);
              res.json({msg:'Email sent successfully'});
            }
          });

      }
    });
  }

});

module.exports = router;
