const twilio = require('twilio');
require('dotenv').config();
const accountSid = process.env.Account_SID;
const authToken = process.env.Auth_Token;
const client = new twilio(accountSid, authToken);
const toWhatsAppNumber = 'whatsapp:+917322078774';
function sendOrderMessage(req) {
  client.messages.create({
    from: 'whatsapp:+14155238886',
    to: toWhatsAppNumber,
    body: `Hi ${req.name}! Your food order (ID: ${req.order_id}) has been received. 🍔`
  }).then(message => console.log('Message SID:', message.sid)).catch(console.error);
}
module.exports = sendOrderMessage;
