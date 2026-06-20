import { User } from "@/model/User";

export function sanitizeUser(user: User | undefined | null, viewerId?: string) {
    if (!user) return user;

    const isOwner = viewerId === user._id.toString();

    if (user.hideEmail && !isOwner) {
        delete user.email;
    }

    return user;
}
