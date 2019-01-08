var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var fs = require("fs");

function getMaxID(data) {
   var max = 0;
   Object.keys(data).forEach(function (key) {
      if (data[key].id > max) max = data[key].id;
   });
   return max;
}

app.get('/', function (req, res) {
   res.send("Sample Code for RESTful API");
});
app.use(bodyParser.json());

app.get('/listUsers', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
      console.log( data );
      res.end(data);
   });
})

app.get('/showbyID/:id', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
      var users = JSON.parse(data);
      var user = users["user" + req.params.id]
      console.log( data );
      res.end(JSON.stringify(user));
   });
})


app.post('/addUser', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
      data = JSON.parse(data);
      var id = getMaxID(data) + 1;
      var addUser = {};
      addUser.name = req.body.name;
      addUser.password = req.body.password;
      addUser.profession = req.body.profession;
      addUser.id = id;
      data["user" + id] = addUser;
      fs.writeFile('users.json', JSON.stringify(data), function (err) {
         if (err) throw err;
         console.log('Replaced!');
      });
      console.log( data );
      res.end(JSON.stringify(data));
   });
})

app.post('/addMultiUser', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
      data = JSON.parse(data);
      var id = getMaxID(data) + 1;
      Object.keys(req.body).forEach(function (key) {
         var addUsers = {};
         addUsers.name = req.body[key].name;
         addUsers.password = req.body[key].password;
         addUsers.profession = req.body[key].profession;
         addUsers.id = id;
         data["user" + id] = addUsers;
         id++;
      });
      fs.writeFile('users.json', JSON.stringify(data), function (err) {
         if (err) throw err;
         console.log('Replaced!');
      });
      console.log( data );
      res.end(JSON.stringify(data));
   });
})

app.delete('/deleteUser/:id', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
      data = JSON.parse(data);
      try {
         delete data["user" + req.params.id];
         fs.writeFile('users.json', JSON.stringify(data), function (err) {
            if (err) throw err;
            console.log('Replaced!');
         });
      } catch (err) {
         console.log("can't delete id:" + req.params.id);
      }
      console.log( data );
      res.end(JSON.stringify(data));
   });
})

var server = app.listen(8080, function () {
   var port = server.address().port
   console.log("Example app listening at http://localhost:%s", port)
})