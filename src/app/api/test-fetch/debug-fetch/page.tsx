// http://localhost:3000/api/test-fetch/debug-fetch
import Fetch from '@/actions/Fetch';
import mongoose from 'mongoose';
/** */
export default async function DebugFetchPage() {
  const debugSteps: string[] = [];
  
  try {
    debugSteps.push('🟡 Starting debug process...');

    // Step 1: Check if Fetch class exists
    debugSteps.push('🔍 Step 1: Checking Fetch class');
    if (!Fetch) {
      debugSteps.push('❌ Fetch class is undefined');
    } else {
      debugSteps.push('✅ Fetch class exists');
      debugSteps.push(`📋 Fetch methods: ${Object.keys(Fetch).join(', ')}`);
    }

    // Step 2: Check MongoDB connection
    debugSteps.push('🔍 Step 2: Checking MongoDB connection');
    let connectionSuccessful = false;
    try {
      if (mongoose.connection.readyState === 0) {
        debugSteps.push('🟡 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI!);
        debugSteps.push('✅ MongoDB connected successfully');
        connectionSuccessful = true;
      } else {
        debugSteps.push('✅ MongoDB already connected');
        connectionSuccessful = true;
      }
    } catch (error: any) {
      debugSteps.push(`❌ MongoDB connection failed: ${error.message}`);
      connectionSuccessful = false;
    }

    // Step 3: Test basic fetchUser with detailed error handling
    debugSteps.push('🔍 Step 3: Testing fetchUser method');
    try {
      const result = await Fetch.fetchUser({ limit: 2 });
      debugSteps.push(`✅ fetchUser executed - Success: ${result.success}`);
      debugSteps.push(`📊 Result structure: ${JSON.stringify({
        success: result.success,
        count: result.count,
        dataLength: result.data?.length,
        hasData: !!result.data,
        hasError: !!result.error
      })}`);
      
      if (result.error) {
        debugSteps.push(`❌ fetchUser error: ${result.error}`);
      }
      
      if (result.data && result.data.length > 0) {
        debugSteps.push(`📝 Sample data: ${JSON.stringify(result.data[0])}`);
      } else {
        debugSteps.push('📝 No data returned from fetchUser');
      }
    } catch (error: any) {
      debugSteps.push(`❌ fetchUser threw exception: ${error.message}`);
    }

    // Step 4: Test individual methods with more details
    const testMethods = [
      { name: 'fetchUsersByName', call: () => Fetch.fetchUsersByName('a', { limit: 1 }) },
      { name: 'checkEmailExists', call: () => Fetch.checkEmailExists('test@example.com') },
      { name: 'checkUsernameExists', call: () => Fetch.checkUsernameExists('testuser') }
    ];

    for (const method of testMethods) {
      debugSteps.push(`🔍 Testing ${method.name}...`);
      try {
        const result = await method.call();
        debugSteps.push(`✅ ${method.name} - Success: ${result.success}`);
        if (result.error) {
          debugSteps.push(`❌ ${method.name} error: ${result.error}`);
        }
      } catch (error: any) {
        debugSteps.push(`❌ ${method.name} threw exception: ${error.message}`);
      }
    }

    // Step 5: Check database collections (only if connection is successful)
    if (connectionSuccessful && mongoose.connection.db) {
      debugSteps.push('🔍 Step 5: Checking database collections');
      try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        debugSteps.push(`📁 Available collections: ${collections.map((c: any) => c.name).join(', ')}`);
        
        // Check if users collection exists and has data
        const usersCollection = collections.find((c: any) => c.name === 'users');
        if (usersCollection) {
          const userCount = await mongoose.connection.db.collection('users').countDocuments();
          debugSteps.push(`👥 Users collection count: ${userCount}`);
          
          if (userCount > 0) {
            const sampleUser = await mongoose.connection.db.collection('users').findOne();
            debugSteps.push(`📝 Sample user keys: ${Object.keys(sampleUser || {}).join(', ')}`);
          } else {
            debugSteps.push('⚠️ Users collection exists but is empty');
          }
        } else {
          debugSteps.push('❌ Users collection does not exist in database');
        }
      } catch (error: any) {
        debugSteps.push(`❌ Collection check failed: ${error.message}`);
      }
    } else {
      debugSteps.push('⏭️ Skipping collection check - no database connection');
    }

    // Step 6: Check environment variables (safely)
    debugSteps.push('🔍 Step 6: Checking environment');
    debugSteps.push(`🌐 NODE_ENV: ${process.env.NODE_ENV || 'Not set'}`);
    debugSteps.push(`🔑 MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
    
    if (connectionSuccessful) {
      debugSteps.push(`📡 Mongoose connection state: ${mongoose.connection.readyState}`);
      debugSteps.push(`🏠 Database name: ${mongoose.connection.db?.databaseName || 'Unknown'}`);
    }

    await mongoose.disconnect();
    debugSteps.push('✅ Debug completed');

  } catch (error: any) {
    debugSteps.push(`💥 Critical error: ${error.message}`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🐛 Fetch Debug Results</h1>
      
      <div className="space-y-3">
        <h2 className="text-xl font-semibold mb-3">Debug Steps</h2>
        {debugSteps.map((step, index) => {
          const isError = step.includes('❌') || step.includes('💥');
          const isSuccess = step.includes('✅');
          const isWarning = step.includes('⚠️') || step.includes('🟡') || step.includes('⏭️');
          
          return (
            <div 
              key={index}
              className={`p-3 rounded border text-sm font-mono ${
                isError 
                  ? 'bg-red-50 border-red-200 text-red-800' 
                  : isSuccess
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : isWarning
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}
            >
              {step}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Summary</h2>
        <ul className="list-disc list-inside space-y-1">
          <li>Total steps: {debugSteps.length}</li>
          <li>Errors: {debugSteps.filter(s => s.includes('❌')).length}</li>
          <li>Warnings: {debugSteps.filter(s => s.includes('⚠️') || s.includes('🟡')).length}</li>
          <li>Successes: {debugSteps.filter(s => s.includes('✅')).length}</li>
        </ul>
      </div>
    </div>
  );
}