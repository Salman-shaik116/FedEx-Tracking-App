
---

# 📦 FedEx Tracking App – Event Management & Shipment Tracking System

## 📌 Overview

This is a **full-stack event management and tracking application** designed to support role-based workflows, event handling, and shipment tracking through FedEx API integration. The app provides a secure, scalable platform where different types of users can manage events, register for them, and track shipments efficiently.

### ✅ Key Features

* **User Authentication & RBAC** – Role-based access to APIs using JWT.
* **Event Management** – Create, update, and manage events with permissions.
* **Shipment Tracking** – Integrated with FedEx Track API to fetch real-time shipment updates.
* **Analytics Dashboard** – Insights into users, events, registrations, and activity logs for superadmins.
* **Password Recovery & Security** – Email-based password reset using `nodemailer` and hashed credentials via `bcrypt`.

### ✅ Supported Roles

| Role           | Permissions                                                       |
| -------------- | ----------------------------------------------------------------- |
| **Superadmin** | Complete control over users, events, registrations, and analytics |
| **Admin**      | Manage users, view events & registrations (limited access)        |
| **Employer**   | Create and manage events, view registrations for owned events     |
| **User**       | Browse events, register for them, and manage their own profile    |

---

## 🛠 Tech Stack

* **Backend** – Node.js, Express.js, TypeScript
* **Database** – MongoDB with Mongoose ODM
* **Authentication** – JWT-based with role permissions
* **Email Service** – Nodemailer
* **Password Security** – bcrypt
* **API Testing** – Postman
* **Environment Management** – dotenv
* **FedEx Integration** – FedEx Track API

---

## 📂 Project Structure

```
src/
├── config/             # Database & environment configurations
├── middleware/         # JWT authentication & role-based access
├── models/             # MongoDB schemas (User, Event, Registration, etc.)
├── routes/             # API endpoints categorized by functionality
├── utils/              # Helper functions, validation, etc.
├── server.ts           # Application entry point
```

---

## 🔑 Roles & Permissions

### **Superadmin**

✔ Create, update, delete any user
✔ Manage events and registrations
✔ Access analytics and user activity logs
✔ Change roles except for Superadmin

### **Admin**

✔ Create non-Superadmin users
✔ Manage users
✔ View all events and registrations

### **Employer**

✔ Create & manage their own events
✔ View registrations for their events

### **User**

✔ Browse and register for events
✔ Manage their own registrations and profile

---

## 📌 API Routes

### **1. Authentication (/api/auth)**

| Method | Route                   | Description                     |
| ------ | ----------------------- | ------------------------------- |
| POST   | /signup                 | Register a new user             |
| POST   | /login                  | User login                      |
| POST   | /forgot-password        | Send reset token via email      |
| POST   | /reset-password/\:token | Reset password using token      |
| GET    | /profile                | Retrieve logged-in user profile |
| PUT    | /profile                | Update user profile             |
| POST   | /logout                 | Logout the user                 |

### **2. Tracking (/api/track)**

| Method | Route             | Description                     |
| ------ | ----------------- | ------------------------------- |
| GET    | /\:trackingNumber | Fetch shipment tracking details |

### **3. Events (/api/events)**

| Method | Route                      | Description                                |
| ------ | -------------------------- | ------------------------------------------ |
| POST   | /create-event              | Create an event (Superadmin/Employer only) |
| GET    | /available-events          | View available events                      |
| GET    | /employer-events/\:eventId | View employer’s events                     |
| PUT    | /employer-events/\:eventId | Update employer’s event                    |
| DELETE | /employer-events/\:eventId | Delete employer’s event                    |
| GET    | /all-events                | View all events                            |
| PUT    | /all-events/\:eventId      | Update any event                           |
| DELETE | /all-events/\:eventId      | Delete any event                           |

### **4. Registrations (/api/registration)**

| Method | Route                               | Description                           |
| ------ | ----------------------------------- | ------------------------------------- |
| POST   | /register/\:eventId                 | Register for an event                 |
| GET    | /myregistrations                    | View own registrations                |
| DELETE | /myregistrations/\:registrationId   | Cancel registration                   |
| GET    | /employer-registrations/\:eventId   | View registrations for own event      |
| GET    | /all-registrations                  | View all registrations                |
| PUT    | /all-registrations/\:registrationId | Update registration (Superadmin only) |
| DELETE | /all-registrations/\:registrationId | Delete registration (Superadmin only) |

### **5. Analytics (/api/analytics)**

| Method | Route     | Description                        |
| ------ | --------- | ---------------------------------- |
| GET    | /overview | Show analytics overview            |
| GET    | /activity | Recent activity in the last 7 days |

### **6. Superadmin Management (/api/superadmin)**

| Method | Route                 | Description         |
| ------ | --------------------- | ------------------- |
| POST   | /create-user          | Create new users    |
| PUT    | /update-user/\:userId | Update user details |
| DELETE | /delete-user/\:userId | Delete a user       |
| PUT    | /change-role/\:userId | Change user roles   |

---

## ⚙ Setup Instructions

### ✅ Prerequisites

* Node.js and npm installed
* MongoDB instance running
* FedEx Developer Account with API credentials

### ✅ Installation Steps

1. Clone the repository:

   ```bash
   git clone https://github.com/Salman-shaik116/FedEx-Tracking-API.git
   cd FedEx-Tracking-API
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and set the environment variables:

   ```env
   JWT_SECRET=your_jwt_secret
   FEDEX_CLIENT_ID=your_fedex_client_id
   FEDEX_CLIENT_SECRET=your_fedex_client_secret
   FEDEX_BASE_URL=https://apis-sandbox.fedex.com
   FEDEX_ACCOUNT_NUMBER=your_account_number    
   PORT=your_port_number
   MONGODB_URI=your_mongodb_uri
   MONGODB_NAME=your_mongodb_name
   ```

4. Run the development server:

   ```bash
   npm run dev
   ```

---

## 📦 Testing the APIs

* Import the provided **Postman Collection** to test the API endpoints.
* Use the **Bearer Token** generated after login for authenticated requests.
* Follow the permissions based on roles when accessing restricted routes.

---
---
## API Documentation

* For detailed information on the FedEx Track API, refer to the official documentation:
* [FedEx Track API Documentation](https://developer.fedex.com/api/en-us/catalog/track.html)
---

## 📈 Future Improvements

✔ Implement rate limiting and caching for improved performance
✔ Add email notifications for event updates and shipment changes
✔ Enhance UI with a modern frontend framework like React or Angular
✔ Integrate with other courier APIs for multi-provider tracking
✔ Add unit tests and CI/CD pipelines for automated deployments

---

## 📄 License

This project is open-sourced under the **MIT License**.

---

## 🤝 Contribution

Contributions are welcome! Feel free to fork this repository, submit pull requests, and raise issues for improvements.

---





