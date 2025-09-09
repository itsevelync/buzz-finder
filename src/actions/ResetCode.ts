'use server'

import { Types } from "mongoose";
import ResetCode from "@/model/ResetCode";
import { randomInt } from "node:crypto";
import { dbConnect } from "@/lib/mongo";
import { getUserByEmail } from "@/actions/User";
import { timingSafeEqual } from "node:crypto";


// Sends a password reset code to the user's email.
export async function sendResetCode(email: string) {
    try {
        const user = await getUserByEmail(email);

        if (!user) {
            return {
                error: "There are no accounts associated with that email. Please ",
                linkText: "create an account",
                linkHref: "/sign-up"
            };
        }

        const resetCode = await generateResetCode(user);

        const SibApiV3Sdk = require("@getbrevo/brevo");

        let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

        let apiKey = apiInstance.authentications["apiKey"];
        apiKey.apiKey = process.env.BREVO_API_KEY;

        let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

        sendSmtpEmail.subject = "BuzzFinder Password Reset Code";
        sendSmtpEmail.templateId = 1;
        sendSmtpEmail.to = [{ email: email }];
        sendSmtpEmail.params = { resetCode: resetCode.code };

        await apiInstance.sendTransacEmail(sendSmtpEmail);

        return { success: "If an account exists for that email address, you will receive a password reset link shortly." }

    } catch (e: any) {
        return { error: "An unexpected error occurred. Please try again in a few moments." };
    }
}

interface ResetCodeDocument extends Document {
    userId: Types.ObjectId;
    code: string;
}

// Generates a new cryptographically secure 6-digit reset code and saves it to the database.
export async function generateResetCode(userId: string): Promise<ResetCodeDocument> {
    try {
        await dbConnect();

        // Generate a 6-digit code
        const code: string = randomInt(100000, 999999).toString();

        // Delete any existing reset codes for this user
        await ResetCode.deleteMany({ userId: new Types.ObjectId(userId) });

        const resetCode = new ResetCode({
            userId: new Types.ObjectId(userId),
            code,
            // Code expires in 1 hour
            expiresAt: new Date(Date.now() + 3600000),
        });

        await resetCode.save();

        return resetCode;
    } catch (e: any) {
        console.error("Error generating reset code:", e);
        throw new Error("Error generating reset code.");
    }
}

// Checks if reset code is correct
export async function compareResetCode(email: string, resetCode: string): Promise<{ success?: boolean; error?: string }> {
  try {
    await dbConnect();

    const user = await getUserByEmail(email);
    if (!user) {
        return { error: "Invalid email or verification code." };
    }

    const codeDocument = await ResetCode.findOne({ userId: user._id }, {}, { sort: { createdAt: -1 } });

    if (!codeDocument) {
      return { error: "No verification code found. Please request a new one." };
    }

    if (codeDocument.expiresAt < new Date()) {
        return { error: "This verification code has expired. Please request a new one." };
    }

    const a = Buffer.from(codeDocument.code, "utf-8");
    const b = Buffer.from(resetCode, "utf-8");
    
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
    
  } catch (e: any) {
    console.error("Error comparing reset codes:", e);
    return { error: "An unexpected error occurred. Please try again." };
  }
}