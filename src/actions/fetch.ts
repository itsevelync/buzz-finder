import User, { User as UserType } from '@/model/User';
import { FilterQuery } from 'mongoose';

interface FetchingUsersOptions {
    query?: FilterQuery<UserType>;
    select?: string;
    sort?: Record<string, 1 | -1>;
    limit?: number;
    skip?: number;
    name?: string;
}

export default class Fetch {

    static async fetchUser(options: FetchingUsersOptions = {}) {
        const {
            query = {},
            select = 'name email username phoneNum userId description createdAt updatedAt',
            sort = { createdAt: -1 },
            limit = 0,
            skip = 0,
        } = options;

        try {

            const users = await User.find(query)
                .select(select)
                .sort(sort)
                .skip(skip)
                .limit(limit);
            return {
                success: true,
                data: users,
                count: users.length,
                total: await User.countDocuments(query)
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                return {
                    success: false,
                    error: e.message
                };
            } else {
                return {
                    success: false,
                    error: "An unexpected error occurred."
                };
            }
        }
    }

    static async fetchUserById(userId: string) {
        try {
            const select = 'name email username phoneNum userId description createdAt updatedAt';
            const user = await User.findById(userId).select(select);

            if (!user) {
                return {
                    success: false,
                    error: 'User not found'
                };
            }

            return {
                success: true,
                data: user
            };
        } catch (e: unknown) {
            if (e instanceof Error) {
                return {
                    success: false,
                    error: e.message
                };
            } else {
                return {
                    success: false,
                    error: "An unexpected error occurred."
                };
            }
        }
    }

    /**
     * Fetch users by name (partial match)
     */
    static async fetchUsersByName(name: string, options: FetchingUsersOptions = {}) {
        return this.fetchUser({
            query: {
                name: { $regex: name, $options: 'i' }
            },
            ...options
        });
    }

    /**
     * Fetch users by Phone Number
     */
    static async fetchUsersWithPhoneNumbers(options: FetchingUsersOptions = {}) {
        return this.fetchUser({
            query: {
                phoneNum: { $exists: true }
            },
            ...options
        });
    }

    static async fetchUsersByDateRange(startDate: Date, endDate: Date, options: FetchingUsersOptions = {}) {
        return this.fetchUser({
            query: {
                createdAt: { $gte: startDate, $lte: endDate }
            },
            ...options
        });
    }

    static async fetchUsersWithDescriptions(options: FetchingUsersOptions = {}) {
        return this.fetchUser({
            query: {
                description: { $exists: true }
            },
            ...options
        });
    }

    /**
     * Search users by multiple fields (name, email, username, description)
     */
    static async searchUsers(searchTerm: string, options: FetchingUsersOptions = {}) {
        const searchQuery = {
            $or: [
                { name: { $regex: searchTerm, $options: 'i' } },
                { email: { $regex: searchTerm, $options: 'i' } },
                { username: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ]
        };

        return this.fetchUser({
            query: searchQuery,
            ...options
        });
    }

    static async checkEmailExists(email: string) {
        try {
            const user = await User.findOne({
                email: email.toLowerCase().trim()
            }).select('email');

            return {
                success: true,
                exists: !!user,
                data: user
            };
        } catch (e: unknown) {
            if (e instanceof Error) {
                return {
                    success: false,
                    error: e.message
                };
            } else {
                return {
                    success: false,
                    error: "An unexpected error occurred."
                };
            }
        }
    }

    static async checkUsernameExists(username: string) {
        try {
            const user = await User.findOne({
                username: username.trim()
            }).select('username');

            return {
                success: true,
                exists: !!user,
                data: user
            };
        } catch (e: unknown) {
            if (e instanceof Error) {
                return {
                    success: false,
                    error: e.message
                };
            } else {
                return {
                    success: false,
                    error: "An unexpected error occurred."
                };
            }
        }
    }
}
