import "dotenv/config";
import nodemailer from "nodemailer";
import { config } from "../config/config.js";

const gmailUser = config.GMAIL_USER;
const refreshToken = config.GMAIL_REFRESH_TOKEN


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: gmailUser,
    clientId: config.GOOGLE_CLIENT_ID,
    clientSecret: config.GOOGLE_CLIENT_SECRET,
    refreshToken,
  },
});

async function sendTestEmail() {
  try {
    const result = await transporter.sendMail({
      from: gmailUser,
      to: gmailUser,
      subject: "Dulhan-Gifts - Gmail OAuth Test",
      text: "Bhai, Gmail OAuth and Nodemailer are working successfully!",
    });

    console.log("Test email sent successfully!");
    console.log("Message ID:", result.messageId);
  } catch (error) {
    console.error("Email sending failed:", error.message);
  }
}

sendTestEmail();
