import { doSocialLogin } from "@/actions/User";
import Image from "next/image";

export default function SocialLogins() {
  return (
    <form action={doSocialLogin}>
      <button
        type="submit"
        name="action"
        value="google"
        className="flex gap-3 border border-gray-400 rounded-sm p-2 w-full justify-center hover:bg-gray-100"
      >
        <Image src="/google.svg" alt="Google Logo" width={16} height={16} />
        Sign In with Google
      </button>
      <button
        type="submit"
        name="action"
        value="microsoft-entra-id"
        className="flex gap-3 border border-gray-400 rounded-sm p-2 w-full justify-center hover:bg-gray-100"
      >
        <Image src="/google.svg" alt="Google Logo" width={16} height={16} />
        Sign In with Georgia Tech
      </button>
    </form>
  );
}
