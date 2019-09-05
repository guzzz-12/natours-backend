const nodemailer = require("nodemailer");

const emailSender = async (options) => {
  //Crear un transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASSWORD
    }
  });

  //Definir las opciones del email
  const mailOptions = {
    from: "Natours Website",
    to: options.email,
    subject: options.subject,
    text: options.message
  }

  //Enviar el email
  transporter.sendMail(mailOptions)
  .then(info => {
    console.log(info)
  })
  .catch(err => {
    console.log(err)
  })
}

module.exports = emailSender;