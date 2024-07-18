const express = require("express");
const app = express();
const cors = require("cors");
const nodemailer = require("nodemailer");
const fs = require("node:fs");
const yt = require("@distube/ytdl-core");
require("dotenv").config();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "https://ytlinker.vercel.app"],
  })
);
const transport = nodemailer.createTransport({
  pool: true,
  maxConnections: 1,
  rateLimit: 14,
  host: process.env.MAIL_HOST,
  port: 587,
  secure: false, // secureConnection is not a valid property, use 'secure'
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

async function sendMessage({ name, email, tel, msg }) {
  const mailoptions = {
    from: process.env.EMAIL_SENDER,
    to: process.env.EMAIL_RECEIVER,
    subject: `New Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${msg}\nTelephone Number: ${
      tel ?? "No number given"
    }`,
  };

  transport.sendMail(mailoptions, (err, info) => {
    if (err) {
      console.error(err);
    } else {
      console.log(info.response);
    }
  });
}
let emailsSent = [];
async function sendReminder(email, message, name) {
  const mailoptions = {
    from: process.env.EMAIL_SENDER,
    to: email,
    subject: `Reminder`,
    html: `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reminder Email</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f7f7f7;
              }
              .container {
                  width: 100%;
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #ffffff;
                  border: 1px solid #dddddd;
                  border-radius: 8px;
                  overflow: hidden;
              }
              .header {
                  background-color: #007BFF;
                  color: #ffffff;
                  padding: 20px;
                  text-align: center;
              }
              .content {
                  padding: 20px;
              }
              .footer {
                  background-color: #f1f1f1;
                  color: #666666;
                  text-align: center;
                  padding: 10px;
                  font-size: 12px;
              }
              .button {
                  display: inline-block;
                  padding: 10px 20px;
                  margin: 20px 0;
                  color: #ffffff;
                  background-color: #28a745;
                  border-radius: 5px;
                  text-decoration: none;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>${message}</h1>
              </div>
              <div class="content">
                  <p>Dear ${name},</p>
                  <p>This is a friendly reminder about your weekly/daily Bible reading task. Please make sure to complete it Today.</p>
                  <p>God bless you!</p>
                  <a href="https://bible-ochre.vercel.app/dashboard" class="button">View Details</a>
              </div>
              <div class="footer">
                  <p>© 2024 Spiritual Awakening. All rights reserved.</p>
              </div>
          </div>
      </body>
      </html>`,
  };

  await transport.sendMail(mailoptions, (e, info) => {
    if (e) {
      console.error(e);
    } else {
      emails.push(email);
      console.log(info.response);
    }
  });
}

function genRandom(len) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < len; i++) {
    let index = Math.floor(Math.random() * 62);
    res += characters.charAt(index);
  }
  return res;
}
let filename = `${genRandom(12)}.mp4`;

app.get("/ytl/dl", (req, res) => {
  if (req.query.link) {
    const { link } = req.query;
    const filter = req.query.filter === "mp3" ? "audioonly" : "audioandvideo";
    const agent = yt.createAgent(cookies)
    const stream = yt(link, { filter: filter, agent });
    filename =
      filter === "audioandvideo" ? filename : filename.replace(".mp4", ".mp3");
    const writeStream = fs.createWriteStream(filename);
    stream.pipe(writeStream).on("finish", () => {
      res.download(filename, (err) => {
        if (err) {
          fs.unlinkSync(filename);
          console.log(err);
        } else {
          fs.unlinkSync(filename);
          console.log("yo");
        }
      });
    });
  } else {
    res.status(400).send("Bad request");
  }
});

app.post("/", (req, res) => {
  const { name, email, tel, msg } = req.body;
  sendMessage({ name, email, tel, msg });
  res.json(req.body);
});
app.post("/reminder", (req, res) => {
  const { emails, message, names } = req.body;
  console.log(emails);

  for (let i = 0; i < emails.length; i++) {
    sendReminder(emails[i], message, names[i]);
    console.log(i, emails[i]);
  }
  res.json({ emails: emailsSent });
});
app.listen(process.env.PORT || 3001, () => {
  console.log("Running on port ", process.env.PORT);
});

