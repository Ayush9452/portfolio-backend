import nodemailer from "nodemailer";

export const sendEmail = async (options)=>{
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_MAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      })

      const mailOption = {
        from: process.env.SMTP_Mail,
        to: options.email,
        subject: options.subject,
        text: options.message
      }

      console.log(options);

      await transport.sendMail(mailOption);
};