// if (process.env.NODE_ENV !== 'production') {
//   require('dotenv').config()
// }

// const express = require('express')
// const cors = require('cors')
// const helmet = require('helmet')
// const morgan = require('morgan')

// const app = express()
// const PORT = process.env.PORT || 4000

// app.use(helmet())
// app.use(morgan('dev'))
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173'
// }))
// app.use(express.json())

// app.get('/', (req, res) => {
//   res.json({ message: 'Portfolio API is running ✅' })
// })

// app.post('/contact', async (req, res) => {
//   const { name, email, service, message } = req.body

//   if (!name || !email || !message) {
//     return res.status(400).json({ error: 'Missing required fields' })
//   }

//   try {
//     const response = await fetch('https://api.resend.com/emails', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         from: 'Kamal Portfolio <kamaldeenmohd13@gmail.com>',
//         to: process.env.TO_EMAIL,
//         reply_to: email,
//         subject: `[Portfolio] ${service || 'General'} inquiry from ${name}`,
//         html: `
//           <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:32px;background:#0a0a08;color:#f0ede6;border:1px solid #2a2a28;">
//             <h1 style="color:#e8ff47;font-size:28px;margin-bottom:4px;letter-spacing:2px;">NEW MESSAGE</h1>
//             <p style="color:#7a7870;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:32px;">Via Portfolio Contact Form</p>
//             <table style="width:100%;border-collapse:collapse;">
//               <tr style="border-bottom:1px solid #2a2a28;">
//                 <td style="padding:12px 0;color:#7a7870;font-size:11px;width:120px;">Name</td>
//                 <td style="padding:12px 0;color:#f0ede6;font-size:14px;">${name}</td>
//               </tr>
//               <tr style="border-bottom:1px solid #2a2a28;">
//                 <td style="padding:12px 0;color:#7a7870;font-size:11px;">Email</td>
//                 <td style="padding:12px 0;color:#e8ff47;font-size:14px;">${email}</td>
//               </tr>
//               <tr style="border-bottom:1px solid #2a2a28;">
//                 <td style="padding:12px 0;color:#7a7870;font-size:11px;">Service</td>
//                 <td style="padding:12px 0;color:#f0ede6;font-size:14px;">${service || 'Not specified'}</td>
//               </tr>
//               <tr>
//                 <td style="padding:12px 0;color:#7a7870;font-size:11px;vertical-align:top;">Message</td>
//                 <td style="padding:12px 0;color:#f0ede6;font-size:14px;line-height:1.7;">${message.replace(/\n/g, '<br/>')}</td>
//               </tr>
//             </table>
//             <div style="margin-top:32px;padding-top:24px;border-top:1px solid #2a2a28;">
//               <p style="color:#7a7870;font-size:11px;">Hit reply to respond directly to ${name} at ${email}</p>
//             </div>
//           </div>
//         `,
//       }),
//     })

//     const data = await response.json()
//     console.log('Resend response:', data)

//     if (response.ok) {
//       res.status(200).json({ success: true })
//     } else {
//       console.error('Resend error:', data)
//       res.status(500).json({ error: data.message || 'Failed to send' })
//     }
//   } catch (err) {
//     console.error('Error:', err)
//     res.status(500).json({ error: 'Failed to send email' })
//   }
// })

// // Keep alive ping
// if (process.env.NODE_ENV === 'production') {
//   const BACKEND_URL = process.env.RAILWAY_STATIC_URL || ''
//   setInterval(async () => {
//     try {
//       await fetch(`${BACKEND_URL}/`)
//       console.log('Keep-alive ping sent')
//     } catch (err) {
//       console.log('Keep-alive failed:', err.message)
//     }
//   }, 14 * 60 * 1000)
// }

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`)
// })


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express    = require('express')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const nodemailer = require('nodemailer')

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware ────────────────────────────────────────────
app.use(helmet())
app.use(morgan('dev'))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173'
}))
app.use(express.json())

// ── Transporter ───────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST,
  port:   parseInt(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Test connection when server starts
transporter.verify((error, success) => {
  if (error) {
    console.error('Mail server connection failed:', error.message)
  } else {
    console.log('Mail server ready ✅')
  }
})

// ── Health check ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Portfolio API is running ✅' })
})

// ── Contact Route ─────────────────────────────────────────
app.post('/contact', async (req, res) => {
  const { name, email, service, message } = req.body

  // Validate
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' })
  }

  try {
    await transporter.sendMail({
      from:    `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to:      process.env.TO_EMAIL,
      replyTo: email,
      subject: `New Inquiry — ${service || 'General'} from ${name}`,
      html: `
        <div style="font-family:monospace;max-width:600px;margin:0 auto;padding:32px;background:#0a0a08;color:#f0ede6;border:1px solid #2a2a28;">

          <h1 style="color:#e8ff47;font-size:28px;margin-bottom:4px;letter-spacing:2px;">
            NEW MESSAGE
          </h1>
          <p style="color:#7a7870;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin-bottom:32px;">
            Via Portfolio Contact Form
          </p>

          <table style="width:100%;border-collapse:collapse;">
            <tr style="border-bottom:1px solid #2a2a28;">
              <td style="padding:12px 0;color:#7a7870;font-size:11px;text-transform:uppercase;letter-spacing:2px;width:120px;">
                Name
              </td>
              <td style="padding:12px 0;color:#f0ede6;font-size:14px;">
                ${name}
              </td>
            </tr>
            <tr style="border-bottom:1px solid #2a2a28;">
              <td style="padding:12px 0;color:#7a7870;font-size:11px;text-transform:uppercase;letter-spacing:2px;">
                Email
              </td>
              <td style="padding:12px 0;color:#e8ff47;font-size:14px;">
                ${email}
              </td>
            </tr>
            <tr style="border-bottom:1px solid #2a2a28;">
              <td style="padding:12px 0;color:#7a7870;font-size:11px;text-transform:uppercase;letter-spacing:2px;">
                Service
              </td>
              <td style="padding:12px 0;color:#f0ede6;font-size:14px;">
                ${service || 'Not specified'}
              </td>
            </tr>
            <tr>
              <td style="padding:12px 0;color:#7a7870;font-size:11px;text-transform:uppercase;letter-spacing:2px;vertical-align:top;">
                Message
              </td>
              <td style="padding:12px 0;color:#f0ede6;font-size:14px;line-height:1.7;">
                ${message.replace(/\n/g, '<br/>')}
              </td>
            </tr>
          </table>

          <div style="margin-top:32px;padding-top:24px;border-top:1px solid #2a2a28;">
            <p style="color:#7a7870;font-size:11px;letter-spacing:2px;">
              Hit reply to respond directly to ${name} at ${email}
            </p>
          </div>

        </div>
      `,
    })

    console.log(`Email sent — ${name} (${email}) inquired about ${service}`)
    return res.status(200).json({ success: true })

  } catch (error) {
    console.error('Send mail error:', error.message)
    return res.status(500).json({ error: 'Failed to send email' })
  }
})

// ── Global error handler ──────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message)
  res.status(500).json({ error: 'Something went wrong' })
})

// ── Keep alive (production only) ──────────────────────────
if (process.env.NODE_ENV === 'production') {
  const BACKEND_URL = process.env.RAILWAY_STATIC_URL || ''
  setInterval(async () => {
    try {
      await fetch(`${BACKEND_URL}/`)
      console.log('Keep-alive ping sent')
    } catch (err) {
      console.log('Keep-alive failed:', err.message)
    }
  }, 14 * 60 * 1000)
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})