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

router.post('/addemail', function(req, res){
  var db = req.db;

  var email = req.body.email;

  var collection = db.get('emails');

  collection.insert({
    "email" : email
  }, function(err){
    res.send( ( err == null)? {msg: ''}: { msg: 'error' + err})
  })
})

router.delete('/deleteemail/:id', function(req, res){
    var db = req.db;
    var collection = db.get('emails');
    var emailID = req.params.id
    collection.remove(
        //{'_id':emailToDelete},
        req.body,
        function(err){
        res.send( ( err == null)? {msg: ''}: { msg: 'error' + err})
    })
})

module.exports = router;
