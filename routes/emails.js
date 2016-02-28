/**
 * Created by meirellu on 2/28/16.
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
    var db = req.db;
    var collection = db.get('emails');
    collection.find({}, {}, function(e, emails){
        res.json(emails);
    });
});

module.exports = router;
