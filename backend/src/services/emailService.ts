// import sgMail from "@sendgrid/mail";

// sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// const sendMagicLinkEmail = async (email:string, magicLink:string) => {
//   const msg = {
//     to: email,
//     from: process.env.EMAIL_FROM!,
//     subject: "Your Login Link",
//     html: `
//       <h2>Login to your account</h2>
//       <p>Click the link below to login:</p>
//       <a href="${magicLink}">${magicLink}</a>
//       <p>This link expires in 15 minutes.</p>
//     `,
//   };

//   await sgMail.send(msg);
// };

// export default sendMagicLinkEmail