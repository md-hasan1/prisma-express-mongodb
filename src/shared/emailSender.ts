import nodemailer from "nodemailer";
import config from "../config";

const emailSender = async (email: string, html: string, subject: string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: "88af50003@smtp-brevo.com", 
      pass: "8bpBA0zPsrY473IZ", 
    },
  });
  

  const info = await transporter.sendMail({
    from: "smt.team.pixel@gmail.com",
    to: email,
    subject: subject,
    html,
  });
console.log("test");
  
};

export default emailSender;
