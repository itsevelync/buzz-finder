import { User } from "@/model/User";

export function sanitizeUser(user: User | null | undefined, viewerId?: string) {
    if (!user) return user;

    const sanitized = { ...user };
    const isOwner = viewerId === sanitized._id.toString();

    if (sanitized.hideEmail && !isOwner) {
        delete sanitized.email;
    }

    delete sanitized.hideEmail;

    return sanitized;
}
