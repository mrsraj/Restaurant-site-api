const twilio = require('twilio');
require('dotenv').config();

const accountSid = process.env.Account_SID;
const authToken = process.env.Auth_Token;
const client = new twilio(accountSid, authToken);

// Replace with your WhatsApp number (the one you joined to the sandbox)
const toWhatsAppNumber = 'whatsapp:+917322078774';

function sendOrderMessage(req) {
  client.messages.create({
    from: 'whatsapp:+14155238886', // Twilio Sandbox number
    to: toWhatsAppNumber,
    body: `Hi ${req.name}! Your food order (ID: ${req.order_id}) has been received. 🍔`
  })
  .then(message => console.log('Message SID:', message.sid))
  .catch(console.error);
}

// Example usage
module.exports =  sendOrderMessage;
