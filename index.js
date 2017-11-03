'use strict';
// Imports dependencies and set up http server
const
express = require('express'),
	bodyParser = require('body-parser'),
	app = express().use(bodyParser.json());//creates express http server
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337,()=>console.log('Webhook is listening'));
// Creates the endpoint for our webhook
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
app.post('/webhook',(req,res) => {
	let body = req.body;
	//Checks this is an event from a page subscription
	if(body.object === 'page'){
		
		//Iterates over each entry - there may be multiple if batched
		body.entry.forEach(function(entry){
			let webhookEvent = entry.messaging[0];
			console.log(webhookEvent);
			//Get the sender psid 
			let sender_psid = webhookEvent.sender.id;
			console.log('Sender PSID:' +sender_psid);
			// Check if the event is a message or postback
			//Pass the event to appropriate handler function
			if(webhookEvent.message)
			{
			handleMessage(sender_psid, webhookEvent.message);
			}
			else if(webhookEvent.postback)
			{
			handlePostback(sender_psid, webhook_event.postback);
			}
		});
		// Returns a '200 OK' response to all requests
		res.status(200).send('EVENT_RECEIVED');
	}
	else{
		// Returns a '404 Not Found' if event is not from a apage subscription
	res.sendStatus(404);
	}
});
//Adds support for GET requests to our webhook
app.get('/webhook',(req,res)=>{
	//Your verify token. Should be a random string
	const VERIFY_TOKEN = "EAABs4SQR1EoBAEIleafwKHZCdkE6gA42YnRe512rupCXyWgi2ZBifG7m5X71wkvQg516ZAie7w7qY6bgOS4BaWbQUzTvqE1pps8TfWOwCo1EA9HSyfvbBDC6fCy1w4NFftxhtC3cZAROT2oZAGOYZAAr4dIlnFnm7xBNvzj2aGF9S6NfI7oNtY";
	//Parse the query params
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
	// Checks if a token an dmode is in the query string of the request
	 if(mode && token)
	 {
		 // Checks the mode and token sent is correct
		 if(mode === 'subscribe' && token === VERIFY_TOKEN){
			 //Responds with the challenge token from the request
			 console.log('WEBHOOK_VERIFIED');
			 res.status(200).send(challenge);
		 }
		 else
		 {
			 //Responds with '403 Forbidden' if verify tokens do not match
			 res.sendStatus(403);
		 }
	 }
});

//Handles messages events
function handleMessage(sender_psid, received_message){
	let response;
	// check if the message contains text
	if(received_message.text){
	//Create the payload for a basic text message
	response = {
	"text": 'You sent the message: "${received_message.text}". Now send me an image!'
	}
	}
	callSendAPI(sender_psid, response);

}
//Handles messaging_postbacks events
function handlePostback(sender_psid, received_postback){
}
//Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
	// Construct the message body
	let request_body = {
	  "recipient": {
		"id": sender_psid
	  },
	  "message": response
	}
  
	// Send the HTTP request to the Messenger Platform
	request({
	  "uri": "https://graph.facebook.com/v2.6/me/messages",
	  "qs": { "access_token": PAGE_ACCESS_TOKEN },
	  "method": "POST",
	  "json": request_body
	}, (err, res, body) => {
	  if (!err) {
		console.log('message sent!')
	  } else {
		console.error("Unable to send message:" + err);
	  }
	}); 
  }
