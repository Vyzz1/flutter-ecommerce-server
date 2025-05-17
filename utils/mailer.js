"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
const fs = __importStar(require("fs"));
const handlebars = __importStar(require("handlebars"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const order_service_1 = __importDefault(require("../services/order.service"));
dotenv_1.default.config();
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAILER_TO,
        pass: process.env.MAILER_PASSWORD,
    },
});
handlebars.registerHelper("formatDate", function (date) {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
});
handlebars.registerHelper("formatPrice", function (price) {
    if (price === undefined || price === null)
        return "0";
    let numericPrice;
    if (typeof price === "string") {
        numericPrice = parseFloat(price.replace(/[^0-9.-]+/g, ""));
    }
    else if (typeof price === "number") {
        numericPrice = price;
    }
    else {
        numericPrice = 0;
    }
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(numericPrice);
});
handlebars.registerHelper("toLowerCase", function (str) {
    return str.toLowerCase();
});
const compileTemplate = (templateName, data) => __awaiter(void 0, void 0, void 0, function* () {
    const filePath = path_1.default.join(__dirname, "../templates", `${templateName}.handlebars`);
    const html = yield fs.promises.readFile(filePath, "utf-8");
    const template = handlebars.compile(html);
    return template(data);
});
const sendMail = (to, subject, template, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const htmlContent = yield compileTemplate(template, data);
        const mailOptions = {
            from: process.env.MAILER_TO,
            to,
            subject,
            html: htmlContent,
        };
        const result = yield transporter.sendMail(mailOptions);
        console.log("Email sent: ", result.response);
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Error sending email");
    }
});
const sendOrderConfirmationEmail = (orderId, to) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = "Order Confirmation";
    const template = "order-confirmation";
    const order = yield order_service_1.default.getOrderById(orderId);
    const data = Object.assign({}, order);
    yield sendMail(to, subject, template, data);
});
exports.default = {
    sendMail,
    sendOrderConfirmationEmail,
};
