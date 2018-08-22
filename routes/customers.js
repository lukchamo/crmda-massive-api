import express from "express"
import customersController from "../controllers/customers"
import multipart from "connect-multiparty"


const api = express.Router()

api.post("/customers/write-massive", multipart(), customersController.writeMassive)
api.post("/garages/write-massive", multipart(), customersController.writeMassiveGarages)


api.get("/customers/test", function(req,res){
  res.send('APi - Actualizada 22 de Agoto 6:52 am')
})


api.get("/customers/sms", function(req,res){
  var TMClient = require('textmagic-rest-client');

  var c = new TMClient('luiscarlosmolina', '384Sq8NTkzU6LbmJffQr3mRE8mv1V8');
  // c.Messages.send({text: 'Este es un mensaje bakanito! de Prueba', phones:'+573024659734'}, function(err, res){
  //     console.log('Messages.send()', err, res);
  // });


  res.send('Mensaje enviado con exito!')
})


api.post("/customers/telesign", function(req,res){
  var TeleSignSDK = require('telesignsdk');

  //return res.status(200).json({req:req.body})

  const customerId = "FB791AA5-D8E7-43A4-85B2-99293530562D";
  const apiKey = "gm5egS8DoztVUfXC0bn7mxMUHUteLLeTVcOIIQbITO7pVqPcvzHqlmv/dKCQdj8Pn1a77+NCct1nAY/qpYU21Q==";
  const rest_endpoint = "https://rest-api.telesign.com";
  const timeout = 10*1000; // 10 secs

  const client = new TeleSignSDK( customerId,
      apiKey,
      rest_endpoint,
      timeout // optional
      // userAgent
  );

  const phoneNumber = req.body.to;
  const message = req.body.sms;
  const messageType = "ARN";

  console.log("## MessagingClient.message ##");

  function messageCallback(error, responseBody) {
      if (error === null) {
        
          // console.log(`Messaging response for messaging phone number: ${phoneNumber}` +
          //     ` => code: ${responseBody['status']['code']}` +
          //     `, description: ${responseBody['status']['description']}`);

             // res.send('Mensaje enviado con exito!')

            const response = {
              success:true,
              code: responseBody['status']['code'],
              description: responseBody['status']['description'],
              phoneNumber: phoneNumber
            }

            return res.status(200).json(response)

      } else {
          //console.error("Unable to send message. " + error);
          return res.status(500).json({ error: error })
      }
  }
  client.sms.message(messageCallback, phoneNumber, message, messageType);
  
})





// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console


export default api