var cookies = [
  {
    domain: ".youtube.com",
    expirationDate: 1742588398.296723,
    hostOnly: false,
    httpOnly: true,
    name: "LOGIN_INFO",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "AFmmF2swRgIhAIM01Pd2svVToegSHn9rulDNNQtUkcCTy5Q7bb5ID-MNAiEA8XsgQE4_GQAypJM9kE9QKbRkrEjI3l5aTbvYsUSXLps:QUQ3MjNmenJBdlEzLTlyNXZxNUM2YVllcEhreHdGczNnZXU0R09UbnlZU04zVk43bzRWQVcwcC1pV0M3ZDV4TWJrV0lBeTdFNFBRX05LWUdra01uQU1LM0lER2YzalZDam11ZmRLZ0RTQUxjb3NNQ1h5UHJtZk1Nd2V3R0FpLWJxZjdUc2p5TUxoNnV0U1FYVkVfcFhSRjB5UXdBdUkzRnlB",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1728752445.225403,
    hostOnly: false,
    httpOnly: true,
    name: "VISITOR_PRIVACY_METADATA",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: "0",
    value: "CgJORxIEGgAgbA%3D%3D",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755889808.878231,
    hostOnly: false,
    httpOnly: false,
    name: "PREF",
    path: "/",
    sameSite: "unspecified",
    secure: true,
    session: false,
    storeId: "0",
    value: "f7=4100&tz=Africa.Lagos",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.291746,
    hostOnly: false,
    httpOnly: true,
    name: "HSID",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value: "AT0C7XrFUNaOEFV4m",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.291853,
    hostOnly: false,
    httpOnly: true,
    name: "SSID",
    path: "/",
    sameSite: "unspecified",
    secure: true,
    session: false,
    storeId: "0",
    value: "AOpefXwjvd5FyAO7V",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.291948,
    hostOnly: false,
    httpOnly: false,
    name: "APISID",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value: "xDKLy9UnfIgB5COA/AZFqvPLXvMNVDLFPx",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.29202,
    hostOnly: false,
    httpOnly: false,
    name: "SAPISID",
    path: "/",
    sameSite: "unspecified",
    secure: true,
    session: false,
    storeId: "0",
    value: "6771Vt6HQk1RIw90/A2wenCmEuubkmtQaO",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.292087,
    hostOnly: false,
    httpOnly: false,
    name: "__Secure-1PAPISID",
    path: "/",
    sameSite: "unspecified",
    secure: true,
    session: false,
    storeId: "0",
    value: "6771Vt6HQk1RIw90/A2wenCmEuubkmtQaO",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.292143,
    hostOnly: false,
    httpOnly: false,
    name: "__Secure-3PAPISID",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: "0",
    value: "6771Vt6HQk1RIw90/A2wenCmEuubkmtQaO",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.292329,
    hostOnly: false,
    httpOnly: false,
    name: "SID",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value:
      "g.a000lwj00UYiM1u0KxWFSpxlEbwUwa3oovFER-4X2HR-29TYlwpmsin9lSZ4YoARkoUZMVG4TgACgYKAW0SARYSFQHGX2MiSlHb0y-dJqBiTlY5gRTn7RoVAUF8yKqmyLWtaUfvjbNv9sVJvZCg0076",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.292356,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-1PSID",
    path: "/",
    sameSite: "unspecified",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "g.a000lwj00UYiM1u0KxWFSpxlEbwUwa3oovFER-4X2HR-29TYlwpm8v4d0QVpPwGshYwVzXn8KAACgYKAUMSARYSFQHGX2MiuUQh-tah4UAlTjoTu2wZLxoVAUF8yKrz6Svhv3jqHLdm28gbP51L0076",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1755428849.292394,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-3PSID",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "g.a000lwj00UYiM1u0KxWFSpxlEbwUwa3oovFER-4X2HR-29TYlwpmGmFHWLX9SSwm5Lo0ixrmmAACgYKAa0SARYSFQHGX2MixDblAv6GqH_8laiC9p2BVxoVAUF8yKqRNgrMNftaiGd--OTH8JPS0076",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1752865812.973252,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-1PSIDTS",
    path: "/",
    sameSite: "unspecified",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "sidts-CjEB4E2dkdasvQtEc_ZglOOOSLnsRgud-cjZEIqkcxFLkGB6Ens0VHGecCwPIM9tdwxxEAA",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1752865812.973386,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-3PSIDTS",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "sidts-CjEB4E2dkdasvQtEc_ZglOOOSLnsRgud-cjZEIqkcxFLkGB6Ens0VHGecCwPIM9tdwxxEAA",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1752865813.048253,
    hostOnly: false,
    httpOnly: false,
    name: "SIDCC",
    path: "/",
    sameSite: "unspecified",
    secure: false,
    session: false,
    storeId: "0",
    value:
      "AKEyXzWP0LbkglnJ3J_PQNStGZjKBoiHi2KiDHWyo6xYlqvY1E1-GHXorCiXoquVU2GwK1HojCo",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1752865813.048347,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-1PSIDCC",
    path: "/",
    sameSite: "unspecified",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "AKEyXzWjzjfbyJTcThVExwIAmJ7wGmmcv5L1_hZvXQMjL2HTLs109t34wjIk3N8ymQFF7NvjcIk",
  },
  {
    domain: ".youtube.com",
    expirationDate: 1752865813.048428,
    hostOnly: false,
    httpOnly: true,
    name: "__Secure-3PSIDCC",
    path: "/",
    sameSite: "no_restriction",
    secure: true,
    session: false,
    storeId: "0",
    value:
      "AKEyXzUeZ4k-62KDgLWNuPRQgImxTchBVqdbS_GN3o6fTxG2qZ-DeUzZ5ddnRaSb1-3yQTwbzE0",
  },
];
