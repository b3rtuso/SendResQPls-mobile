# Privacy Policy — SendResQPls Mobile Application

**Effective Date:** September 7, 2025  
**Last Updated:** September 7, 2025  
**Operator:** Municipal Disaster Risk Reduction and Management Office (MDRRMO Balayan)  
**Jurisdiction:** Municipality of Balayan, Batangas, Republic of the Philippines  

---

## 1. Introduction

The **SendResQPls** mobile application (`SendResQPls-mobile`) is an official municipal emergency reporting and disaster response platform developed for and operated by the **Municipal Disaster Risk Reduction and Management Office (MDRRMO Balayan)**, Local Government Unit of Balayan, Batangas.

MDRRMO Balayan is committed to protecting your privacy and ensuring the security of personal data in strict compliance with the **Philippine Data Privacy Act of 2012 (Republic Act No. 10173)**, its Implementing Rules and Regulations (IRR), and applicable municipal local governance regulations.

This Privacy Policy explains how your information is collected, processed, utilized, shared, stored, and protected when you access or use the SendResQPls mobile application.

---

## 2. Scope and Consent

By downloading, installing, registering, or using the SendResQPls mobile application, you explicitly consent to the collection, recording, storage, updating, modification, retrieval, consultation, and use of your personal and incident data in accordance with the terms of this Policy for legitimate disaster risk reduction, life-safety protection, and emergency dispatch purposes.

If you do not agree with any part of this Policy, please do not use the application. In immediate life-threatening situations where you cannot or choose not to use the application, you may contact MDRRMO Balayan directly through official municipal telephone hotlines (e.g., **Hotline 911** or **0917-123-4567**).

---

## 3. Information We Collect

To effectively coordinate disaster response and dispatch personnel to emergency scenes, SendResQPls collects the following categories of data:

### 3.1 Account Registration & Identity Data
* **Full Name:** Required to identify the reporting party and prevent fraudulent reports.
* **Email Address:** Used for account verification (one-time password / OTP), critical status alerts, and password recovery.
* **Mobile Phone Number:** Enables dispatchers and responders to contact you for on-scene verification or clarification.
* **Password:** Securely stored using one-way cryptographic hashing (bcrypt with automated salt generation). Plaintext passwords are never stored or accessible to staff.

### 3.2 Incident & Emergency Data
* **Hazard Type:** Classification selected by the user (e.g., Fire, Flood, Medical, Traffic Accident, Crime, Landslide, Severe Weather).
* **Incident Description & Notes:** Information provided regarding the emergency situation, victims, or urgent hazards.
* **Media & Photographic Evidence:** Real-time photographs captured via the device camera or selected from storage showing the emergency scene.
* **Report Timestamp:** The exact date and time the report was initiated and transmitted.

### 3.3 Geolocation Data
* **Precise GPS Coordinates (Latitude & Longitude):** Gathered upon incident report submission to pin the exact geographical location on the MDRRMO Command Center map.
* *Note:* SendResQPls only captures location data when submitting an emergency report or interacting with location-dependent emergency features. It does not perform continuous covert background tracking when the application is idle.

### 3.4 Device & Diagnostic Data
* **Push Notification Token:** Firebase Cloud Messaging (FCM) device registration token required to deliver operational push notifications.
* **Device Characteristics:** Operating system version (Android), device model, network state, and application build number to diagnose technical malfunctions.
* **System Activity Logs:** Application logs generated during server-sent event (SSE) streams, authentication sessions, and API requests for audit and troubleshooting.

---

## 4. Purpose and Legal Basis for Processing

Under Republic Act No. 10173, processing of personal and sensitive personal information is permissible when necessary to protect the life and health of the data subject or another person, or for the fulfillment of a public authority's statutory mandate. We process your data for the following purposes:

1. **Life-Safety & Emergency Dispatch:** Rapidly transmitting verified emergency details to MDRRMO dispatchers and deploying emergency rescue teams to the exact coordinates.
2. **Citizen Communication:** Providing real-time progression notifications (e.g., *Pending*, *Reviewing*, *Dispatched*, *Resolved*) to the reporting citizen.
3. **Inter-Agency Coordination:** Routing verified hazard data to specialized local emergency service units (BFP Balayan, PNP Balayan, Municipal Health Office, and Municipal Engineering).
4. **Disaster Risk Analytics:** Generating aggregate municipal disaster analytics, identifying hazard hotspots, and formulating community mitigation strategies.
5. **Government Archival & Audit Compliance:** Maintaining verifiable administrative records of municipal emergency calls as required by local government oversight rules.

---

## 5. Information Sharing and Disclosure

MDRRMO Balayan maintains strict access controls over your data. Information is only shared under the following conditions:

### 5.1 Emergency Service Units
Incident details, location coordinates, and reporter contact information are provided to municipal first responders actively deployed to the emergency:
* **Bureau of Fire Protection (BFP) – Balayan Station** (for fires and hazardous material leaks)
* **Philippine National Police (PNP) – Balayan Municipal Police Station** (for crime and security incidents)
* **Municipal Health Office (MHO) / Rural Health Unit** (for medical emergencies and trauma)
* **Municipal Engineering Office** (for structural collapse, road blockage, infrastructure failure)
* **MDRRMO Rescue Unit** (for flood rescue, typhoons, landslides, and vehicular extrication)

