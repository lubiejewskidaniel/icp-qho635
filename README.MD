# PLMS – Property Lead Management System

## 📌 Project Overview

PLMS (Property Lead Management System) is a web-based application designed to capture, manage, track and convert property sales leads.

The goal of this system is to centralise client enquiries from multiple sources, assign leads to sales agents, track communication history, and monitor lead status from initial enquiry to successful sale.

This project is developed as part of the Industrial Consulting Project module at Solent Univeristy.

---

## 🎯 Purpose of the Application

The application aims to:

- Improve lead tracking and visibility
- Support structured sales pipeline management
- Enable role-based access for sales agents and managers
- Track activities such as calls, emails, meetings and follow-ups
- Provide basic reporting and performance overview

The system will follow an MVP-first approach and will be developed incrementally across multiple sprints.

---

## 👥 Project Team

This project is developed collaboratively by a team of 5 members:

- Daniel Lubiejewski
- Maria Vladimirova
- Giordano Zanolla
- Elena Michaela Vintilla
- Kacper Zaleski

The project is carried out as a fully remote collaboration.  
Team members work asynchronously and coordinate tasks using:

- Git & GitHub for version control
- Jira Software for task management
- WhatsApp for daily communication and updates
- Online meetings (e.g., Webex) for sprint alignment and reviews

The team follows a structured workflow with clearly defined feature ownership to ensure accountability, transparency and efficient delivery.

---

## 🛠 Technology Stack

### Frontend

- React.js
- Next.js

> TypeScript will not be used in this project, as not all team members are familiar with it. The project will be developed using JavaScript to ensure equal contribution and accessibility for all team members.

---

### Backend Services

- Firebase
  - Firebase Authentication
  - Firestore Database
  - Firebase Storage

---

### Email Service

- SMTP (SendGrid / Mailgun / Custom SMTP)

---

### Optional Integrations (Future Scope)

- WhatsApp
- SMS notifications

---

### Hosting & Deployment

- Vercel (Next.js frontend)
- Firebase (backend services)

---

## 🚀 Development Approach

The project is structured into three sprints:

1. Requirements & Planning
2. Proof of Concept
3. MVP Implementation

The team follows a feature-ownership model, where each member is responsible for specific functional areas of the system.

---

## 📂 Project Status

Currently in Sprint 1 – Requirements & Planning Phase.

---

## 📝 Commit Convention - IMPORTANT

This project follows the **Conventional Commits** standard to keep version control structured and professional.
We use the following prefixes in commit messages:

- **chore:** organisational changes, documentation updates, configuration changes  
  _(pdating README, project setup, config files)_

- **feat:** new feature implementation  
  _(adding login functionality, creating lead dashboard)_

- **fix:** bug fixes  
  _(fixing login validation issue, correcting status update logic)_

- **refactor:** code restructuring without changing functionality  
  _(improving folder structure, cleaning up duplicated logic)_

**To maintain high-quality version control, commit messages must:**
 - Be clear and descriptive
 - Explain what was changed and why
 - Use present tense (e.g., add login validation instead of added)
 - Avoid vague messages like:
  ❌ update
  ❌ fix stuff
  ❌ changes
 - Focus on one logical change per commit

Using this structure ensures:

- Clear and readable commit history
- Easier collaboration within the team
- Better tracking of project progress
- Cleaner pull requests and code reviews
- Alignment with industry standards

This approach reflects professional development practices used in real-world software projects.
