const express = require("express")
const app = express();
const cors = require("cors")
const nodemailer = require("nodemailer");
const fs = require("node:fs")
const yt = require("ytdl-core");
require('dotenv').config()
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin:[
    "http://localhost:5173",
    "https://ytlinker.vercel.app"
  ]
}))
const transport = nodemailer.createTransport({
    pool:true,
    maxConnections:1,
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
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${msg}\nTelephone Number: ${tel ?? "No number given"}`,
    };
  
      transport.sendMail(mailoptions, (err, info) => {
        if (err) {
          console.error(err);
         
        } else {
          console.log(info.response);
        }
      });

  }
 let emailsSent = []
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
      </html>`
    };
  
   await  transport.sendMail(mailoptions, (e, info) => {
      if (e) {
        console.error(e);
      } else {
        emails.push(email)
        console.log(info.response);
      }
    });
  }

  function genRandom(len){
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let res = ''
    for (let i = 0; i < len; i++){
        let index = Math.floor(Math.random() * 62);
        res += characters.charAt(index);
    }
    return res;
}
let filename = `${genRandom(12)}.mp4`  
  
app.get("/ytl/dl",( req, res)=>{
  if(req.query.link){
    const {link} = req.query
    const filter = req.query.filter === 'mp3' ? 'audioonly':'audioandvideo' ;
    const stream = yt(link, { filter: filter})
    filename = filter === 'audioandvideo' ? filename : filename.replace('.mp4', '.mp3');
    const writeStream = fs.createWriteStream(filename)
    stream.pipe(writeStream)
    .on("finish",()=>{
        res.download(filename, (err)=>{
            if(err){
              console.log(err)
            }else{
                fs.unlinkSync(filename);
                console.log("yo");
            }
        })
    })
}else{
    res.status(400).send("Bad request")
}
})

app.post("/", (req,res)=>{
  const {name, email, tel, msg} = req.body;
  sendMessage({name,email,tel,msg});
  res.json(req.body)
})
app.post("/reminder", (req,res)=>{
    const {emails, message, names} = req.body;
    // let i = 0
    // let interval = setInterval(()=>{
    //   if((emails.length - 1) === i){
    //     clearInterval(interval)
    //   }
    //     sendReminder(emails[i], message, names[i]);
    //     console.log(i, emails[i])
       
    //     i++;
    // }, 20000)
 
    for(let i = 0; i < emails.length; i++){
        sendReminder(emails[i], message, names[i])
        console.log(i, emails[i])
    }
    res.json({emails: emailsSent})
})
app.listen(process.env.PORT || 3001, ()=>{
    console.log("Running on port ", process.env.PORT);
})