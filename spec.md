# Smart Digital Club Management System

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Home page with hero section, navigation, and call-to-action
- User authentication (student registration/login, admin login) using role-based authorization
- Student dashboard: joined clubs, upcoming events, notifications
- Admin dashboard: manage clubs, students, approve/reject events
- Club management: list, details, join/leave, search/filter
- Event management: CRUD (admin), view upcoming/past, register for events
- Notifications: in-app notifications for event updates
- Profile page: user details and settings
- Contact page: form with name, email, message saved to backend
- Engagement stats with charts on dashboard
- Sample/seed data for clubs and events

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Select `authorization` component for role-based access (student / admin roles)
2. Generate Motoko backend with:
   - User profiles (name, email, role: student/admin, bio, joinedClubs)
   - Clubs (id, name, description, category, memberCount, events)
   - Events (id, title, description, clubId, date, location, registeredUsers, status: upcoming/past/pending)
   - Notifications (id, userId, message, read, timestamp)
   - Contact messages (id, name, email, message, timestamp)
   - CRUD for clubs and events (admin only)
   - Join/leave club, register for event
   - Approve/reject events (admin)
   - Notifications dispatch on join/event create
3. Frontend React app:
   - Pages: Home, Login, Register, Dashboard, Clubs, ClubDetail, Events, EventDetail, AdminPanel, Profile, Contact
   - Blue/white gradient theme, dashboard-style layout
   - Recharts for engagement stats
   - Search + filter on clubs and events pages
   - Responsive mobile + desktop
