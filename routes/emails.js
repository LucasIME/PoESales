/**
 * Created by meirellu on 2/28/16.
 */

var express = require('express');
var router = express.Router();
var request = require('request');
var cheerio = require('cheerio');

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
        html: '<a href="localhost:3000/emails/validateemail/' + String(docInserted._id) + '">' + 'localhost:3000/emails/validateemail/'+ String(docInserted._id) + "</a>"
      };
      console.log(emailObject.html)
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

  collection.find({email: userEmail}, {}, function(findError,responseVector){
    console.log(userEmail)
    console.log(responseVector)
    if(responseVector.length == 1){
      var entry = responseVector[0]
      console.log(entry)
      var emailObject = {
        from: "Poe Sales Bot <" + sourceEmail + ">",
        to: entry.email,
        subject: "PoESales Removal Email",
          html: '<a href="localhost:3000/emails/deleteemail/' + String(entry._id) + '">' + 'localhost:3000/emails/deleteemail/'+ String(entry._id) + "</a>"
      };

      transporter.sendMail(emailObject, function(error, info) {
        if (error) {
          return console.log(error);
        } else console.log("Message sent: " + info.response);
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
        var emailObject = {
          from: "Poe Sales Bot <" + sourceEmail + ">",
          to: email,
          subject: "PoE Discounts",
            html: "<h3>The Following items are in discount:</h3>"
        };
        for (item in itemPricesDic){
          emailObject.html += '<p>' + item + ' for ' + itemPricesDic[item] + ' coins</p>'
        }

        //sends email
        transporter.sendMail(emailObject, function(error, info) {
          if (error) {
            //return console.log(error);
            res.send({msg:'error' +  error})
          } else {
            console.log("Message sent: " + info.response);
            res.render('mailsent');
          }
        })
    }
  });

})

module.exports = router;
