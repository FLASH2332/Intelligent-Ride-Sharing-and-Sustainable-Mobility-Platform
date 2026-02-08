import nodemailer from "nodemailer";

let transporter;

const createTransporter = async () => {
  const testAccount = await nodemailer.createTestAccount();

  transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log("📧 Ethereal Email ready");
};

await createTransporter();

export const sendEmail = async ({ to, subject, html }) => {
  const info = await transporter.sendMail({
    from: '"GreenCommute" <no-reply@greencommute.dev>',
    to,
    subject,
    html,
  });

  console.log("📨 Preview URL:", nodemailer.getTestMessageUrl(info));
};
