"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mail_1 = __importDefault(require("@sendgrid/mail"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
mail_1.default.setApiKey(process.env.SENDGRID_API_KEY);
const sendMagicLinkEmail = async (email, magicLink) => {
    const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        templateId: String(process.env.MAGIC_LINK_TEMPLATE_ID),
        dynamicTemplateData: {
            user_name: email.split("@")[0],
            app_name: process.env.APP_NAME,
            login_url: magicLink,
            expiry_minutes: process.env.MAGIC_LINK_EXPIRY_LIMIT,
            support_email: process.env.EMAIL_FROM,
        },
    };
    await mail_1.default.send(msg);
};
exports.default = sendMagicLinkEmail;
//# sourceMappingURL=emailService.js.map