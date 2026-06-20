'use server'

import VerificationCode, { IVerificationCode } from "@/model/VerificationCode";
import { randomInt } from "node:crypto";
import { dbConnect } from "@/lib/mongo";
import { SendSmtpEmail, TransactionalEmailsApi, TransactionalEmailsApiApiKeys } from "@getbrevo/brevo";
import User from "@/model/User";
import bcrypt from "bcryptjs";

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

        // Hash the code before storing
        const hashedCode = await bcrypt.hash(code, 10);

        const verificationCode = new VerificationCode({
            email,
            code: hashedCode,
            // Code expires in 10 minutes
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        await verificationCode.save();

        return {
            ...verificationCode.toObject(),
            code,
        } as IVerificationCode;
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
            return { error: "No verification code found. Please refresh and try creating an account again." };
        }

        if (codeDocument.expiresAt < new Date()) {
            return { error: "This verification code has expired. Please refresh and try creating an account again." };
        }

        const codesMatch = await bcrypt.compare(
            code,
            codeDocument.code
        );

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
