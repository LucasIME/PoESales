/**
 * Created by meirellu on 2/28/16.
 */

var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

//Loading needed condig for emails
var sourceEmail = process.env.sourceEmail
var sourceEmailPassword = process.env.sourceEmailPassword
var baseURL = process.env.baseURL
if (process.env.NODE_ENV === 'dev'){
  var baseURL = 'localhost:' + String(process.env.PORT);

  router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('emails');
    collection.find({}, {}, function(e, emails) {
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
  var email = email.toLowerCase();

  var collection = db.get('tempemails');

  //check if email trying to be inserted is valid
  if ( !isValidEmail(email)){
    res.send({msg: 'error: not valid email'});
    return;
  }
  //checks if email is already in tempemails collection
  collection.find({'email':email}, {}, function(findError, responseVector){
    console.log(responseVector);
    console.log('em temp ^');
    if (responseVector.length > 0) {
      res.send({ msg: 'email already in our database waiting for confirmation'});
      return;
    }
    else{

      //checks if email is already in emails collection
      db.get('emails').find({'email':email}, {}, function(findError, responseVector){
        console.log(responseVector);
        console.log('em emails ^');
        if(responseVector.length > 0){
          res.send({msg : 'email already in our verified emails database'});
          return;
        }
        else{

          //add email to tempemail db
          collection.insert({
            "email": email
          }, function(err, docInserted) {
            if (err == null) {
              console.log(docInserted)
                //send email with hash URL to validate entry
              var emailObject = new sendgrid.Email({
                to : email,
                from : "Poe Sales Bot <" + sourceEmail + ">",
                subject : "PoESales Validation Email",
                html : '<h3>Click the link bellow to confirm your registration:</h3><br><a href="' +  baseURL + '/emails/validateemail/' + String(docInserted._id) + '">' + baseURL + '/emails/validateemail/'+ String(docInserted._id) + "</a>"
              })
              sendgrid.send(emailObject, function(err, json){
                if (err) return console.log(error);
                else{
                  console.log(json);
                  console.log("Message sent: " + json.response);
                }
              })

              res.send({msg: ''});
            } else {
              res.send({msg: 'error' + err});
            }
          })

        }

      });

    }
  })

})

router.get('/validateemail/:id', function(req, res) {
  var db = req.db;
  var tempCollection = db.get('tempemails');
  var collection = db.get('emails');
  var emailID = req.params.id

  //check if id exists in tempemail
  tempCollection.find( {_id : emailID}, {}, function(findError, responseVector){
    if (responseVector.length == 1){
      var entry = responseVector[0]

      //remove entry from tempemail
      tempCollection.remove(entry, function(removeError){
        if (removeError !==null) res.send({msg:'error' + removeError});
      })

      //insert entry in email
      collection.insert({'email':entry.email}, function(insertError){
          if (insertError !==null) res.send({msg:'error' + insertError});
      } )

      res.render('success');

    } else{
      res.send({msg:'error:' + findError})
    }
  })

})

router.post('/rememail', function(req, res) {
  var db = req.db;
  var userEmail = req.body.email;
  var collection = db.get('emails');

  userEmail = userEmail.toLowerCase();

  if ( !isValidEmail(userEmail)){
    res.send({msg: 'error: not valid email'});
    return;
  }

  collection.find({email: userEmail}, {}, function(findError,responseVector){
    console.log(userEmail)
    console.log(responseVector)
    if(responseVector.length == 1){
      var entry = responseVector[0]
      console.log(entry)

      var emailObject = new sendgrid.Email({
        to : entry.email,
        from : "Poe Sales Bot <" + sourceEmail + ">",
        subject : "PoESales Removal Email",
        html : '<h3>Click the link bellow to confirm your unregistration</h3><br><a href="' + baseURL + '/emails/deleteemail/' + String(entry._id) + '">' + baseURL + '/emails/deleteemail/'+ String(entry._id) + "</a>"
      })
      sendgrid.send(emailObject, function(err, json){
        if (err) return console.log(error);
        else{
          console.log(json);
          console.log("Message sent: " + json.response);
          res.send({"msg":""});
        }
      })

    }

  })
})

router.get('/deleteemail/:id', function(req, res) {
  var db = req.db;
  var collection = db.get('emails');
  var emailID = req.params.id

  collection.find({_id: emailID}, {}, function(findError, responseVector){

      if(responseVector.length == 1){
        var entry = responseVector[0]
        //remove entry from permanent collection
        collection.remove(entry, function(removeError){
          if(removeError !== null) res.send({msg:'error' + removeError})
        })

        res.render('emaildelete')
      }
      else{
        res.send({msg:'error' +  findError})
      }
    })
})

router.get('/scrape/:email', function(req, res){
  var url = "https://www.pathofexile.com/shop/category/daily-deals";
  var email = req.params.email;

  if ( !isValidEmail(email)){
    res.send({msg: 'error: not valid email'})
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
          })

          //setting up email body

          var emailObject = new sendgrid.Email({
            to : email,
            from : "Poe Sales Bot <" + sourceEmail + ">",
            subject : "PoE Discounts",
            html : "<h3>The Following items are in discount:</h3>"
          })

          for (item in itemPricesDic){
            emailObject.html += '<p>' + item + ' for ' + itemPricesDic[item] + ' coins</p>'
          }
          //link to the store
          emailObject.html += '<p>Liked the item? Don\'t miss the opportunity and go straight to the shop! <a href="https://www.pathofexile.com/shop/category/daily-deals">https://www.pathofexile.com/shop/category/daily-deals</a></p>';

          //adding unregister footer message
          emailObject.html += '<br><p><small>Are you tired of receiving this emails? Click <a href="' + baseURL +  '/unregister">here</a> to unsubscribe</small></p>'
          //sends email
          sendgrid.send(emailObject, function(err, json){
            if (err) {
              console.log(error);
              res.send({msg:'error: ' + error});
            }
            else{
              console.log(json);
              console.log("Message sent: " + json.response);
              //res.render('mailsent');
              res.send({msg:''});
            }
          })

      }
    });
  }

})

module.exports = router;
