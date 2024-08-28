const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'yandex',
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendActivationEmail(email, activationLink) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Activate your FikFok account',
            text: "",
            html:
                `
                    <div>
                        <h1>Click the following link to activate your account</h1>
                        <a href="${activationLink}">${activationLink}</a>
                    </div>
                `
        })
    }
}

module.exports = new MailService();