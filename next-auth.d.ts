import { DefaultUser } from 'next-auth';

declare module 'next-auth' {
    interface User extends DefaultUser {
        _id: string;
    }
}