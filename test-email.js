const { Resend } = require('resend');

const resend = new Resend('re_7jJ5uyBy_Km1NVzALfuUxQCMBYwWvWBfH');

async function test() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Team Sego <onboarding@resend.dev>',
      to: ['segohopo@gmail.com'], // Your test email
      subject: 'Test Email from Team Sego',
      html: '<h1>Hello!</h1><p>If you received this, email sending works!</p>',
    });

    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Success! Email ID:', data.id);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

test();