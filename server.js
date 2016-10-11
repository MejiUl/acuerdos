const express = require('express');
const multer = require('multer');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongo = require('mongodb');
const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const app = express();

var upload = multer({
    dest: 'uploads/'
});
var passport = require("passport");
var passportJWT = require("passport-jwt");
var db


MongoClient.connect('mongodb://localhost:27017/test', function(err, database) {
    if (err) return console.log(err)
    db = database

    // Serve static files
    app.use(express.static(__dirname + '/public'));
    app.use('/bower_components', express.static(__dirname + '/bower_components'));

    app.listen(3000, function() {
        console.log('listening on 3000')
    })
})

app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(bodyParser.json());

// Logging
app.use(morgan('dev'));


//Define Passport Strategy
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
opts.secretOrKey = 'hotCake';

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    console.log(jwt_payload);
    db.collection('users').findOne({
        email: jwt_payload.email
    }, function(err, user) {
        if (err) {
            console.log("MIAU");
            return done(err, false);
        }
        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
}));

// Use the passport package in our application
app.use(passport.initialize());

// Send HTML file
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html')
})

app.get('/apiv1/dashboard', passport.authenticate('jwt', {
    session: false
}), function(req, res) {
    res.send('It worked! User id is: ' + req.user.email + '.');
});

// Register new user
app.post('/apiv1/register', function(req, res) {
    db.collection('users').findOne({
        email: req.body.email
    }, function(err, results) {
        if (err) console.log(err);
        if (results) {
            console.log("Existe el email");
            res.status(409).end();
        } else {
            console.log("No existe el email");
            bcrypt.hash(req.body.password, 10, function(err, hash) {
                if (err) console.log(err);
                db.collection('users').save({
                    email: req.body.email,
                    password: hash,
                    username: req.body.username
                }, function(err, results) {
                    if (err) console.log(err);
                    return res.status(201).json(results);
                })
            })
        }
    })
})


app.post('/apiv1/authenticate', function(req, res) {
    db.collection('users').findOne({
        email: req.body.email
    }, function(err, results) {
        if (err) {
            res.status(500);
            console.log("ERROR " + err);
        }
        if (results) {
            bcrypt.compare(req.body.password, results.password, function(err, isMatch) {
                if (err) console.log(err);
                if (isMatch) {
                    var token = jwt.sign(req.body, 'hotCake', {
                        expiresIn: 3600 // in seconds
                    });
                    console.log("POST / authenticate")
                    results.token = token;
                    res.status(200).json(results);
                } else {
                    console.log("Wrong Password")
                    res.status(403).json(req.body);
                }

            })
        } else {
            console.log("User NOT FOUND");
            res.status(404).json(req.body);
        }
    })
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

// Update acuerdo
app.post('/apiv1/acuerdos/:id', function(req, res) {
    //console.log(req.body);
    var o_id = new mongo.ObjectID(req.body._id);
    delete req.body._id;
    console.log(req.body);
    db.collection('acuerdos').update({
        _id: o_id
    }, req.body, function(err, result) {
        if (err) {
            console.log(err);
            //handleError(result, "Holi", "MUSSS", 400);
        } else {
            //console.log(result);
            console.log("PUT apiv1/acuerdos/" + req.params.id)
            res.status(201).json(result)
        }
    })
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
    var acuerdo = req.body.otherData;
    var file = req.files[0];

    acuerdo.filename = file.filename;
    acuerdo.attachmentURL = file.path;

    //console.log(fileName);
    db.collection('acuerdos').save(acuerdo, function(err, result) {
        if (err) return console.log(err)
        console.log("Succesful POST /acuerdos");
        res.status(201).json(result.ops[0]);
    })
})


app.get('/apiv1/download/:id', function(req, res) {
    //console.log(__dirname);
    var file = __dirname + '/uploads/' + req.params.id;
    fs.stat(file, function(err, stat) {
        if (err == null) {
            fs.readFile(file, function(err, data) {
                res.contentType("application/pdf");
                res.send(data);
            })
        } else {
            res.status(404).send();
        }
    })
});

// Generic function handler used by all endpoints
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({
        "error": message
    });
}
