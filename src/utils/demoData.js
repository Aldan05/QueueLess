// Comprehensive demo mock data for live static deployment (GitHub Pages)
// Allows all 4 demo accounts (Customer, Business, Super Admin, Staff) to showcase full UI functionality

export const DEMO_BUSINESS_ID = '6a59aefc0693afa227a0c0a6';
export const DEMO_CUSTOMER_ID = '6a59a8441f37801592dcee03';
export const DEMO_ADMIN_ID = '6a59a8441f37801592dcee01';
export const DEMO_STAFF_ID = '6a5b1baff3e0bef12705960d';

export const DEMO_BUSINESSES = [
  {
    _id: DEMO_BUSINESS_ID,
    id: DEMO_BUSINESS_ID,
    name: 'Demo Hospital',
    category: 'Hospital',
    rating: 4.8,
    reviewCount: 142,
    waitTime: 15,
    isVerified: true,
    verificationStatus: 'Approved',
    queueActive: true,
    queueStatus: 'open',
    currentToken: 'A-002',
    waiting: 4,
    completedToday: 26,
    country: 'USA',
    state: 'New York',
    district: 'Central District',
    city: 'Metropolis',
    address: '123 Health Ave, Medical District',
    pinCode: '10001',
    phone: '+1 (555) 123-4567',
    ownerName: 'Dr. John Doe',
    ownerEmail: 'business@queueless.com',
    ownerMobile: '+15551234567',
    designation: 'Chief Medical Officer',
    openingTime: '08:00 AM',
    closingTime: '08:00 PM',
    workingDays: 'Monday - Saturday',
    serviceCounters: '3',
    avgServiceTime: '15m',
    services: [
      { id: 's1', name: 'General Consultation', duration: '15m', waitTime: '15m', fee: '$25' },
      { id: 's2', name: 'Pediatric Care', duration: '20m', waitTime: '25m', fee: '$35' },
      { id: 's3', name: 'Diagnostic Lab & Blood Test', duration: '10m', waitTime: '10m', fee: '$40' },
      { id: 's4', name: 'Cardiology Screening', duration: '30m', waitTime: '30m', fee: '$75' }
    ],
    counters: [
      { _id: 'c1', name: 'Counter 1', status: 'Active', staff: 'Demo Staff Member', serviceType: 'General Consultation' },
      { _id: 'c2', name: 'Counter 2', status: 'Active', staff: 'Nurse Sarah Connor', serviceType: 'Pediatric Care' },
      { _id: 'c3', name: 'Counter 3', status: 'Closed', staff: 'Unassigned', serviceType: 'Diagnostic Lab' }
    ]
  },
  {
    _id: '6a59aefc0693afa227a0c0b1',
    id: '6a59aefc0693afa227a0c0b1',
    name: 'Metro Central Bank',
    category: 'Bank',
    rating: 4.7,
    reviewCount: 98,
    waitTime: 10,
    isVerified: true,
    verificationStatus: 'Approved',
    queueActive: true,
    queueStatus: 'open',
    currentToken: 'B-014',
    waiting: 3,
    completedToday: 58,
    country: 'USA',
    state: 'New York',
    district: 'Financial District',
    city: 'Metropolis',
    address: '500 Financial Plaza, Suite 100',
    pinCode: '10005',
    phone: '+1 (555) 987-6543',
    ownerName: 'Alice Morgan',
    ownerEmail: 'alice@metrobank.com',
    ownerMobile: '+15559876543',
    designation: 'Branch Manager',
    openingTime: '09:00 AM',
    closingTime: '05:00 PM',
    workingDays: 'Monday - Friday',
    serviceCounters: '4',
    avgServiceTime: '8m',
    services: [
      { id: 'b1', name: 'Cash Deposit & Withdrawal', duration: '5m', waitTime: '5m', fee: '$0' },
      { id: 'b2', name: 'Account Opening & KYC', duration: '15m', waitTime: '15m', fee: '$0' },
      { id: 'b3', name: 'Loan & Mortgage Advisory', duration: '25m', waitTime: '20m', fee: '$0' }
    ]
  },
  {
    _id: '6a59aefc0693afa227a0c0c2',
    id: '6a59aefc0693afa227a0c0c2',
    name: 'Sunrise Diagnostic Center',
    category: 'Clinic',
    rating: 4.3,
    reviewCount: 19,
    waitTime: 20,
    isVerified: false,
    verificationStatus: 'Pending Review',
    queueActive: false,
    queueStatus: 'closed',
    currentToken: '-',
    waiting: 0,
    completedToday: 0,
    country: 'USA',
    state: 'New York',
    district: 'Uptown',
    city: 'Metropolis',
    address: '77 Sunrise Way',
    pinCode: '10024',
    phone: '+1 (555) 345-6789',
    ownerName: 'Dr. Robert Vance',
    ownerEmail: 'robert@sunrisediag.com',
    ownerMobile: '+15553456789',
    designation: 'Medical Director',
    openingTime: '08:00 AM',
    closingTime: '06:00 PM',
    workingDays: 'Monday - Saturday',
    serviceCounters: '2',
    avgServiceTime: '12m',
    services: [
      { id: 'sd1', name: 'Full Body Health Checkup', duration: '30m', waitTime: '30m', fee: '$99' },
      { id: 'sd2', name: 'X-Ray & Ultrasound', duration: '15m', waitTime: '15m', fee: '$50' }
    ]
  },
  {
    _id: '6a59aefc0693afa227a0c0d3',
    id: '6a59aefc0693afa227a0c0d3',
    name: 'City DMV Express',
    category: 'Government',
    rating: 4.1,
    reviewCount: 310,
    waitTime: 25,
    isVerified: true,
    verificationStatus: 'Approved',
    queueActive: true,
    queueStatus: 'open',
    currentToken: 'D-088',
    waiting: 7,
    completedToday: 115,
    country: 'USA',
    state: 'New York',
    district: 'Civic Center',
    city: 'Metropolis',
    address: '101 Civic Center Blvd',
    pinCode: '10007',
    phone: '+1 (555) 444-2200',
    ownerName: 'State Licensing Dept',
    ownerEmail: 'dmv@citygov.org',
    ownerMobile: '+15554442200',
    designation: 'Director of Operations',
    openingTime: '08:30 AM',
    closingTime: '04:30 PM',
    workingDays: 'Monday - Friday',
    serviceCounters: '6',
    avgServiceTime: '10m',
    services: [
      { id: 'dmv1', name: 'Driver License Renewal', duration: '10m', waitTime: '20m', fee: '$35' },
      { id: 'dmv2', name: 'Vehicle Registration & Titles', duration: '15m', waitTime: '25m', fee: '$50' },
      { id: 'dmv3', name: 'Real ID Application', duration: '15m', waitTime: '20m', fee: '$30' }
    ]
  }
];

