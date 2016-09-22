const express = require('express');
const multer = require('multer');
var upload = multer({
    dest: 'uploads/'
});
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const app = express();
var db


MongoClient.connect('mongodb://localhost:27017/test', function(err, database) {
    if (err) return console.log(err)
    db = database

    // Serve static files
    app.use(express.static(__dirname + '/public'));

    app.listen(3000, function() {
        console.log('listening on 3000')
    })
})

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

// Send HTML file
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html')
})

// Get the list of all acuerdos
app.get('/apiv1/acuerdos', function(req, res) {
    db.collection('acuerdos').find().toArray(function(err, results) {
        if (err) {
            handleError(res, "HOLI", "Must provide Things", 400);
        } else {
            console.log("GET /acuerdos");
            res.status(200).json(results);
        }
    })
})

// Get a single acuerdo
app.get('/apiv1/acuerdos/:id', function(req, res) {
    db.collection('acuerdos').findOne({
        slug: req.params.id
    }, function(err, results) {
        if (err) {
            handleError(res, "Holi", "MUSSS", 400);
        } else {
            console.log("GET /acuerdos/" + req.params.id);
            res.status(200).json(results)
        }
    });
})

// Dar de alta un acuerdo
/*
app.post('/apiv1/acuerdos', function(req, res) {
    var acuerdo = req.body;

    console.log(req.headers);
    console.log(req.file);
    console.log(req.files);

    db.collection('acuerdos').save(acuerdo, function(err, result) {
        if (err) return console.log(err)
        console.log('POST /acuerdos')
        res.status(201).json(result.ops[0]);
    })
})
*/
app.post('/apiv1/acuerdos', upload.any(), function(req, res) {
    console.log(req.body);
})

// Generic function handler used by all endpoints
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({
        "error": message
    });
}
