const dotenv = require('dotenv');

dotenv.config();

const { sendMail, verifyEmailTransport } = require('../services/emailService');

async function testEmail() {
  const status = await verifyEmailTransport();
  console.log(status.message);
  if (!status.ready) throw new Error(status.message);

  if (process.argv.includes('--send')) {
    const recipient = process.env.EMAIL_TEST_TO || process.env.ADMIN_EMAIL || process.env.GMAIL_USER;
    if (!recipient) throw new Error('Set EMAIL_TEST_TO, ADMIN_EMAIL, or GMAIL_USER before sending a test email.');

    const info = await sendMail({
      to: recipient,
      subject: 'AAA Services email test',
      text: 'Email delivery is configured and working.',
    });
    console.log(`Test email sent: ${info.messageId}`);
  }
}

testEmail().catch((error) => {
  console.error(`Email test failed: ${error.message}`);
  process.exitCode = 1;
});
