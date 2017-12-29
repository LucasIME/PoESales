#!/usr/bin/env node

//custom imports
var request = require("request");
var cheerio = require("cheerio");
var sourceEmail = process.env.sourceEmail;
var baseURL = process.env.baseURL;
if (process.env.NODE_ENV === "dev") {
  var baseURL = "localhost:" + String(process.env.PORT);
}

var PoEMail = require("../helpers/mailhelper.js");
var sendgridAPI = process.env.sendgridAPI;
var mailHelper = new PoEMail(sendgridAPI, sourceEmail);

var monk = require("monk");

var dbUrl = process.env.dburl;
var db = monk(dbUrl);

var collection = db.get("emails");
var url = "https://www.pathofexile.com/shop/category/daily-deals";

function buildItemPriceDict(html){
  var $ = cheerio.load(html);
  var itemPricesDic = {};
  //create itemprice dictionary based on items in discount
  $(".shopItemBase").each(function() {
    var itemName = $(this)
      .children()
      .first()
      .next()
      .text();
    var itemPrice = $(this)
      .children()
      .first()
      .next()
      .next()
      .text();
    itemPricesDic[itemName] = itemPrice;
  });
  return itemPricesDic;
}

function sendPromoEmailToAll() {
  request(url, function(error, response, html) {
    if (!error && response.statusCode == 200) {
      var itemPricesDic = buildItemPriceDict(html);
      //sends email to each email in the database
      collection
        .find({})
        .then(function(itemsVec) {
          console.log(itemsVec);
          itemsVec.forEach(function(item){
            var targetEmail = item.email;
            mailHelper.sendPromoMail(targetEmail, itemPricesDic, function(err, json) {
              if (err) {
                console.log("Error sending message to: " + targetEmail, err);
              } else {
                console.log(json);
                console.log("Message sent to : " + targetEmail);
              }
            });

          });
        })
        .catch(function(err) {
          if (err) {
            console.log(err);
          }
        });
    }
  });
}

sendPromoEmailToAll();

module.exports = sendPromoEmailToAll;
