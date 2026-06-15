const crypto = require('crypto');

const getTicketSecret = () => process.env.TICKET_SECRET || process.env.JWT_SECRET || 'cinex-ticket-secret';

const signTicketPayload = (payload) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getTicketSecret())
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
};

const verifyTicketToken = (token) => {
  if (!token || !token.includes('.')) {
    return null;
  }

  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', getTicketSecret())
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSignature) {
    return null;
  }

  return JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
};

module.exports = {
  signTicketPayload,
  verifyTicketToken
};
