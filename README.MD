# PLMS – Property Lead Management System

> A web-based CRM-style application for capturing, managing, tracking, and converting property sales leads.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Purpose of the Application](#purpose-of-the-application)
- [Test Accounts Login Details](#test-account-login-details)
- [Project Milestones](#project-milestones)
- [Project Team](#project-team)
- [Technology Stack](#technology-stack)
- [Main Features](#main-features)
- [Authentication and Authorisation](#authentication-and-authorisation)
- [User Roles](#user-roles)
- [Lead Capture](#lead-capture)
- [Lead Management](#lead-management)
- [Lead Status Pipeline](#lead-status-pipeline)
- [Lead Detail Page](#lead-detail-page)
- [Follow-Up and Activity Tracking](#follow-up-and-activity-tracking)
- [Email Communication](#email-communication)
- [Reporting and Analytics](#reporting-and-analytics)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Installation and Local Development](#installation-and-local-development)
- [Deployment](#deployment)
- [Testing](#testing)
- [Project Scope and Limitations](#project-scope-and-limitations)
- [Commit Convention](#commit-convention)
- [Final Project Status](#final-project-status)

---

## Project Overview

**PLMS (Property Lead Management System)** is a web-based CRM-style application designed to capture, manage, track, and convert property sales leads.

The system centralises client enquiries from multiple sources, allows managers to assign leads to sales agents, tracks communication history, and monitors each lead through the sales pipeline from initial enquiry to successful sale or loss.

This project was developed as part of the **Industrial Consulting Project** module at **Solent University**.

---

## Purpose of the Application

The purpose of PLMS is to support a property sales team by improving lead visibility, communication tracking, and sales pipeline management.

The application enables:

- Secure access for managers and sales agents
- Centralised lead capture and management
- Assignment of leads to agents
- Lead status tracking through a configurable pipeline
- Activity logging for calls, emails, meetings, and notes
- Follow-up scheduling and reminders
- SMTP-based email communication from lead profiles
- Basic reporting and performance overview for managers

The project follows an MVP-first approach and was developed incrementally across three sprints.

---

## Test Accounts Login Details

The following test accounts have been created to allow quick and easy access to the system during testing and evaluation.

Manager Account
Email: lubiejewskidaniel@gmail.com

Agent Account
Email: danielharlow204@gmail.com

Password
The same password is used for both accounts:
123456

These accounts were created specifically for demonstration, testing,
and assessment purposes to allow reviewers to access both manager
and agent functionality without additional setup.

## Project Milestones

The project was structured around three main sprint milestones.

### Sprint 1 – Requirements and Planning

Focus areas:

- Requirements overview
- Point-by-point statement of requirements
- Outline solution proposal
- Initial project plan
- Identification of issues to be resolved
- Supporting presentation

### Sprint 2 – Proof of Concept

Focus areas:

- Initial working Proof of Concept
- Initial design documentation
- Test planning
- Resolving early implementation issues
- Supporting presentation to the project tutor and sponsor

### Sprint 3 – Minimal Viable Product

Focus areas:

- Working minimal viable product
- Completed design documentation
- Test plan, evaluation, and results
- Evaluation of the final solution
- Supporting presentation to the project tutor and sponsor

The current version of the project represents the **Sprint 3 MVP delivery**.

---

## Project Team

This project was developed collaboratively by a team of five members:

| Name                    | Role            |
| ----------------------- | --------------- |
| Daniel Lubiejewski      | Project Manager |
| Maria Vladimirova       | Team Member     |
| Giordano Zanolla        | Team Member     |
| Elena Michaela Vintilla | Team Member     |
| Kacper Zaleski          | Team Member     |

The project was carried out as a remote collaboration. Team members coordinated tasks using:

- Git and GitHub for version control
- Jira Software for task management
- WhatsApp for daily communication and updates
- Online meetings for sprint alignment and reviews

The team followed a feature-ownership model to support accountability, transparency, and efficient delivery.

---

## Technology Stack

### Frontend

- React.js
- Next.js
- JavaScript
- CSS Modules

TypeScript was not used in this project to ensure that all team members could contribute equally using a shared JavaScript-based codebase.

### Backend Services

- Firebase Authentication
- Firestore Database
- Firebase Admin SDK for selected server-side operations

### Email Service

- SMTP email integration using Nodemailer
- Support for custom email messages and predefined email templates

### Hosting and Deployment

- Vercel for hosting the Next.js application
- Firebase for authentication and database services
- Environment variables for secure configuration

### Optional and Future Scope

The original brief included Firebase Storage-based file management as an optional feature. This was not implemented in the MVP because file management was not part of the core lead management workflow and Firebase Storage required additional billing configuration.

Future integrations may include:

- WhatsApp notifications
- SMS notifications
- API/webhook-based lead capture
- File upload and document management

---

## Main Features

The MVP implements the core functionality required for a property lead management workflow:

- Role-based dashboards for managers and sales agents
- Lead capture through manual entry, enquiry form, and CSV import
- Agent assignment workflow
- Lead status pipeline
- Activity tracking
- Follow-up management
- Email communication
- Manager reporting
- Firestore Security Rules
- Deployment-ready configuration

---

## Authentication and Authorisation

The application includes secure authentication using Firebase Authentication.

Implemented features:

- Email and password login
- Email verification
- Password reset by email
- Protected routes in Next.js
- Role-based access for managers and sales agents

---

## User Roles

### Manager / Admin

Managers can:

- View all leads
- Assign leads to agents
- Create and manage agent accounts
- Update lead details and statuses
- Manage lead statuses and lead sources
- View reporting and performance summaries
- Delete lead data when required for GDPR-related requests

### Sales Agent

Sales agents can:

- View only leads assigned to them
- Search and filter their assigned leads
- Update lead status
- Add notes and activity records
- Schedule follow-ups
- Send emails from the lead profile

---

## Lead Capture

Leads can be created through:

- Manual lead entry
- Public website enquiry form
- CSV import

The public enquiry form creates unassigned leads, allowing managers to review and assign them to the appropriate sales agent.

The CSV import feature supports bulk lead creation and helps avoid duplicate records based on email or phone number.

---

## Lead Management

Each lead contains contact details, property interest information, and metadata.

Lead information includes:

| Category          | Fields                                                                                         |
| ----------------- | ---------------------------------------------------------------------------------------------- |
| Contact Details   | Full name, email address, phone number, country, city                                          |
| Property Interest | Property type, property location, budget range, purpose, preferred contact method              |
| Lead Metadata     | Lead source, assigned agent, created date, last contact date, next follow-up date, lead status |

The lead dashboard supports:

- Search by name, email, or phone number
- Filtering by status
- Filtering by agent, source, or status for managers
- Sorting by recent activity
- Pagination for large lead lists

---

## Lead Status Pipeline

The system supports a configurable lead status pipeline.

Default statuses include:

1. New
2. Contacted
3. Qualified
4. Viewing Scheduled
5. Negotiation
6. Won
7. Lost

Managers can configure lead statuses through the application settings.

---

## Lead Detail Page

The lead detail page provides a full view of an individual lead.

Users can:

- View the full lead profile
- Update the lead status
- Add internal notes
- Log calls, emails, meetings, and other activities
- Schedule follow-ups
- Send emails directly to the lead
- View activity history with timestamps and user attribution

---

## Follow-Up and Activity Tracking

The application includes follow-up and activity tracking functionality.

Implemented features:

- Manual follow-up date field
- Follow-up reminders
- Activity log for calls, emails, meetings, and notes
- Activity timestamps
- User attribution for logged activities
- Manager visibility of recent activity

---

## Email Communication

The application includes SMTP-based email communication.

Implemented email features:

- Send custom emails from the lead profile
- Use predefined email templates
- Log sent emails in the activity history
- Update last contact date after email communication
- Send assignment notification emails to agents
- Send follow-up reminder emails
- Send selected status change notification emails

SMTP credentials are stored securely using environment variables and are not exposed on the frontend.

---

## Reporting and Analytics

Managers have access to basic reporting and performance overview features.

Implemented reporting features:

- Total leads
- Leads by status
- Conversion rate
- Won and lost lead overview
- Leads by agent
- Leads by source
- Follow-up health
- Lead age overview
- Recent activity overview

These reports provide a simple visual summary of the sales pipeline and agent workload.

---

## Security

The project includes Firestore Security Rules in [`firestore.rules`](./firestore.rules).

The rules enforce role-based access control:

- Managers can read and manage all leads
- Agents can only read leads assigned to them
- Agents cannot reassign lead ownership
- Users cannot modify their own roles
- Activity history cannot be edited
- Lead statuses and lead sources can only be managed by managers
- Managers can delete lead data when required for GDPR-related requests

The project also includes [`firebase.json`](./firebase.json), which links the Firebase project configuration to the local `firestore.rules` file.

Firebase Storage rules were not included because file management was treated as an optional feature and was not implemented in the MVP.

---

## Environment Variables

The project uses environment variables for Firebase and SMTP configuration.

Create a `.env.local` file for local development and configure the required values.

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=

CRON_SECRET=
```

Actual environment values should not be committed to the repository.

---

## Installation and Local Development

Install project dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the application in the browser:

```text
http://localhost:3000
```

Create a production build:

```bash
npm run build
```

---

## Deployment

The application is designed to be deployed using:

- Vercel for the Next.js frontend
- Firebase for Authentication and Firestore Database

Typical deployment flow:

1. Push the latest code to GitHub.
2. Connect the repository to Vercel.
3. Configure environment variables in Vercel.
4. Deploy the Next.js application.
5. Configure Firebase Authentication and Firestore Database.
6. Deploy Firestore Security Rules if required.

Firestore rules can be deployed with Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

Working website is available online:
https://icp-qho635-bx9l6zk4m-daniels-projects-536097e1.vercel.app/

Login details for agent and manager:
Manager Account
Email: lubiejewskidaniel@gmail.com

Agent Account
Email: danielharlow204@gmail.com

Password
The same password is used for both accounts:
123456

These accounts were created specifically for demonstration, testing,
and assessment purposes to allow reviewers to access both manager
and agent functionality without additional setup.

---

## Testing

The project includes testing for selected business logic and application behaviour.

Testing areas include:

- Lead filtering
- Lead status handling
- Role-based access behaviour
- Lead creation flow
- Email-related logic
- Manual user acceptance testing of the main lead management workflow

Run tests with:

```bash
npm test
```

Manual testing was also carried out for the main user journeys:

- Manager login
- Agent login
- Lead creation
- Lead assignment
- Lead status update
- Activity logging
- Follow-up scheduling
- Email sending
- Reporting dashboard review

---

## Project Scope and Limitations

The MVP focuses on the core requirements of the Property Lead Management System.

### Implemented Core Scope

- Authentication and role-based access
- Lead capture and management
- Agent assignment
- Status pipeline
- Activity tracking
- Follow-up management
- Email communication
- Manager reporting
- Firestore Security Rules
- Deployment-ready configuration

### Not Implemented in MVP

- Firebase Storage file management
- WhatsApp integration
- SMS integration
- API/webhook lead capture
- Advanced charts
- Advanced automated marketing workflows

These features were considered optional or future scope in the original project brief.

---

## Commit Convention

This project follows the Conventional Commits standard to maintain a clear and professional Git history.

Common commit prefixes:

| Prefix      | Usage                                             |
| ----------- | ------------------------------------------------- |
| `feat:`     | New feature implementation                        |
| `fix:`      | Bug fixes                                         |
| `refactor:` | Code restructuring without changing functionality |
| `chore:`    | Configuration or organisational changes           |
| `docs:`     | Documentation updates                             |
| `test:`     | Test-related changes                              |

Examples:

```bash
feat: add lead assignment functionality
fix: correct agent lead filtering
docs: update README for MVP delivery
chore: add Firebase security rules configuration
```

Commit messages should be clear, descriptive, and focused on one logical change.

---

## Final Project Status

The application is currently at the **MVP delivery stage**.

The core requirements of the Property Lead Management System have been implemented, including:

- Lead capture
- Role-based dashboards
- Assignment workflow
- Activity tracking
- Follow-up management
- Email communication
- Reporting
- Firebase Security Rules

Optional features such as Firebase Storage file management, WhatsApp, SMS, and webhook integrations remain future scope.
