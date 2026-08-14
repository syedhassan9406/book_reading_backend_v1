const PORT = process.env.PORT || 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

async function runTests() {
  console.log('--- Starting API Verification Tests ---');

  try {
    // 1. Health check
    console.log('Testing /api/health...');
    const healthRes = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthRes.json();
    console.log(`Health Status: ${healthRes.status} ->`, healthData);
    if (healthRes.status !== 200) throw new Error('Health check failed');

    // 2. Login test user
    console.log('\nTesting User Login /api/auth/login...');
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword'
      })
    });
    const loginData = await loginRes.json();
    console.log(`Login Status: ${loginRes.status}`);
    if (loginRes.status !== 200) throw new Error(`Login failed: ${loginData.message}`);
    const token = loginData.token;
    console.log(`Token acquired: ${token.substring(0, 20)}...`);

    // 3. Fetch books
    console.log('\nTesting Fetch Books /api/books...');
    const booksRes = await fetch(`${BASE_URL}/api/books`);
    const books = await booksRes.json();
    console.log(`Books status: ${booksRes.status}, Found: ${books.length} books`);
    if (booksRes.status !== 200 || !books.length) throw new Error('Fetch books failed');

    // 4. Fetch User Profile
    console.log('\nTesting Fetch Profile /api/auth/profile...');
    const profileRes = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const profile = await profileRes.json();
    console.log(`Profile status: ${profileRes.status}, User Name: ${profile.name}`);
    if (profileRes.status !== 200) throw new Error('Fetch profile failed');

    // 5. Fetch library progress
    console.log('\nTesting Fetch Library Progress /api/library...');
    const libRes = await fetch(`${BASE_URL}/api/library`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const library = await libRes.json();
    console.log(`Library status: ${libRes.status}, Items in library: ${library.length}`);
    if (libRes.status !== 200) throw new Error('Fetch library failed');

    // 6. Create community discussion
    console.log('\nTesting Create Discussion /api/community...');
    const discRes = await fetch(`${BASE_URL}/api/community`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'NodeJS API Verification Discussion',
        content: 'This post is automatically created by the verification script to verify routes work.',
        category: 'Drama'
      })
    });
    const discData = await discRes.json();
    console.log(`Create Discussion status: ${discRes.status}, Post Title: "${discData.title}"`);
    if (discRes.status !== 201) throw new Error('Create discussion failed');

    // 7. Get community discussions
    console.log('\nTesting Fetch Discussions /api/community...');
    const getDiscRes = await fetch(`${BASE_URL}/api/community`);
    const discussions = await getDiscRes.json();
    console.log(`Fetch Discussions status: ${getDiscRes.status}, Count: ${discussions.length}`);
    if (getDiscRes.status !== 200) throw new Error('Fetch discussions failed');

    console.log('\n=========================================');
    console.log('🎉 ALL API ENDPOINTS VERIFIED SUCCESSFULLY!');
    console.log('=========================================');
  } catch (err) {
    console.error('\n❌ Verification Failed:', err.message);
    process.exit(1);
  }
}

runTests();
