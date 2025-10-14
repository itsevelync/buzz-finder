import { DefaultUser } from 'next-auth';
import { DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
    interface User extends DefaultUser {
        _id: string;
        username: string;
    }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
        username: string;
    }
}