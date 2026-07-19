import nodemailer from "nodemailer";

/* ==========================================================================
   MAIL TRANSPORTER
   Matches the same setup already used in studentAuthController.js
   (Gmail service + EMAIL_USER / EMAIL_PASS from env), so both the
   OTP emails and payment alert emails send through the same account.
============================================================================= */

const transporter =
  nodemailer.createTransport({

    service: "gmail",

    auth: {

      user:
        process.env.EMAIL_USER,

      pass:
        process.env.EMAIL_PASS,

    },

  });

/* ==========================================================================
   SEND EMAIL
   Throws on failure — callers emailing many students at once should
   wrap each call in Promise.allSettled so one bad address doesn't
   block the rest (this is exactly what sendPaymentAlert does).
============================================================================= */

export const sendEmail = async ({

  to,
  subject,
  text,
  html,

}) => {

  return transporter.sendMail({

    from:
      process.env.EMAIL_USER,

    to,

    subject,

    text,

    html,

  });

};

export default sendEmail;