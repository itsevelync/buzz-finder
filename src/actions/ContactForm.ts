"use server";

import { dbConnect } from "@/lib/mongo";
import {
    SendSmtpEmail,
    TransactionalEmailsApi,
    TransactionalEmailsApiApiKeys,
} from "@getbrevo/brevo";

// Email BuzzFinder team upon contact form submission
export async function submitContactForm(
    name: string,
    email: string,
    message: string,
    category: string,
) {
    try {
        if (!process.env.BREVO_API_KEY) {
            return {
                error: "Missing API key in .env file.",
            };
        }
        await dbConnect();

        const apiInstance = new TransactionalEmailsApi();
        apiInstance.setApiKey(
            TransactionalEmailsApiApiKeys.apiKey,
            process.env.BREVO_API_KEY,
        );

        const sendSmtpEmail = new SendSmtpEmail();

        sendSmtpEmail.subject = "BuzzFinder Contact Form Submission";
        sendSmtpEmail.templateId = 4;
        sendSmtpEmail.to = [{ email: "buzzfinder404@gmail.com" }];
        sendSmtpEmail.params = { name, email, message, category };

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        return {
            success: "Message successfully sent.",
        };
    } catch (e: unknown) {
        console.error("Error sending message:", e);
        return {
            error:
                e instanceof Error
                    ? "Error sending message: " + e.message
                    : "An unexpected error occurred. Please try again in a few moments.",
        };
    }
}
