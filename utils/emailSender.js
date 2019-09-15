const nodemailer = require("nodemailer");
const pug = require("pug");
const htmlToText = require("html-to-text");

module.exports = class EmailSender {
  constructor(user, url) {
    this.to = user.email,
    this.firstName = user.name.split(" ")[0],
    this.url = url,
    this.from = `Natours Admin ${process.env.EMAIL_FROM}`
  }

  //Crear el transporter
  createNewTransport() {
    if (process.env.NODE_ENV === "production") {
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      })
    }

    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD
      }
    });
  }

  //Enviar el email al usuario
  send(template, subject) {
    //Renderizar el HTML del email desde un template pug
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject: subject
    });

    //Definir las opciones del email
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: htmlToText.fromString(html)
    }

    //Crear el transport y enviar el email
    this.createNewTransport().sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending", error);
      }
    })
  }

  async sendWelcome() {
    this.send("welcome", "Welcome to Natours Website")
  }

  async sendResetPassword() {
    this.send("passwordReset", "Reset your password.")
  }
}
