

const API_URL = 'http://localhost:5000/api';
const businessId = '6a6d7c197e6383e76696876f';

async function testUpload() {
  console.log(`Testing upload to business: ${businessId}`);
  try {
    const data = JSON.stringify({
      docType: 'docLogo',
      name: 'new_logo.png',
      type: 'image/png',
      size: '2.5MB',
      content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
    });

    const response = await fetch(`${API_URL}/businesses/${businessId}/documents`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: data
    });

    const text = await response.text();
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      console.log('Upload success!');
      const json = JSON.parse(text);
      console.log('Pending docs:', JSON.stringify(json.pendingDocs, null, 2));
      console.log('Verification status:', json.verificationStatus);
    } else {
      console.log('Error:', text);
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

testUpload();