export const DEMO_USERS = [
  {
    _id: DEMO_CUSTOMER_ID,
    name: 'Demo Customer',
    email: 'customer@queueless.com',
    role: 'Customer',
    phone: '+1 (555) 012-3456',
    address: '42 Maple Street, Metropolis'
  },
  {
    _id: DEMO_BUSINESS_ID,
    name: 'Demo Hospital Admin',
    email: 'business@queueless.com',
    role: 'Business',
    businessId: DEMO_BUSINESS_ID
  },
  {
    _id: DEMO_ADMIN_ID,
    name: 'Super Admin',
    email: 'admin@queueless.com',
    role: 'Super Admin'
  },
  {
    _id: DEMO_STAFF_ID,
    fullName: 'Demo Staff Member',
    employeeId: 'EMP001',
    role: 'Staff',
    businessId: DEMO_BUSINESS_ID,
    counter: { _id: 'c1', counterNumber: '1', serviceType: 'General Consultation', status: 'Active' }
  }
];

export const DEMO_ANNOUNCEMENTS = [
  {
    _id: 'ann_1',
    title: 'Welcome to QueueLess Live Cloud Demo!',
    content: 'Experience smart queueing and appointments across Customer, Business, Staff, and Admin portals in real-time.',
    audience: 'All',
    priority: 'High',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    _id: 'ann_2',
    title: 'Demo Hospital Extended Working Hours',
    content: 'Demo Hospital service counters are operating today until 08:00 PM for all scheduled appointments.',
    audience: 'Customer',
    priority: 'Medium',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    _id: 'ann_3',
    title: 'Scheduled System Maintenance Notice',
    content: 'Routine performance improvements scheduled for this Sunday from 02:00 AM to 03:00 AM UTC.',
    audience: 'Business',
    priority: 'Low',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export const DEMO_COMPLAINTS = [
  {
    _id: 'comp_1',
    customerName: 'Alice Walker',
    subject: 'Counter 2 Display Screen Update Lag',
    description: 'The overhead token monitor took about 45 seconds to update when token A-001 was called.',
    status: 'In Progress',
    priority: 'Medium',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    _id: 'comp_2',
    customerName: 'David Lee',
    subject: 'Request for SMS Notification Support',
    description: 'Would love an option to receive SMS alerts 10 minutes prior to arriving at the counter.',
    status: 'Open',
    priority: 'Low',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    _id: 'comp_3',
    customerName: 'Clara Oswald',
    subject: 'Parking Validation Integration',
    description: 'Can digital queue tokens validate hospital parking tickets automatically?',
    status: 'Resolved',
    priority: 'Low',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
  }
];

export const DEMO_ACTIVE_CUSTOMER_QUEUE = {
  _id: 'q_demo_customer_1',
  queueId: 'q_demo_customer_1',
  token: 'A-005',
  status: 'waiting',
  position: 3,
  estimatedWait: 15,
  businessId: {
    _id: DEMO_BUSINESS_ID,
    id: DEMO_BUSINESS_ID,
    name: 'Demo Hospital',
    category: 'Hospital',
    address: '123 Health Ave, Medical District',
    city: 'Metropolis',
    currentToken: 'A-002',
    phone: '+1 (555) 123-4567'
  },
  serviceName: 'General Consultation',
  counter: 'Counter 1',
  bookedTime: '10:00 AM',
  joinTime: new Date(Date.now() - 1200000).toISOString()
};

export const DEMO_CUSTOMER_APPOINTMENTS = [
  {
    _id: 'cust_apt_1',
    businessId: DEMO_BUSINESS_ID,
    businessName: 'Demo Hospital',
    category: 'Hospital',
    location: '123 Health Ave, Medical District',
    service: 'Cardiology Screening',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:30 AM',
    status: 'confirmed',
    notes: 'Routine annual checkup'
  },
  {
    _id: 'cust_apt_2',
    businessId: '6a59aefc0693afa227a0c0b1',
    businessName: 'Metro Central Bank',
    category: 'Bank',
    location: '500 Financial Plaza, Suite 100',
    service: 'Account Opening & KYC',
    date: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    time: '02:00 PM',
    status: 'pending',
    notes: 'New savings account'
  }
];

export const DEMO_CUSTOMER_HISTORY = [
  {
    _id: 'hist_demo_1',
    businessId: '6a59aefc0693afa227a0c0b1',
    businessName: 'Metro Central Bank',
    category: 'Bank',
    token: 'B-009',
    serviceName: 'Cash Deposit & Withdrawal',
    status: 'completed',
    displayStatus: 'Completed',
    waitTime: '12 mins',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    rating: 5
  },
  {
    _id: 'hist_demo_2',
    businessId: DEMO_BUSINESS_ID,
    businessName: 'Demo Hospital',
    category: 'Hospital',
    token: 'A-081',
    serviceName: 'Diagnostic Lab & Blood Test',
    status: 'completed',
    displayStatus: 'Completed',
    waitTime: '8 mins',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    rating: 4
  }
];

export const DEMO_BUSINESS_APPOINTMENTS = [
  {
    _id: 'b_apt_1',
    customerId: { name: 'Alice Walker', phone: '+1 (555) 010-0101', email: 'alice@example.com' },
    service: 'General Consultation',
    date: new Date().toISOString().split('T')[0],
    time: '11:00 AM',
    status: 'confirmed',
    notes: 'Follow-up consultation'
  },
  {
    _id: 'b_apt_2',
    customerId: { name: 'Bob Smith', phone: '+1 (555) 010-0102', email: 'bob@example.com' },
    service: 'Pediatric Care',
    date: new Date().toISOString().split('T')[0],
    time: '02:30 PM',
    status: 'pending',
    notes: 'Routine toddler checkup'
  },
  {
    _id: 'b_apt_3',
    customerId: { name: 'Demo Customer', phone: '+1 (555) 012-3456', email: 'customer@queueless.com' },
    service: 'Cardiology Screening',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '10:30 AM',
    status: 'confirmed',
    notes: 'Annual screening'
  },
  {
    _id: 'b_apt_4',
    customerId: { name: 'Clara Oswald', phone: '+1 (555) 010-0104', email: 'clara@example.com' },
    service: 'Diagnostic Lab',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '09:00 AM',
    status: 'pending',
    notes: 'Fasting lipid profile'
  }
];

export const DEMO_STAFF_LIST = [
  {
    _id: DEMO_STAFF_ID,
    fullName: 'Demo Staff Member',
    employeeId: 'EMP001',
    designation: 'Senior Counter Specialist',
    counterNumber: 'Counter 1',
    status: 'Active',
    permissions: ['Manage Queue', 'Verify Documents']
  },
  {
    _id: 'staff_2',
    fullName: 'Nurse Sarah Connor',
    employeeId: 'EMP002',
    designation: 'Triage Nurse',
    counterNumber: 'Counter 2',
    status: 'Active',
    permissions: ['Manage Queue']
  },
  {
    _id: 'staff_3',
    fullName: 'David Miller',
    employeeId: 'EMP003',
    designation: 'Counter Specialist',
    counterNumber: 'Counter 3',
    status: 'Inactive',
    permissions: ['Manage Queue']
  }
];

export const DEMO_ACTIVE_TOKENS = [
  {
    _id: 'tok_3',
    token: 'A-003',
    customerId: { _id: 'cust_alice', name: 'Alice Walker', phone: '+1 (555) 010-0101' },
    serviceName: 'General Consultation',
    status: 'waiting',
    bookedTime: '09:30 AM',
    isPriority: false,
    joinTime: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: 'tok_4',
    token: 'A-004',
    customerId: { _id: 'cust_bob', name: 'Bob Smith', phone: '+1 (555) 010-0102' },
    serviceName: 'Pediatric Care',
    status: 'waiting',
    bookedTime: '09:45 AM',
    isPriority: false,
    joinTime: new Date(Date.now() - 2700000).toISOString()
  },
  {
    _id: 'tok_5',
    token: 'A-005',
    customerId: { _id: DEMO_CUSTOMER_ID, name: 'Demo Customer', phone: '+1 (555) 012-3456' },
    serviceName: 'General Consultation',
    status: 'waiting',
    bookedTime: '10:00 AM',
    isPriority: true,
    joinTime: new Date(Date.now() - 1200000).toISOString()
  },
  {
    _id: 'tok_6',
    token: 'A-006',
    customerId: { _id: 'cust_clara', name: 'Clara Oswald', phone: '+1 (555) 010-0104' },
    serviceName: 'Diagnostic Lab',
    status: 'waiting',
    bookedTime: '10:15 AM',
    isPriority: false,
    joinTime: new Date(Date.now() - 600000).toISOString()
  }
];

export const DEMO_SERVING_CUSTOMER = {
  _id: 'tok_2',
  token: 'A-002',
  customerId: { _id: 'cust_michael', name: 'Michael Scott', phone: '+1 (555) 010-0199' },
  serviceName: 'General Consultation',
  status: 'serving',
  startTime: new Date(Date.now() - 300000).toISOString()
};
