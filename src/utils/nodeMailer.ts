import nodemailer from "nodemailer";

export async function sendResetPasswordEmail(
  email: string,
  resetUrl: string
): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: "smtp.your-email-provider.com", // Replace with your SMTP host
    port: 587, // Replace with your SMTP port
    secure: false, // true for 465, false for other ports
    auth: {
      user: "your-email@example.com", // Replace with your email address
      pass: "your-email-password", // Replace with your email password
    },
  });

  const mailOptions = {
    from: '"Your App Name" <no-reply@yourapp.com>', // Replace with your app's name
    to: email,
    subject: "Password Reset",
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
           Please click on the following link, or paste this into your browser to complete the process:\n\n
           ${resetUrl}\n\n
           If you did not request this, please ignore this email and your password will remain unchanged.\n`,
  };

  await transporter.sendMail(mailOptions);
}
