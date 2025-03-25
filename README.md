# Org Alumni Portal

A web portal where alumni can connect with each other and the organization.

## Features

- **Authentication**: Google, GitHub, and username/password authentication
- **Posts**: Create, edit, delete, comment on, and like posts
- **Events**: View and create events
- **Jobs**: View job openings, apply, and refer friends
- **Connects**: View all alumni and their contact information

## User Roles

- **Alumni**: Can access all features after verification
- **Admin**: Can manage users, verify pending alumni, and access all features

## Technology Stack

- **Frontend**: Angular 19 with Tailwind CSS
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Build Tool**: Nx Workspace

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd org-alumni
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update Firebase configuration:
   - Navigate to `apps/org-alumni/src/environments/environment.ts`
   - Replace the Firebase configuration with your own Firebase project details

### Development

Run the development server:

```bash
npx nx serve org-alumni
```

Navigate to `http://localhost:4200/` to access the application.

### Build

Build the application for production:

```bash
npx nx build org-alumni --prod
```

## Project Structure

- `apps/org-alumni/src/app/features`: Contains feature modules (auth, posts, events, jobs, connects, admin)
- `apps/org-alumni/src/app/core`: Core functionality and services
- `apps/org-alumni/src/app/shared`: Shared components, directives, and pipes
- `apps/org-alumni/src/app/layouts`: Layout components

## Authentication Flow

1. Users sign up using email/password, Google, or GitHub
2. New users provide their old employee ID for verification
3. Admin verifies the user's alumni status
4. Once verified, users can access all features

## License

This project is licensed under the MIT License - see the LICENSE file for details.
