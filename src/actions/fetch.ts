import User from '@/model/User';
//import ItemSchema from './model/ItemSchema.ts';

class Fetch {
    
    static async fetchUser(options = {}) {
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
                count: User.length,
                total: await User.countDocuments(query)
            }
        } catch(error: any) {
            return {
                success: false,
                error: error.message
            };
        }
        
        

    }
}