import nodemailer from "nodemailer";
import config from "../DefaultConfig/config";

class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: config?.MAIL_EMAIL,
        pass: config?.MAIL_PASSWORD,
      },
    });
  }

  private async sendMail(mailOptions: {
    from: string;
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      return await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  async sendVerificationMail(
    receiver: string,
    subject: string,
    name: string,
    code: string,
  ) {
    const mailOptions = {
      from: config?.MAIL_EMAIL || "",
      to: receiver,
      subject: subject,
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
                    <p>Dear ${name || "User"},</p>
                    <p>Thank you for signing up! To verify your email address, please use the following verification code:</p>
                    <div style="font-size: 20px; font-weight: bold; color: #4CAF50; text-align: center; margin: 20px 0;">${code}</div>
                    <p>If you did not request this, please ignore this email.</p>
                    <p style="margin-top: 30px;">Best Regards,</p>
                    <p>The AfroFest Team</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 12px; text-align: center; color: #888;">If you have any questions, please contact us at <a href="mailto:support@afrofest.com" style="color: #4CAF50; text-decoration: none;">support@afrofest.com</a>.</p>
                </div>
            `,
    };
    return this.sendMail(mailOptions);
  }

  async sendAccountCreationMail(
    receiver: string,
    subject: string,
    name: string,
  ) {
    const mailOptions = {
      from: config?.MAIL_EMAIL || "",
      to: receiver,
      subject: subject,
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">Welcome to AfroFest</h2>
                    <p>Dear ${name || "User"},</p>
                    <p>Thank you for creating an account with AfroFest! We’re excited to have you on board.</p>
                    <p>You can now explore our vibrant community and events tailored for Afro-centric celebrations.</p>
                    <p style="margin-top: 30px;">Best Regards,</p>
                    <p>The AfroFest Team</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 12px; text-align: center; color: #888;">If you have any questions, please contact us at <a href="mailto:support@afrofest.com" style="color: #4CAF50; text-decoration: none;">support@afrofest.com</a>.</p>
                </div>
            `,
    };
    return this.sendMail(mailOptions);
  }

  async sendPasswordChangeMail(
    receiver: string,
    subject: string,
    name: string,
  ) {
    const mailOptions = {
      from: config?.MAIL_EMAIL || "",
      to: receiver,
      subject: subject,
      html: `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <h2 style="color: #4CAF50; text-align: center;">Password Changed Successfully</h2>
                    <p>Dear ${name || "User"},</p>
                    <p>Your password has been successfully changed. If you did not make this change, please contact our support team immediately.</p>
                    <p>To ensure the security of your account, we recommend regularly updating your password and keeping it confidential.</p>
                    <p style="margin-top: 30px;">Best Regards,</p>
                    <p>The AfroFest Team</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="font-size: 12px; text-align: center; color: #888;">If you have any questions, please contact us at <a href="mailto:support@afrofest.com" style="color: #4CAF50; text-decoration: none;">support@afrofest.com</a>.</p>
                </div>
            `,
    };
    return this.sendMail(mailOptions);
  }
  async sendQuestionMail(receiver: string, name: string, question: string) {
    const mailOptions = {
      from: config?.MAIL_EMAIL || "",
      to: config?.MAIL_EMAIL || "", //receiver,
      subject: `New Question from ${name}`,
      html: `
      <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #4CAF50; text-align: center;">New Question Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${receiver}</p>
        <p><strong>Question:</strong></p>
        <blockquote style="background: #f1f1f1; padding: 10px; border-left: 4px solid #4CAF50;">
          ${question}
        </blockquote>
        <p style="margin-top: 30px;">Please respond to the user as soon as possible.</p>
        <p>Best Regards,</p>
        <p>Your Support Team</p>
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="font-size: 12px; text-align: center; color: #888;">If you have any questions, please contact us at <a href="mailto:support@example.com" style="color: #4CAF50; text-decoration: none;">support@example.com</a>.</p>
      </div>
    `,
    };
    return this.sendMail(mailOptions);
  }
}

export const sendMail = {
  sendVerificationMail: new MailService().sendVerificationMail.bind(
    new MailService(),
  ),
  sendQuestionMail: new MailService().sendQuestionMail.bind(new MailService()),

  sendAccountCreationMail: new MailService().sendAccountCreationMail.bind(
    new MailService(),
  ),
  sendPasswordChangeMail: new MailService().sendPasswordChangeMail.bind(
    new MailService(),
  ),
};
