import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const sendMagicLinkEmail = async (email: string, magicLink: string) => {
  const msg = {
    to: email,
    from: process.env.EMAIL_FROM!,
    templateId: String(process.env.MAGIC_LINK_TEMPLATE_ID),
    dynamicTemplateData: {
      user_name: email.split("@")[0],
      app_name: process.env.APP_NAME,
      login_url: magicLink,
      expiry_minutes: process.env.MAGIC_LINK_EXPIRY_LIMIT,
      support_email: process.env.EMAIL_FROM,
    },
  };

  await sgMail.send(msg);
};

export default sendMagicLinkEmail;
