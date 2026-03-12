"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = void 0;
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
const sendPasswordResetEmail = async (email, resetLink) => {
    const msg = {
        to: email,
        from: process.env.EMAIL_FROM,
        subject: `Reset your ${process.env.APP_NAME} password`,
        text: `Click the link below to reset your password. This link expires in 60 minutes.\n\n${resetLink}\n\nIf you did not request a password reset, you can ignore this email.`,
        html: `<p>Click the link below to reset your password. This link expires in 60 minutes.</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request a password reset, you can ignore this email.</p>`,
    };
    await mail_1.default.send(msg);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
exports.default = sendMagicLinkEmail;
//# sourceMappingURL=emailService.js.map