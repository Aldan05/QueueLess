const mongoose = require('./backend/node_modules/mongoose');

const BASE_URL = 'http://localhost:5000/api';

async function fetchJSON(url, options = {}) {
  const { headers, ...rest } = options;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    ...rest
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE END-TO-END SYSTEM TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Direct MongoDB Connection
  console.log('\n--- 1. DATABASE & MONGOOSE VERIFICATION ---');
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/queueless');
    assert(mongoose.connection.readyState === 1, 'MongoDB is connected at mongodb://127.0.0.1:27017/queueless');
  } catch (err) {
    assert(false, `MongoDB connection failed: ${err.message}`);
  }

  // 2. Authentication: Super Admin Login
  console.log('\n--- 2. ADMIN AUTHENTICATION ---');
  const adminRes = await fetchJSON(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@queueless.com', password: 'password123' })
  });
  assert(adminRes.ok && adminRes.data.role === 'Super Admin', 'Admin login successful with JWT');
  const adminToken = adminRes.data.token;

  // 3. Customer Registration & Login
  console.log('\n--- 3. CUSTOMER REGISTRATION & LOGIN ---');
  const custEmail = `cust_${Date.now()}@test.com`;
  const regCustRes = await fetchJSON(`${BASE_URL}/auth/register/customer`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Alice Walker', email: custEmail, password: 'password123' })
  });
  assert(regCustRes.ok && regCustRes.data.role === 'Customer', 'Customer registration created in MongoDB');
  const customerId = regCustRes.data._id;
  const customerToken = regCustRes.data.token;

  // 4. Business Registration (Self-Service)
  console.log('\n--- 4. BUSINESS REGISTRATION & ADMIN APPROVAL ---');
  const bizEmail = `biz_${Date.now()}@test.com`;
  const regBizRes = await fetchJSON(`${BASE_URL}/auth/register/business`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Apex Health Specialty Center',
      email: bizEmail,
      password: 'password123',
      category: 'Hospital',
      businessPhone: '+19998887777',
      address: '456 Wellness Blvd',
      city: 'Metro City',
      country: 'USA',
      ownerName: 'Dr. Sarah Connor',
      ownerEmail: bizEmail,
      ownerMobile: '+19998887777',
      openingTime: '09:00',
      closingTime: '18:00',
      workingDays: 'Monday - Friday',
      serviceCounters: '2'
    })
  });
  assert(regBizRes.ok, 'Business registered with Pending Review status');
  const businessId = regBizRes.data.businessId;

  // Business should NOT be able to log in yet (pending admin approval)
  const unapprovedLogin = await fetchJSON(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: bizEmail, password: 'password123' })
  });
  assert(unapprovedLogin.status === 403, 'Unverified business blocked from login (HTTP 403)');

  // Admin approves business
  const approveBiz = await fetchJSON(`${BASE_URL}/businesses/${businessId}/verify`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ status: 'Approved' })
  });
  assert(approveBiz.ok && approveBiz.data.isVerified === true, 'Admin successfully approved business');

  // Business logs in after approval
  const approvedLogin = await fetchJSON(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: bizEmail, password: 'password123' })
  });
  assert(approvedLogin.ok && approvedLogin.data.role === 'Business', 'Business admin successfully logged in');
  const businessToken = approvedLogin.data.token;

  // 5. Counters & Staff Management
  console.log('\n--- 5. COUNTER & STAFF SETUP ---');
  // Create Counter 1 for business
  const c1Res = await fetchJSON(`${BASE_URL}/counters/business/${businessId}`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Counter 1 - General' })
  });
  assert(c1Res.ok, 'Created Counter 1 for business');
  const counter1Id = c1Res.data._id;

  // Create Staff
  const staffUsername = `staff_${Date.now()}`;
  const addStaffRes = await fetchJSON(`${BASE_URL}/staff/business/${businessId}`, {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Nurse Jane Doe',
      email: `jane_${Date.now()}@clinic.com`,
      phone: '+15554443322',
      designation: 'Senior Nurse',
      counterId: counter1Id,
      username: staffUsername,
      password: 'staffpassword123',
      permissions: ['Manage Queue', 'Verify Documents']
    })
  });
  assert(addStaffRes.ok, `Created Staff account (${staffUsername}) assigned to Counter 1`);
  const staffId = addStaffRes.data._id;

  // Staff Login
  const staffLoginRes = await fetchJSON(`${BASE_URL}/staff/login`, {
    method: 'POST',
    body: JSON.stringify({ employeeId: staffUsername, password: 'staffpassword123' })
  });
  assert(staffLoginRes.ok && staffLoginRes.data.role === 'Staff', 'Staff logged in with credentials');
  const staffToken = staffLoginRes.data.token;

  // 6. Customer Live Queue (Instant Flow)
  console.log('\n--- 6. LIVE QUEUE (INSTANT JOIN & SERVE) ---');
  const joinQueueRes = await fetchJSON(`${BASE_URL}/customer/queue/join`, {
    method: 'POST',
    body: JSON.stringify({
      businessId,
      userId: customerId,
      partySize: 1,
      purpose: 'General Consultation',
      customerPhone: '+19991112222'
    })
  });
  assert(joinQueueRes.ok && joinQueueRes.data.token && joinQueueRes.data.status === 'waiting', 
    `Customer joined live queue. Received Token: ${joinQueueRes.data.token}`);
  const assignedToken = joinQueueRes.data.token;
  const queueId = joinQueueRes.data.queueId;

  // Verify Active Queue endpoint for customer
  const activeQRes = await fetchJSON(`${BASE_URL}/customer/queue/active/${customerId}`);
  assert(activeQRes.ok && activeQRes.data.token === assignedToken, 'Customer active queue retrieved accurately');

  // Staff calls next in queue
  const callNextRes = await fetchJSON(`${BASE_URL}/businesses/${businessId}/queue/next`, {
    method: 'PATCH',
    body: JSON.stringify({ token: assignedToken, queueId })
  });
  assert(callNextRes.ok && callNextRes.data.currentToken === assignedToken, 
    `Staff called next customer: Business current token is now ${assignedToken}`);

  // Complete service
  const completeQRes = await fetchJSON(`${BASE_URL}/businesses/${businessId}/queue/complete`, {
    method: 'PATCH',
    body: JSON.stringify({ token: assignedToken, staffId })
  });
  assert(completeQRes.ok, `Staff completed service for Token ${assignedToken}`);

  // 7. Live Queue with Document Verification Workflow
  console.log('\n--- 7. LIVE QUEUE WITH DOCUMENT VERIFICATION WORKFLOW ---');
  // Enable verification for business
  await fetchJSON(`${BASE_URL}/businesses/${businessId}/settings/verification`, {
    method: 'PATCH',
    body: JSON.stringify({
      requireVerification: true,
      requiredDocuments: ['Aadhaar Card', 'Passport'],
      verificationMode: 'Manual'
    })
  });

  // Second customer joins with document
  const cust2Email = `cust2_${Date.now()}@test.com`;
  const regCust2 = await fetchJSON(`${BASE_URL}/auth/register/customer`, {
    method: 'POST',
    body: JSON.stringify({ name: 'Bob Smith', email: cust2Email, password: 'password123' })
  });
  const cust2Id = regCust2.data._id;

  const joinVerifRes = await fetchJSON(`${BASE_URL}/customer/queue/join`, {
    method: 'POST',
    body: JSON.stringify({
      businessId,
      userId: cust2Id,
      purpose: 'Specialist Consultation',
      idNumber: 'AADHAAR-8833-2211',
      documents: [{ name: 'Aadhaar Card', type: 'Aadhaar', url: 'https://example.com/doc.pdf' }]
    })
  });
  assert(joinVerifRes.ok && joinVerifRes.data.status === 'pending_verification', 
    'Customer submitted document; status is pending_verification');
  const verifQueueId = joinVerifRes.data.queueId;

  // Business gets pending verification requests
  const pendingRequests = await fetchJSON(`${BASE_URL}/businesses/${businessId}/queue/verification-requests`);
  const foundRequest = pendingRequests.ok && pendingRequests.data.some(q => q._id === verifQueueId);
  assert(foundRequest, 'Pending verification request visible in business dashboard');

  // Business approves verification
  const approveVerifRes = await fetchJSON(`${BASE_URL}/businesses/${businessId}/queue/${verifQueueId}/verify/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ verificationChecklist: { idVerified: true, photoMatched: true } })
  });
  assert(approveVerifRes.ok && approveVerifRes.data.status === 'waiting' && approveVerifRes.data.token !== 'PENDING', 
    `Verification approved! Customer assigned token: ${approveVerifRes.data.token}`);

  // 8. Appointment Booking & Management
  console.log('\n--- 8. APPOINTMENT MANAGEMENT WORKFLOW ---');
  const bookAptRes = await fetchJSON(`${BASE_URL}/customer/appointments`, {
    method: 'POST',
    body: JSON.stringify({
      businessId,
      customerId,
      service: 'General Consultation',
      date: '2026-10-15',
      time: '11:00 AM',
      notes: 'Routine health checkup'
    })
  });
  assert(bookAptRes.ok, 'Customer successfully booked future appointment slot');
  const aptId = bookAptRes.data._id;

  // Business suggests new time
  const suggestRes = await fetchJSON(`${BASE_URL}/businesses/${businessId}/appointments/${aptId}/suggest`, {
    method: 'PATCH',
    body: JSON.stringify({ suggestedTime: '02:00 PM', message: 'Slot full, 2 PM available' })
  });
  assert(suggestRes.ok && suggestRes.data.status === 'suggested', 'Business suggested alternative time slot');

  // Customer accepts suggested time
  const acceptRes = await fetchJSON(`${BASE_URL}/customer/appointments/${aptId}/accept-suggestion`, {
    method: 'PATCH'
  });
  assert(acceptRes.ok && acceptRes.data.status === 'approved', 'Customer accepted suggestion and appointment approved');

  // 9. Customer Feedback & Review System
  console.log('\n--- 9. RATING & REVIEW SYSTEM ---');
  const reviewRes = await fetchJSON(`${BASE_URL}/customer/reviews`, {
    method: 'POST',
    body: JSON.stringify({
      businessId,
      customerId,
      rating: 5,
      waitTimeRating: 4,
      staffBehaviourRating: 5,
      feedback: 'Excellent service and zero waiting time!'
    })
  });
  assert(reviewRes.ok, 'Customer review submitted and stored in MongoDB');

  // Check updated business rating
  const updatedBizRes = await fetchJSON(`${BASE_URL}/businesses/${businessId}`);
  assert(updatedBizRes.ok && updatedBizRes.data.rating > 0 && updatedBizRes.data.reviewCount > 0, 
    `Business rating recalculated: ${updatedBizRes.data.rating}★ (${updatedBizRes.data.reviewCount} reviews)`);

  // 10. Complaints / Support System
  console.log('\n--- 10. COMPLAINTS & TICKETING SYSTEM ---');
  const complaintRes = await fetchJSON(`${BASE_URL}/complaints`, {
    method: 'POST',
    body: JSON.stringify({
      reporterId: customerId,
      reporterName: 'Alice Walker',
      reporterType: 'Customer',
      reporterModel: 'User',
      subject: 'Question about opening hours',
      description: 'Are you open on public holidays?',
      priority: 'Low'
    })
  });
  assert(complaintRes.ok && complaintRes.data.ticketId, `Customer support ticket created: ${complaintRes.data?.ticketId}`);
  const complaintId = complaintRes.data._id;

  // Admin resolves complaint
  const resolveRes = await fetchJSON(`${BASE_URL}/complaints/${complaintId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'Resolved' })
  });
  assert(resolveRes.ok && resolveRes.data.status === 'Resolved', 'Admin resolved support ticket');

  // 11. Announcements System
  console.log('\n--- 11. SYSTEM ANNOUNCEMENTS ---');
  const annRes = await fetchJSON(`${BASE_URL}/announcements`, {
    method: 'POST',
    body: JSON.stringify({
      title: 'Scheduled System Maintenance',
      message: 'Platform maintenance tonight at midnight.',
      targetAudience: 'All',
      priority: 'High',
      author: 'System Admin'
    })
  });
  assert(annRes.ok, 'Admin created system-wide announcement in MongoDB');

  // 12. Notifications System
  console.log('\n--- 12. REAL-TIME NOTIFICATIONS PERSISTENCE ---');
  const notifRes = await fetchJSON(`${BASE_URL}/notifications/customer/${customerId}`);
  assert(notifRes.ok && Array.isArray(notifRes.data), 'Retrieved persistent MongoDB notifications for customer');

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
