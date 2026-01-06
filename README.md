<div align="center">

# CertPro  
### 🎓 Certificate Verification & Generation System  

</div>

[![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Express.js](https://img.shields.io/badge/API-Express.js-000000?logo=express&logoColor=white)](https://expressjs.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌟 Overview  
**CertPro** is a full-stack **Certificate Verification and Generation Platform** designed to automate the process of issuing, validating, and managing digital certificates.

The system ensures **security, authenticity, and transparency** by allowing institutions to generate certificates and users or third parties to verify them instantly using a **unique certificate ID or QR code**.

Built using the **MERN stack (MongoDB, Express.js, React.js, Node.js)**.

---

## ✨ Features  

### 🎓 Students / Certificate Holders  
- View and download issued certificates  
- Verify certificate authenticity  
- Receive certificates via email  
- Access certificate history  

### 🏫 Institutions / Admin Panel  
- Upload student data via Excel  
- Generate certificates in bulk  
- Auto-map Excel columns  
- Manage issued certificates  
- Revoke or update certificates  

### 🔍 Public Verification  
- Verify certificates using Certificate ID  
- QR-based verification support  
- Tamper-proof validation  

---

## 🧩 Tech Stack  

| Layer | Technology |
|------|------------|
| **Frontend** | React.js, React Router, CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | JWT, bcrypt |
| **File Uploads** | Multer, Excel (xlsx) |
| **PDF Generation** | PDFKit |
| **Email Service** | Nodemailer |

---

## ⚙️ Installation Guide  

### 🖥️ Prerequisites  
Ensure you have installed:  
- [Node.js](https://nodejs.org/) (v18 or higher)  
- [MongoDB](https://www.mongodb.com/) or MongoDB Atlas  
- [Git](https://git-scm.com/)  

---

### 🔧 Backend Setup  

```bash
# Clone the repository
git clone https://github.com/TalentHive-Certificate-Verification.git
cd CertPro/backend

# Install dependencies
npm install

# Create .env file
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_secret_key>
EMAIL_USER=<email_address>
EMAIL_PASS=<email_password>

# Start backend server
npm run dev

```

### 🔧 Frontend Setup  

```bash
cd CertPro/frontend

# Install dependencies
npm install

# Start backend server
npm start

```

