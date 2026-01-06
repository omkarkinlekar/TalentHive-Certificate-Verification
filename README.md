## 🎓 Certificate Authentication  

TalentHive includes a **secure Certificate Authentication & Verification system** to validate certificates issued for internships, training programs, and assessments conducted through the platform.  
This ensures **trust, transparency, and authenticity** in candidate credentials.

---

### ✨ Certificate Features  
- Unique **Certificate ID** for every issued certificate  
- Secure storage of certificate data in **MongoDB**  
- **JWT-based authentication** for certificate issuance  
- Public **read-only verification** for recruiters  
- Admin / Employer controlled issuance and revocation  
- Prevents fake or duplicate certificates  

---

### 🔄 Certificate Verification Workflow  
1. Admin or Employer issues a certificate after successful completion  
2. System generates a **unique Certificate ID**  
3. Certificate details are securely stored in the database  
4. Candidate shares Certificate ID with recruiters  
5. Recruiter verifies certificate authenticity via the platform  

---

### 🔗 Certificate Verification API  

```http
GET /api/certificates/verify/:certificateId
