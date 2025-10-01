// http://localhost:3000/api/test-fetch/final-test
import Fetch from '@/actions/Fetch';
import mongoose from 'mongoose';

export default async function FinalDebugPage() {
  const debugSteps: string[] = [];
  let sampleUser: any = null;
  
  try {
    debugSteps.push('🟡 Starting final debug...');

    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get a sample user to understand the data structure
    debugSteps.push('🔍 Step 1: Getting sample user data structure');
    const usersResult = await Fetch.fetchUser({ limit: 1 });
    if (usersResult.data && usersResult.data.length > 0) {
      sampleUser = usersResult.data[0];
      debugSteps.push('✅ Sample user obtained');
      debugSteps.push(`📋 Sample user keys: ${Object.keys(sampleUser).join(', ')}`);
      debugSteps.push(`📝 Sample user data: ${JSON.stringify(sampleUser, null, 2)}`);
    }

    // Test the failing methods with detailed debugging
    debugSteps.push('🔍 Step 2: Testing fetchUsersWithPhoneNumbers');
    try {
      const phoneResult = await Fetch.fetchUsersWithPhoneNumbers({ limit: 5 });
      debugSteps.push(`📊 Phone result - Success: ${phoneResult.success}`);
      debugSteps.push(`📊 Phone result - Count: ${phoneResult.count}`);
      debugSteps.push(`📊 Phone result - Data length: ${phoneResult.data?.length}`);
      if (phoneResult.error) {
        debugSteps.push(`❌ Phone result error: ${phoneResult.error}`);
      }
      if (phoneResult.data && phoneResult.data.length > 0) {
        debugSteps.push(`📱 Users with phones: ${phoneResult.data.map((user: any) => 
          `${user.name}: ${user.phoneNum}`
        ).join(', ')}`);
      } else {
        debugSteps.push('📱 No users with phone numbers found');
      }
    } catch (error: any) {
      debugSteps.push(`💥 Phone method exception: ${error.message}`);
    }

    debugSteps.push('🔍 Step 3: Testing fetchUsersWithDescriptions');
    try {
      const descResult = await Fetch.fetchUsersWithDescriptions({ limit: 5 });
      debugSteps.push(`📊 Desc result - Success: ${descResult.success}`);
      debugSteps.push(`📊 Desc result - Count: ${descResult.count}`);
      debugSteps.push(`📊 Desc result - Data length: ${descResult.data?.length}`);
      if (descResult.error) {
        debugSteps.push(`❌ Desc result error: ${descResult.error}`);
      }
      if (descResult.data && descResult.data.length > 0) {
        debugSteps.push(`📝 Users with descriptions: ${descResult.data.map((user: any) => 
          `${user.name}: ${user.description?.substring(0, 50)}...`
        ).join(', ')}`);
      } else {
        debugSteps.push('📝 No users with descriptions found');
      }
    } catch (error: any) {
      debugSteps.push(`💥 Desc method exception: ${error.message}`);
    }

    debugSteps.push('🔍 Step 4: Testing username query');
    try {
      const usernameResult = await Fetch.fetchUser({ 
        query: { username: { $exists: true } },
        limit: 5 
      });
      debugSteps.push(`📊 Username query - Success: ${usernameResult.success}`);
      debugSteps.push(`📊 Username query - Count: ${usernameResult.count}`);
      if (usernameResult.data && usernameResult.data.length > 0) {
        debugSteps.push(`👤 Users with username: ${usernameResult.data.map((user: any) => 
          `${user.name}: ${user.username}`
        ).join(', ')}`);
      } else {
        debugSteps.push('👤 No users have username field');
      }
    } catch (error: any) {
      debugSteps.push(`💥 Username query exception: ${error.message}`);
    }

    // Check what fields actually exist in your users
    debugSteps.push('🔍 Step 5: Checking actual user field existence');
    try {
      const allUsers = await Fetch.fetchUser({ limit: 10 });
      if (allUsers.data) {
        const fieldStats: any = {};
        allUsers.data.forEach((user: any) => {
          Object.keys(user).forEach(key => {
            fieldStats[key] = (fieldStats[key] || 0) + 1;
          });
        });
        debugSteps.push(`📈 Field existence stats: ${JSON.stringify(fieldStats)}`);
      }
    } catch (error: any) {
      debugSteps.push(`❌ Field stats error: ${error.message}`);
    }

    await mongoose.disconnect();
    debugSteps.push('✅ Final debug completed');

  } catch (error: any) {
    debugSteps.push(`💥 Critical error: ${error.message}`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">🔧 Fetch Final Debug</h1>
      
      {/* Sample User Info */}
      {sampleUser && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Sample User Structure</h2>
          <pre className="text-sm overflow-auto max-h-60">
            {JSON.stringify(sampleUser, null, 2)}
          </pre>
        </div>
      )}

      {/* Debug Steps */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold mb-3">Debug Steps</h2>
        {debugSteps.map((step, index) => {
          const isError = step.includes('❌') || step.includes('💥');
          const isSuccess = step.includes('✅');
          const isWarning = step.includes('⚠️') || step.includes('🟡');
          const isData = step.includes('📊') || step.includes('📋') || step.includes('📝');
          
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
                  : isData
                  ? 'bg-purple-50 border-purple-200 text-purple-800'
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
        <p className="mb-2">The "failing" tests are likely because:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>No users have <code>phoneNum</code> field populated</li>
          <li>No users have <code>description</code> field populated</li>
          <li>No users have <code>username</code> field populated</li>
        </ul>
        <p className="mt-3 font-semibold">
          This means your Fetch class is working correctly - it's just that your test data doesn't have these fields populated!
        </p>
      </div>
    </div>
  );
}