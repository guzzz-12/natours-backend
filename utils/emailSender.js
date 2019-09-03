const nodemailer = require("nodemailer");

const emailSender = async (options) => {
  //Crear un transporter
  const transporter = nodemailer.createTransport({
    // host: process.env.EMAIL_HOST,
    // port: process.env.EMAIL_PORT,
    // auth: {
    //   user: process.env.EMAIL_USERNAME,
    //   pass: process.env.EMAIL_PASSWORD
    // }
    host: "smtp-mail.outlook.com",
    secureConnection: false,
    port: 587,
    tls: {
       ciphers:'SSLv3'
    },
    auth: {
      user: process.env.HOTMAIL_USER,
      pass: process.env.HOTMAIL_PASSWORD
    }
  });

  //Definir las opciones del email
  const mailOptions = {
    from: "Natours App",
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  //Enviar el email
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      return console.log("Error sending emal")
    }
    return console.log("Email sent successfully")
  });
}

module.exports = emailSender;