### 5.2 Trusted Third-Party Service Providers (Sub-processors)
SendResQPls utilizes enterprise-grade cloud service providers bound by strict confidentiality and data protection agreements:
* **Supabase / PostgreSQL:** Secure cloud database infrastructure for structured data storage with encryption at rest and in transit.
* **Cloudinary:** Encrypted cloud storage for incident media attachments and photographs.
* **Google Firebase (Firebase Cloud Messaging):** Delivery of real-time push notification alerts to your mobile device.
* **Brevo (formerly Sendinblue):** Transactional email delivery for account verification codes and status alerts.

### 5.3 Legal and Regulatory Authorities
Information may be disclosed if required by law, subpoena, or official judicial order in accordance with Philippine law.

### 5.4 Prohibition on Commercial Use
**We do not sell, trade, rent, lease, or monetize personal information to third-party advertisers, marketing agencies, or data brokers under any circumstances.**

---

## 6. Data Storage and Security Safeguards

MDRRMO Balayan implements robust organizational, physical, and technical safeguards to prevent unauthorized access, accidental loss, alteration, or disclosure of personal data:

* **Transport Encryption:** All network transmissions between the mobile client and backend servers are secured using Transport Layer Security (TLS 1.3 / HTTPS).
* **Credential Protection:** User passwords are encrypted using bcrypt hashing before storage.
* **Token-Based Authentication:** API interactions are authenticated via signed JSON Web Tokens (JWT) with restricted expiration periods.
* **Access Control:** Command Center administrators access data through role-based access control (RBAC) requiring administrative credentials.
* **Rate Limiting & DDoS Mitigation:** Backend infrastructure enforces automated rate limiting and security headers (Helmet) to prevent brute-force attacks and abuse.

---

## 7. Data Retention Policy

Personal data is retained only for the duration necessary to fulfill the purposes set out in this Policy:

* **User Account Records:** Retained as long as your account remains active. Upon a verified account deletion request, personal identifying profile information is permanently purged within thirty (30) calendar days.
* **Incident Reports & Logs:** Official disaster incident records are retained for a minimum of three (3) years to comply with local governance reporting mandates, disaster audit requirements, and public safety record-keeping guidelines under RA 9470.
* **Media & Photographs:** Incident photos uploaded during reporting are archived securely for one (1) year following incident resolution, after which they are reviewed for scheduled deletion unless retained as evidence in legal or administrative proceedings.

---

## 8. User Rights Under Republic Act No. 10173

Under the Philippine Data Privacy Act of 2012, registered users hold the following statutory rights regarding their personal data:

1. **Right to be Informed:** The right to know how your personal data is collected, handled, and processed.
2. **Right to Access:** The right to request reasonable access to personal data held about you in the SendResQPls system.
3. **Right to Rectification:** The right to correct any inaccurate or outdated information in your user profile.
4. **Right to Erasure or Blocking:** The right to request suspension, withdrawal, or removal of your personal data, subject to legitimate public safety, legal defense, and government archival requirements.
5. **Right to Data Portability:** The right to obtain a copy of personal information in an accessible electronic format.
6. **Right to File a Complaint:** The right to seek redress with the National Privacy Commission (NPC) if you believe your privacy rights have been violated.

To exercise any of these rights, please contact the MDRRMO Data Protection Officer via the contact details provided in Section 12.

---

## 9. Device Permissions

To enable core features, the SendResQPls mobile app requests specific runtime permissions:

| Permission | Android Manifest Identifier | Purpose |
|---|---|---|
| **Camera** | `android.permission.CAMERA` | Capturing real-time photos of emergencies directly from the scene. |
| **Fine Location** | `android.permission.ACCESS_FINE_LOCATION` | Determining precise GPS coordinates for incident dispatch routing. |
| **Coarse Location** | `android.permission.ACCESS_COARSE_LOCATION` | Providing network-based location when satellite GPS is unavailable. |
| **Notifications** | `android.permission.POST_NOTIFICATIONS` | Delivering critical dispatch status updates and emergency broadcast advisories. |
| **Internet Access** | `android.permission.INTERNET` | Connecting to the backend API, streaming live status, and uploading report data. |

You may review or revoke these permissions at any time through your mobile device system settings (`Settings > Apps > SendResQPls > Permissions`). Note that disabling location or camera access will impair the ability to file reports with accurate GPS coordinates and photos.

---

## 10. Children's Privacy

SendResQPls is designed for general public emergency assistance and is not directed at children under the age of thirteen (13). We do not knowingly collect personal registration data from children under 13 without parental or legal guardian supervision. If a parent or guardian discovers that a child has submitted personal registration data without authorization, please notify us immediately for prompt deletion.

---

## 11. Amendments to This Policy

MDRRMO Balayan reserves the right to revise or update this Privacy Policy to reflect changes in municipal operational procedures, system capabilities, or legal requirements. Material updates will be communicated through the application interface or published with an updated "Effective Date" at the top of this document. Continued use of the application following the posting of revisions signifies your acceptance of the updated terms.

---

## 12. Contact and Data Protection Inquiries

For questions, feedback, clarifications, or requests regarding this Privacy Policy and your data rights under RA 10173, please reach out to:

**Municipal Disaster Risk Reduction and Management Office (MDRRMO Balayan)**  
Data Protection & Privacy Officer  
**Address:** Balayan Government Center, Plaza Rizal, Balayan, Batangas, 4213, Philippines  
**Official Email:** [mdrrmo.balayan@gmail.com](mailto:mdrrmo.balayan@gmail.com)  
**Emergency Hotline:** 911  
**MDRRMO Dispatch:** 0917-123-4567  

*Republic of the Philippines — Province of Batangas — Municipality of Balayan*
