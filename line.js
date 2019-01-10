const bodyParser = require('body-parser')
const request = require('request')
const express = require('express')

const app = express()
const port = 8080
const HEADERS = {
	'Content-Type': 'application/json',
	'Authorization': 'Bearer Cb323ymn6q+7NbsTcoA0+6SZg06tEXwzhlIIShNZcM9HJPJYwSWLOu/9GiqdD6uLtnni5bpQXQikFBwFuOJUDysIbUNW+KlraTp6hT1kPSAYHBxaXugI55JHjc/UmqJoZxkFJnMR/paTw6l8kpE3lgdB04t89/1O/w1cDnyilFU='
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Push
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
		messages: [
			{
				type: 'text',
				text: msg
			}
		]
	})
	curl('push', body)
}

function reply(reply_token, msg) {
	let body = JSON.stringify({
		// reply body
		replyToken: reply_token,
		messages: [
			{
				type: 'text',
				text: msg
			}
		]
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

app.listen(port, function(){
    console.log("server is run ...");
})