import { auth } from "@/auth";
import SettingsClient from "./SettingsClient";

export default async function Settings() {
    const session = await auth();

    return <SettingsClient session={session} />;
}
