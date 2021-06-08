// Back-End File
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

// express app
const app = express();

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        'cdnjs.cloudflare.com/ajax/libs/three.js/r127/three.min.js',
        'cdnjs.cloudflare.com/ajax/libs/three.js/r127/three.module.min.js',
      ],
    },
  })
);
app.use(compression());

// will view engine
// app.set('view engine', 'ejs');

// bodyparser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// listen for request
app.listen(process.env.SERVER_PORT || 3000);

// miidleware static files
app.use(express.static('public'));
app.use(express.static('script'));

app.get('/', (req, res) => {
  res.sendFile('./views/index.html', { root: __dirname });
});

// FORM POST REQUEST

app.post('/send', (req, res, next) => {
  const name = req.body.name;
  const emailfrom = req.body.email;
  const subject = req.body.subject;
  const message = req.body.message;
  const output = `
  <h1>details</h2>
  <ul style="font-size:1.4rem;">
    <li>Name: ${name}</li>
    <li>email: ${emailfrom}</li>
  </ul>
  <h2 style="color: red;">Subject</h3>
  <p>${subject}</p>
  <h2>Message:</h4>
  <p>${message}</p>
  `;

  const createTransporter = async () => {
    const oauth2Client = new OAuth2(
      process.env.CLIENT_ID,
      process.env.CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          resolve(process.env.ACCESS_TOKEN);
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        accessToken,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    return transporter;
  };

  const sendEmail = async (emailOptions) => {
    let emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
  };

  sendEmail({
    to: process.env.EMAIL_TO, // list of receivers
    subject: subject, // Subject line
    html: output, // html body
    from: emailfrom,
  });
  res.sendFile('./views/send.html', { root: __dirname });
});

// 404 page

app.use((req, res) => {
  res.status(404).sendFile('./views/404.html', { root: __dirname });
});
