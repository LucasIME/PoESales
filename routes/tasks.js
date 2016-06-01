var express = require('express');
var router = express.Router();

//custom imports
var request = require('request');
var cheerio = require('cheerio');
var configjs = require('config-js');
var config = new configjs('./config.js');
var sourceEmail = config.get('sourceEmail');
var sourceEmailPassword = config.get('sourceEmailPassword');
var baseURL = config.get('baseURL');
if (process.env.NODE_ENV === 'dev'){
  var baseURL = 'localhost:3000';
}
var sendgripAPI = config.get('sendgridAPI')
var sendgrid  = require('sendgrid')(sendgripAPI);

router.get('/sendmails', function(req, res, next) {

  var db = req.db;
  var collection = db.get('emails');
  var url = "https://www.pathofexile.com/shop/category/daily-deals";

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
            to : "",
            from : "Poe Sales Bot <" + sourceEmail + ">",
            subject : "PoE Discounts",
            html : "<h3>The Following items are in discount:</h3>"
          })

          for (item in itemPricesDic){
            emailObject.html += '<p>' + item + ' for ' + itemPricesDic[item] + ' coins</p>'
          }

          emailObject.html += '<br><p><small>Are you tired of receiving this emails? Click <a href="' + baseURL +  '/unregister">here</a> to unsubscribe</small></p>'
          console.log(emailObject);
          //sends email to each email in the database
          collection.find({}, {}, (function(findErr, itemsVec){
            if (findErr){
              console.log(findErr);
              res.send({msg:findErr});
            }
            else{
              for (item in itemsVec){
                emailObject.to = itemsVec[item].email;

                //sends email
                sendgrid.send(emailObject, function(err, json){
                  if (err) {
                    console.log(err);
                    res.send({msg:'error: ' + err});
                  }
                  else{
                    console.log(json);
                    console.log("Message sent: " + json.response);
                  }
                })

              }
              res.send({msg:'All emails sent successfully'});
            }

          })
        )


      }
    });

});

module.exports = router;
