var express = require("express");
const request = require('request')
var bodyParser = require("body-parser");
var app = express();
var fs = require("fs");

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
        dbo.collection("SensorData").insertOne(myobj, function (err, res1) {
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
        dbo.collection("BeaconData").insertOne(myobj, function (err, res1) {
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
            var temp = [],humi = [],total = [];
            Object.keys(result).forEach(function(key){
                temp.push(result[key].Temperature);
                humi.push(result[key].Humidity);
                total.push( Math.abs( result[key]["P-IN"] - result[key]["P-OUT"] ));
            });
            sensor.temp = temp;
            sensor.humidity = humi;
            sensor.total = total;
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