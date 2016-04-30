var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/unregister', function(req, res, next){
  res.render('unregisterForm');
})
module.exports = router;
