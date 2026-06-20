'use server'

import VerificationCode, { IVerificationCode } from "@/model/VerificationCode";
import { randomInt } from "node:crypto";
import { dbConnect } from "@/lib/mongo";
import { timingSafeEqual } from "node:crypto";
import { SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";
import User from "@/model/User";

// Sends an email verification code to the user's email.
export async function sendVerificationCode(email: string, name: string) {
    try {
        if (!process.env.BREVO_API_KEY) {
            return {
                error: "Missing API key in .env file."
            };
        }
        await dbConnect();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return {
                error: "An account with this email already exists. Please ",
                linkText: "login",
                linkHref: "/login"
            };
        }

        const verificationCode = await generateVerificationCode(email);

        const apiInstance = new TransactionalEmailsApi()
        apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

        const sendSmtpEmail = new SendSmtpEmail()

        sendSmtpEmail.subject = "BuzzFinder Email Verification Code";
        sendSmtpEmail.templateId = 2;
        sendSmtpEmail.to = [{ email: email }];
        sendSmtpEmail.params = { verificationCode: verificationCode.code, name: name };

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        return { success: "A verification code has been sent to your email address." }

    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("Error sending verification code:", e);
        }
        return { error: "An unexpected error occurred. Please try again in a few moments." };
    }
}

// Generates a new cryptographically secure 6-digit verification code and saves it to the database.
export async function generateVerificationCode(email: string): Promise<IVerificationCode> {
    try {
        await dbConnect();

        // Generate a 6-digit code
        const code: string = randomInt(100000, 999999).toString();

        // Delete any existing verification codes for this user
        await VerificationCode.deleteMany({ email: email });

        const verificationCode = new VerificationCode({
            email: email,
            code,
            // Code expires in 10 minutes
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        await verificationCode.save();

        return verificationCode;
    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("Error generating verification code:", e);
        }

        throw new Error("Error generating verification code.");
    }
}

// Checks if verification code is correct
export async function compareVerificationCode(email: string, code: string): Promise<{ success?: boolean; error?: string }> {
    try {
        await dbConnect();

        const codeDocument = await VerificationCode.findOne({ email: email }, {}, { sort: { createdAt: -1 } });

        if (!codeDocument) {
            return { error: "No verification code found. Please request a new one." };
        }

        if (codeDocument.expiresAt < new Date()) {
            return { error: "This verification code has expired. Please request a new one." };
        }

        const a = Buffer.from(codeDocument.code, "utf-8");
        const b = Buffer.from(code, "utf-8");

        if (a.length !== b.length) {
            // To maintain constant timing, perform a dummy operation
            timingSafeEqual(a, Buffer.alloc(a.length));
            return { error: "Invalid verification code." };
        }

        const codesMatch = timingSafeEqual(a, b);

        if (codesMatch) {
            return { success: true };
        } else {
            return { error: "Invalid verification code." };
        }

    } catch (e: unknown) {
        if (e instanceof Error) {
            console.error("Error comparing verification codes:", e);
        }
        return { error: "An unexpected error occurred. Please try again." };
    }
}
