require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://kamaltpdev.netlify.app" 
  ],
}));
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

app.post("/contact", async (req, res) => {
  const { name, email, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email, 
      subject: `New Inquiry — ${service || "General"} from ${name}`,
      html: `
        <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:32px;background:#0a0a08;color:#f0ede6;border:1px solid #2a2a28;">
          <h1 style="color:#e8ff47;font-size:28px;margin-bottom:4px;letter-spacing:2px;">NEW MESSAGE</h1>
          <p style="color:#7a7870;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:32px;">Via Portfolio Contact Form</p>

          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #2a2a28;">
              <td style="padding:12px 0;color:#7a7870;font-size:11px;letter-spacing:2px;text-transform:uppercase;width:120px;">Name</td>
              <td style="padding:12px 0;color:#f0ede6;font-size:14px;">${name}</td>
            </tr>
            <tr style="border-bottom:1px solid #2a2a28;">
              <td style="padding:12px 0;color:#7a7870;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Email</td>
              <td style="padding:12px 0;color:#e8ff47;font-size:14px;">${email}</td>
            </tr>
            <tr style="border-bottom:1px solid #2a2a28;">
              <td style="padding:12px 0;color:#7a7870;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Service</td>
              <td style="padding:12px 0;color:#f0ede6;font-size:14px;">${service || "Not specified"}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#7a7870;font-size:11px;letter-spacing:2px;text-transform:uppercase;vertical-align:top;">Message</td>
              <td style="padding:12px 0;color:#f0ede6;font-size:14px;line-height:1.7;">${message.replace(/\n/g, "<br/>")}</td>
            </tr>
          </table>

          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #2a2a28;">
            <p style="color:#7a7870;font-size:11px;letter-spacing:2px;">Hit reply to respond directly to ${name}.</p>
          </div>
        </div>
      `,
    });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));