# 🎟️ QueueLess – Smart Queue & Appointment Management System

<p align="center">
  <strong>Skip the waiting. Join the queue. Get served smarter.</strong>
</p>

<p align="center">
  A real-time queue and appointment management platform that connects
  Customers, Businesses, Staff, and Administrators in one intelligent system.
</p>

---

## 🚀 Overview

**QueueLess** is a full-stack real-time queue and appointment management platform designed to eliminate unnecessary waiting and improve customer service.

Instead of physically standing in long queues, customers can:

- 🔎 Discover businesses
- 📅 Book appointments
- 🎟️ Join live queues
- 📍 Track their queue position
- 🔔 Receive real-time notifications
- 📄 Submit documents for verification
- 💬 Communicate with businesses
- ⭐ Rate and review completed services

Businesses can manage their complete operations through a dedicated dashboard, while staff members get their own portal to manage service counters and customers in real time.

---

## 🎯 Problem Statement

Traditional queue systems create several problems:

- Long physical waiting lines
- Uncertain waiting times
- Poor customer experience
- Manual queue management
- Difficulty managing multiple counters
- Lack of real-time communication
- No centralized appointment management
- Limited visibility into staff performance

### 💡 Solution

QueueLess digitizes the complete customer journey:

```text
Customer
    ↓
Find Business
    ↓
Choose Service
    ↓
Appointment / Live Queue
    ↓
Verification (if required)
    ↓
Token Generation
    ↓
Real-Time Queue Tracking
    ↓
Counter Assignment
    ↓
Service
    ↓
Feedback & Rating
✨ Key Features
👤 Customer Module
🔐 Authentication
Customer registration
Secure login
JWT-based authentication
Password encryption
Profile management
🔎 Business Discovery
Search businesses
Filter by category
View business details
View services
View working hours
View current business status
View ratings and reviews
📅 Appointment Management
Browse available services
Select date and time
Submit appointment request
Track appointment status
Accept suggested appointment times
Cancel appointments
View appointment history
🎟️ Live Queue

Customers can join a live queue without physically waiting at the business.

The system provides:

Live token number
Queue position
Customers ahead
Estimated waiting time
Current serving token
Counter information
Real-time queue updates
Queue cancellation
🆔 Customer Verification

Businesses can optionally require verification before customers receive a queue token.

Supported documents can include:

Aadhaar
PAN
Passport
Driving License
Employee ID
Student ID
Other business-defined documents

Verification workflow:

Customer submits request
        ↓
Pending Verification
        ↓
Business / Staff reviews
        ↓
   ┌────┴────┐
   ↓         ↓
Approve    Reject
   ↓         ↓
Token      Reason
Generated  Provided
🔔 Notifications

Customers receive real-time notifications for:

Appointment approval
Appointment rejection
Verification status
Token generation
Queue position changes
Counter assignment
"Your turn" alerts
Service completion
Business messages
Feedback reminders
💬 Secure Messaging

Customers can communicate with businesses when permitted by the platform workflow.

⭐ Feedback & Reviews

After completing a service, customers can provide:

Overall rating
Staff behaviour rating
Service quality rating
Waiting time rating
Cleanliness rating
Booking experience rating
Written review
Optional photos
🏢 Business Module

Businesses have a dedicated dashboard to manage their complete operations.

📝 Business Registration

Businesses can register with:

Business name
Owner information
Contact details
Category
Address
Working hours
Business description
Required verification documents

Businesses require administrator approval before accessing the complete platform.

📊 Business Dashboard

The dashboard provides an overview of:

Today's appointments
Current queue
Waiting customers
Active counters
Staff availability
Completed services
Cancelled bookings
Customer ratings
Business status
🛎️ Service Management

Businesses can:

Create services
Edit services
Delete services
Set service duration
Configure service availability
Manage service-specific requirements

Example:

Service: Account Opening
Duration: 15 minutes
Queue: 8 customers
Status: Available
👨‍💼 Staff Management

Business owners can:

Add staff
Edit staff details
Disable staff accounts
Reset staff passwords
Assign staff permissions
Assign staff to counters
Monitor staff availability

Staff receive their own secure login credentials.

🏢 Service Counter Management

Businesses can create and manage multiple counters.

Example:

Counter 1 → Open
Counter 2 → Serving
Counter 3 → Break
Counter 4 → Closed

Businesses can:

Create counters
Assign staff
Open/close counters
Monitor counter status
Route customers to counters
👨‍💼 Staff Module

Staff members have a dedicated portal.

Staff Dashboard

Staff can view:

Assigned counter
Current customer
Next customer
Waiting customers
Queue position
Service information
Customer details
Queue Controls

Staff can:

▶️ Call Next Customer
🔁 Recall Customer
⏭️ Skip Customer
✅ Complete Service
☕ Start Break
▶️ Resume Service

All queue actions are synchronized in real time.

🆔 Verification Management

Authorized business owners and staff can review customer verification requests.

They can:

View customer details
View requested service
View submitted ID type
View uploaded documents
Approve verification
Reject verification
Provide rejection reason
Request additional information

Once approved:

Verification Approved
        ↓
Token Generated
        ↓
Customer Added to Queue
👑 Admin Module

The administrator controls and monitors the entire QueueLess platform.

Admin Features
Admin authentication
Dashboard
Business management
Customer management
Business approval
Business rejection
User management
Business monitoring
System analytics
Platform activity monitoring
🏢 Business Monitoring

Admin can monitor:

🟢 Open businesses
🟡 Businesses on break
🔴 Closed businesses
⚫ Offline businesses
🟠 Emergency closures

Admin can also view:

Active staff
Waiting customers
Current tokens
Active counters
Appointment statistics
Business ratings
Queue activity
🔔 Real-Time Notification System

QueueLess uses Socket.IO to provide real-time communication.

Notifications are delivered instantly without refreshing the page.

Customer
🎟 Token Generated
🔄 Queue Updated
📍 Counter Assigned
🎉 It's Your Turn
✅ Service Completed
Business
📅 New Appointment
🎟 New Queue Request
📄 Verification Request
⭐ New Review
👨‍💼 Staff Activity
Staff
👤 New Customer
📄 Verification Request
🎟 Next Customer
📍 Counter Assignment
☕ Break Status
Admin
🏢 New Business Registration
👤 New User
⚠️ Long Queue Alert
⭐ Low Rating Alert
📊 System Activity
⭐ Rating & Review System

QueueLess automatically calculates business ratings based on completed customer feedback.

Example:

ABC Bank

⭐⭐⭐⭐⭐ 4.8

2,456 Reviews

Ratings can be displayed for:

Overall Experience
Staff Behaviour
Waiting Time
Service Quality
Cleanliness
Booking Experience

Businesses can respond to customer reviews.

🔄 Complete Queue Workflow
Customer
   │
   ▼
Select Business
   │
   ▼
Select Service
   │
   ▼
Join Live Queue
   │
   ▼
Verification Required?
   │
 ┌─┴─────────────┐
 │               │
Yes              No
 │               │
 ▼               │
Verification     │
 │               │
 ▼               │
Approved         │
 └───────┬───────┘
         ▼
   Token Generated
         │
         ▼
    Waiting Queue
         │
         ▼
    Staff Calls
         │
         ▼
     Now Serving
         │
         ▼
   Service Completed
         │
         ▼
   Customer Feedback
📅 Appointment vs Live Queue
Appointment

Used for a future scheduled time.

Book Today
    ↓
Visit Tomorrow
    ↓
Fixed Time Slot
Live Queue

Used for immediate service.

Join Now
    ↓
Get Token
    ↓
Track Queue
    ↓
Get Served
🔐 Security

QueueLess includes security mechanisms such as:

JWT authentication
Password hashing
Role-based access control
Protected API routes
Authorization middleware
Secure session handling
Input validation
File upload validation
Environment variables for secrets
Business/staff/customer access separation
🏗️ System Architecture
                    QueueLess
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    Customer       Business         Admin
        │              │
        │            Staff
        │              │
        └────── React Frontend ──────┘
                       │
                     Axios
                       │
                Express.js API
                       │
                  Node.js Server
                       │
          ┌────────────┴────────────┐
          │                         │
      MongoDB                   Socket.IO
          │                         │
          └──────── Real-Time ──────┘
🛠️ Technology Stack
Frontend
React.js
JavaScript
HTML5
CSS3
React Router
Axios
Backend
Node.js
Express.js
REST APIs
JWT Authentication
Socket.IO
Database
MongoDB
Mongoose
Other Technologies
Cloudinary
Git
GitHub
Postman
VS Code
📁 Project Structure
QueueLess/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   └── App.jsx
│   │
│   └── package.json
│
├── backend/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
├── README.md
└── .gitignore
⚙️ Installation & Setup
1. Clone the Repository
git clone YOUR_GITHUB_REPOSITORY_URL
cd QueueLess
2. Install Backend Dependencies
cd backend
npm install
3. Install Frontend Dependencies
cd ../frontend
npm install
4. Configure Environment Variables

Create a .env file inside the backend directory.

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

Never commit your .env file to GitHub.

5. Start Backend
cd backend
npm run dev
6. Start Frontend

Open another terminal:

cd frontend
npm run dev
🧪 Testing

The project can be tested using:

Postman
Browser
Multiple user accounts
Customer + Staff simultaneous sessions
Business + Customer simultaneous sessions

Important workflows to test:

Registration
Login
Admin approval
Appointment booking
Live queue joining
Customer verification
Token generation
Staff queue management
Counter assignment
Real-time notifications
Feedback submission
🎥 Project Demo

A complete demonstration of QueueLess is available here:

YouTube:
ADD_YOUR_YOUTUBE_VIDEO_LINK

📸 Screenshots

Add screenshots of your major modules here.

Customer Dashboard

ADD_SCREENSHOT

Business Dashboard

ADD_SCREENSHOT

Staff Dashboard

ADD_SCREENSHOT

Admin Dashboard

ADD_SCREENSHOT

Live Queue

ADD_SCREENSHOT

Verification

ADD_SCREENSHOT

🚀 Future Enhancements

Planned improvements include:

📱 Android/iOS mobile application
🤖 AI-based waiting time prediction
📲 WhatsApp notifications
📩 SMS notifications
🗺️ Google Maps integration
💳 Online payments
📷 QR-based check-in
🎙️ Voice queue announcements
🌍 Multi-language support
🏢 Multi-branch business support
📊 Advanced business analytics
🤖 AI-powered business insights
💡 Why QueueLess?

QueueLess aims to transform traditional waiting systems into a smarter digital experience.

Instead of:

Stand → Wait → Ask → Wait → Service

QueueLess provides:

Book → Track → Get Notified → Arrive → Get Served
👨‍💻 Developer

Aldan L.M. Gehon

B.Tech – Artificial Intelligence & Data Science

Connect With Me
LinkedIn: ADD_YOUR_LINKEDIN
GitHub: ADD_YOUR_GITHUB
YouTube: ADD_YOUR_YOUTUBE
⭐ Support

If you found this project useful or interesting, consider giving the repository a ⭐ on GitHub.
