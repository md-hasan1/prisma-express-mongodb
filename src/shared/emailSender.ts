import nodemailer from "nodemailer";
//import config from "../config";

// const emailSender = async (email: string, html: string, subject: string) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.titan.email",
//     port: 465,
//     secure: true,
//     auth: {
//       user: "pixelteam@smtech24.com", 
//       pass: "@pixel321team", 
//     },
//   });
  

//   const info = await transporter.sendMail({
//     from: "pixelteam@smtech24.com",
//     to: email,
//     subject: subject,
//     html,
//   });
// console.log("test");
  
// };

// export default emailSender;

// const emailSender = async (to: string,  html: string, subject: string) => {
//   try {
//   const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 2525,
//   secure: false, // Use TLS, `false` ensures STARTTLS
//   auth: {
//   user: "88af50003@smtp-brevo.com", // Your email address
//   pass: "8bpBA0zPsrY473IZ", // Your app-specific password
//   },
//   })
//   const mailOptions = {
//   from: `<smt.team.pixel@gmail.com>`, // Sender's name and email
//   to, // Recipient's email
//   subject, // Email subject
//   text: html.replace(/<[^>]+>/g, ""), // Generate plain text version by stripping HTML tags
//   html, // HTML email body
//   }
//   // Send the email
//   const info = await transporter.sendMail(mailOptions)
//   return info.messageId
//   } catch (error) {
//   // @ts-ignore
//   console.error(`Error sending email: ${error.message}`)
//   throw new Error("Failed to send email. Please try again later.")
//   }
//   }

//   export default emailSender;




const emailSender = async (to: string, html: string, subject: string) => {
  // console.log("test 1");
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // e.g. smt.team.pixel@gmail.com
        pass: process.env.APP_PASS, // 16-char app password
      },
    });

    const mailOptions = {
      from: `"SMT Team" <${process.env.EMAIL}>`,
      to,
      subject,
      text: html.replace(/<[^>]+>/g, ""),
      html,
    };
    
    const info = await transporter.sendMail(mailOptions);
    // console.log(info);
    return info.messageId;
  } catch (error: any) {
    console.error("Error sending email:", error?.message || error);
    throw new Error("Failed to send email. Please try again later.");
  }
};

export default emailSender;
