import { useState } from "react";
import {
    LuBug,
    LuCircleCheck,
    LuMegaphone,
    LuMessageSquareText,
    LuSend,
    LuWrench,
} from "react-icons/lu";
import FormInput from "../ui/FormInput";
import { useUser } from "@/context/UserContext";
import { submitContactForm } from "@/actions/ContactForm";
import { toast } from "react-toastify";

export default function ContactTab() {
    const { user } = useUser();

    // Form states
    const [ticketType, setTicketType] = useState<"bug" | "feature" | "general">(
        "bug",
    );
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Brevo form submission
    const handleSupportSubmit = async (
        e: React.SubmitEvent<HTMLFormElement>,
    ) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            const email = formData.get("email") as string;
            const name = formData.get("name") as string;
            const message = formData.get("message") as string;
            const response = await submitContactForm(
                email,
                name,
                message,
                ticketType,
            );

            if (response.success) {
                setFormSubmitted(true);
            } else {
                toast.error(
                    response.error ||
                        "An error occurred sending your message. Please try again.",
                );
            }
        } catch (e: unknown) {
            toast.error(
                e instanceof Error
                    ? "Error sending message: " + e.message
                    : "An unexpected error occurred. Please try again in a few moments.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const ticketTypes = {
        bug: {
            label: "Report Bug",
            icon: <LuBug />,
            textAreaTitle: "Describe the Bug and Steps to Reproduce",
        },
        feature: {
            label: "Feature Request",
            icon: <LuWrench />,
            textAreaTitle: "Describe Your Feature",
        },
        general: {
            label: "Contact Us",
            icon: <LuMessageSquareText />,
            textAreaTitle: "Your Message to the Team",
        },
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-background border border-gray-200 rounded-xl overflow-hidden p-6 space-y-8">
                {/* Context Header */}
                <div className="text-buzz-blue flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <LuMegaphone className="text-buzz-gold" /> Get in
                            Touch
                        </h2>
                        <p className="text-foreground/80 mt-1">
                            Report bugs, submit feature requests, or send any
                            other messages to the BuzzFinder team.
                        </p>
                    </div>
                </div>

                {!formSubmitted ? (
                    <form
                        onSubmit={handleSupportSubmit}
                        className="form space-y-1.5"
                    >
                        {/* Category Selection */}
                        <div>
                            <label className="block mb-2">
                                Select Message Category *
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.keys(ticketTypes).map((type) => {
                                    const btn =
                                        ticketTypes[
                                            type as keyof typeof ticketTypes
                                        ];

                                    return (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() =>
                                                setTicketType(
                                                    type as
                                                        | "bug"
                                                        | "feature"
                                                        | "general",
                                                )
                                            }
                                            className={`text-base/5 flex flex-col items-center justify-center p-3 rounded-lg border border-buzz-blue/30 transition-all gap-1 text-buzz-blue ${
                                                ticketType === type
                                                    ? "font-bold bg-gray-50 translate-y-0.5 border-buzz-blue/50"
                                                    : "font-normal shadow-md hover:border-buzz-gold hover:bg-buzz-gold/10"
                                            }`}
                                        >
                                            <span className="text-2xl mb-1">
                                                {btn.icon}
                                            </span>
                                            {btn.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Standard Identity Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput
                                label="Name"
                                name="name"
                                placeholder="George P. Burdell"
                                required
                                defaultValue={user?.name}
                            />
                            <FormInput
                                label="Email Address"
                                name="email"
                                type="email"
                                placeholder="gburdell3@gatech.edu"
                                required
                                defaultValue={user?.email}
                            />
                        </div>

                        {/* Content Box */}
                        <FormInput
                            label={ticketTypes[ticketType].textAreaTitle}
                            name="message"
                            placeholder="Write your message here..."
                            rows={4}
                            isTextarea
                            required
                        />

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 justify-center"
                        >
                            {isSubmitting ? (
                                "Sending..."
                            ) : (
                                <>
                                    Send Message <LuSend />
                                </>
                            )}
                        </button>
                    </form>
                ) : (
                    /* Submission Confirmation */
                    <div className="p-6 sm:p-12 text-center flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-buzz-gold/5 border border-dashed border-buzz-gold/50 text-buzz-gold rounded-full flex items-center justify-center text-3xl">
                            <LuCircleCheck />
                        </div>
                        <h3 className="text-2xl font-medium text-buzz-blue">
                            Message Received
                        </h3>
                        <p className="text-foreground/80">
                            Thank you for your message. We&rsquo;ll get back to
                            you shortly!
                        </p>
                        <button
                            onClick={() => setFormSubmitted(false)}
                            className="mt-4 font-medium text-buzz-gold hover:underline"
                        >
                            Send New Message
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
