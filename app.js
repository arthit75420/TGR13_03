var express = require("express");
const request = require('request')
var bodyParser = require("body-parser");
var app = express();
var fs = require("fs");
const HEADERS = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer Cb323ymn6q+7NbsTcoA0+6SZg06tEXwzhlIIShNZcM9HJPJYwSWLOu/9GiqdD6uLtnni5bpQXQikFBwFuOJUDysIbUNW+KlraTp6hT1kPSAYHBxaXugI55JHjc/UmqJoZxkFJnMR/paTw6l8kpE3lgdB04t89/1O/w1cDnyilFU='
}
var MongoClient = require('mongodb').MongoClient;
//var url = "mongodb://arthit75420:0825410282@localhost:27017/";
var url = "mongodb://localhost:27017/";
function getMaxID(data) {
    var max = 0;
    Object.keys(data).forEach(function (key) {
        if (data[key].id > max) max = data[key].id;
    });
    return max;
}

//line
app.get('/webhook', (req, res) => {
    // push block
    let msg = 'Hello World!'
    push(msg)
    res.send(msg)
})
// Reply
app.post('/webhook', (req, res) => {
    res.send(1);
    // reply block
    if (req.body.events[0].type == 'beacon') {
        let reply_token = req.body.events[0].replyToken
        let msg = JSON.stringify(req.body)
        reply(reply_token, msg)
    }
})

function push(msg) {
    let body = JSON.stringify({
        // push body
        to: 'yyyyy',
        messages: [{
            type: 'text',
            text: msg
        }]
    })
    curl('push', body)
}

function reply(reply_token, msg) {
    let body = JSON.stringify({
        // reply body
        replyToken: reply_token,
        messages: [{
            type: 'text',
            text: msg
        }]
    })
    curl('reply', body);
}

function curl(method, body) {
    request.post({
        url: 'https://api.line.me/v2/bot/message/' + method,
        headers: HEADERS,
        body: body
    }, (err, res, body) => {
        console.log('status = ' + res.statusCode)
    })
}
//quiz
app.get('/', function (req, res) {
    res.send("Sample Code for RESTful API");
});
app.use(bodyParser.json());

app.post('/addSensorData', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("hwData");
        var data = req.body;
        var myobj = {
            Temperature: data.temp,
            Humidity: data.humi,
            "P-IN":data.pIN,
            "P-OUT":data.pOUT,
            Timestamp:data.Timestamp
        };
        dbo.collection("SensorData").insertOne(myobj, function (err, res1) {
            if (err) throw err;
            console.log(myobj);
            console.log("1 document inserted");
            res.send("1 document inserted");
            db.close();
        });
    });
})

app.post('/receiveSensorData', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("hwData");
        var data = req.body.DevEUI_uplink;
        var reciveTime = data.Time;
        var frames = data.payload_parsed.frames;
        var myobj = {
            Temperature: frames[0].value,
            Humidity: frames[1].value,
            "P-IN":frames[2].value,
            "P-OUT":frames[3].value
        };
        dbo.collection("SensorData").insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log(myobj);
            console.log("1 document inserted");
            res.send("1 document inserted");
            db.close();
        });
    });
})

app.post('/receiveBeaconData', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("hwData");
        var data = req.body;
        var myobj = {
            "P-IN":data.in,
            "P-OUT":data.out
        };
        dbo.collection("BeaconData").insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log(myobj);
            console.log("1 document inserted");
            res.send("1 document inserted");
            db.close();
        });
    });
})

app.get('/getSensorData/:hours', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var hours = parseInt(req.params.hours);
        var dbo = db.db("hwData");
        var date = new Date();
        dbo.collection("SensorData").find({}).sort({Timestamp:-1}).limit(hours).toArray(function (err, result) {
            if (err) throw err;
            console.log(result);
            var send = {};
            var packets = [];
            for (var i in result) {
                packets.push( Math.abs( result[i]["P-IN"] - result[i]["P-OUT"]) );
            }
            send.number_of_tourist = packets;
            if(hours > packets.length) send = {"status":"error"};
            res.send(JSON.stringify(send));
            db.close();
        });
    });
})

app.get('/getBeaconData/:hours', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("hwData");
        dbo.collection("temperature").find({}).toArray(function (err, result) {
            if (err) throw err;
            Object.keys(result).forEach(function(key){
                var date = result[key].Timestamp.toLocaleDateString()
                console.log(date);
            });
            res.send(JSON.stringify(result));
            db.close();
        });
    });
})

app.get('/getSensor/:amount', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("hwData");
        var amount = parseInt(req.params.amount);
        dbo.collection("SensorData").find({}).sort({Timestamp:-1}).limit(amount).toArray(function (err, result) {
            if (err) throw err;
            var sensor = {};
            var temp = [],humi = [];
            Object.keys(result).forEach(function(key){
                temp.push(result[key].Temperature);
                humi.push(result[key].Humidity);
            });
            sensor.temp = temp;
            sensor.humidity = humi;
            res.send(JSON.stringify(sensor));
            db.close();
        });
    });
})

app.post('/addData', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("hwData");
        var myobj = {
            teamID: req.body.temp,
            temp: req.body.teamID
        };
        dbo.collection("temperature").insertOne(myobj, function (err, res) {
            if (err) throw err;
            console.log(myobj);
            console.log("1 document inserted");
            res.send("1 document inserted");
            db.close();
        });
    });
})

app.put('/editData/:teamID', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("hwData");
        var id = req.params.teamID;
        var myquery = {
            teamID: id
        };
        var myobj = {
            $set: {
                teamID: req.body.temp,
                temp: req.body.teamID
            }
        };
        dbo.collection("temperature").updateOne(myquery, myobj, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            res.send("1 document updated");
            db.close();
        });
    });
})

app.delete('/deleteData/:teamID', function (req, res) {
    MongoClient.connect(url, {
        useNewUrlParser: true
    }, function (err, db) {
        if (err) throw err;
        var dbo = db.db("hwData");
        var id = req.params.teamID;
        var myquery = {
            teamID: id
        };
        dbo.collection("temperature").deleteOne(myquery, function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
            res.send("1 document updated");
            db.close();
        });
    });
})

var server = app.listen(8080, function () {
    var port = server.address().port
    console.log("Example app listening at http://localhost:%s", port)
})