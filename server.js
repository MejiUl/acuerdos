const express = require('express');
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const app = express();
var db


MongoClient.connect('mongodb://localhost:27017/test', function(err, database){
  if (err) return console.log(err)
  db = database

  // Serve static files
  app.use(express.static(__dirname + '/public'));

  app.listen(3000, function(){
    console.log('listening on 3000')
  })
})

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json());

// Send HTML file
app.get('/', function(req,res){
    res.sendFile(__dirname + '/public/index.html')
})

// Get the list of all acuerdos
app.get('/acuerdos', function(req, res){
  db.collection('acuerdos').find().toArray(function(err, results){
    if (err){
      handleError(res, "HOLI", "Must provide Things", 400);
    }else{
      console.log("GET /acuerdos");
      res.status(200).json(results);
    }
  })
})

// Dar de alta un acuerdo
app.post('/acuerdos', function(req, res){
  var acuerdo = req.body;

  db.collection('acuerdos').save(acuerdo, function(err, result){
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/')
  })
})

// Generic function handler used by all endpoints
function handleError(res, reason, message, code){
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}
