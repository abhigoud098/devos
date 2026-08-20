# 🧠 DevOS

> **Developer Second Brain**

A modern developer productivity workspace for managing learning, revision, projects, notes, DSA, study sessions, and long-term engineering progress in one place.

<p align="center">
  <img src="./public/og.png" alt="DevOS Banner" width="100%">
</p>

<p align="center">
  <strong>Learn • Revise • Build • Track • Improve</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#environment-variables">Environment Variables</a> •
  <a href="#database--prisma">Database</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Vercel-Deployment-black?logo=vercel" alt="Vercel" />
</p>

---

## 📖 About

**DevOS** is a developer-focused productivity and learning platform designed to become a personal **Developer Second Brain**.

Instead of managing learning across multiple disconnected tools, DevOS brings the important parts of a software engineer's learning workflow into one application.

The goal is simple:

> **Learn something → track it → revise it → build with it → measure your progress.**

DevOS is designed around a clean, focused, developer-oriented experience inspired by modern products such as Linear, Notion, GitHub, Vercel, and Raycast.

Unlike the original offline-only architecture, DevOS now uses a **persistent backend and PostgreSQL database**, allowing user data to persist across sessions and devices when deployed with a hosted database.

---

# 🚧 Development Status

DevOS is currently under active development.

The application is transitioning from an offline-first prototype into a **full-stack production application**.

### Current foundation

* ✅ Next.js application
* ✅ React + TypeScript
* ✅ Responsive application UI
* ✅ Learning management
* ✅ Spaced repetition system
* ✅ Persistent backend
* ✅ Prisma ORM
* ✅ PostgreSQL database
* ✅ Authentication architecture
* ✅ API routes
* ✅ Persistent user data
* ✅ Production deployment architecture
* 🚧 Continuous UI/UX improvements
* 🚧 Additional productivity modules

Features and architecture may continue to evolve while DevOS is being developed.

---

# ✨ Features

## 🏠 Dashboard

The dashboard provides an overview of your current learning activity.

Includes areas such as:

* Today's focus
* Learning streak
* Study time
* Weekly progress
* Recent activity
* Revision summary
* Quick actions
* Learning statistics

---

## 📚 Learning Tracker

Track technologies and concepts you're currently learning.

Store information such as:

* Technology
* Topic
* Subtopic
* Confidence
* Difficulty
* Status
* Notes
* Resources
* Hours studied
* Last studied date

The learning system is designed to provide a structured view of your engineering knowledge.

---

## 🧠 Smart Revision

DevOS includes a spaced-repetition workflow for revisiting previously learned topics.

The current revision system supports scheduled review intervals such as:

* Day 1
* Day 2
* Day 5
* Day 7
* Day 10
* Day 15
* Day 21
* Day 30
* Day 60
* Day 90

Revision functionality includes:

* Today's revisions
* Overdue revisions
* Revision history
* Completion tracking
* Review counts
* Revision progress

---

## 💻 DSA Tracker

Track your Data Structures and Algorithms preparation.

Planned/active categories include:

* Arrays
* Strings
* Hash Maps
* Stacks
* Queues
* Linked Lists
* Trees
* Graphs
* Heaps
* Tries
* Dynamic Programming
* Greedy
* Sliding Window
* Backtracking

Track information such as:

* Solved problems
* Weak areas
* Confidence
* Notes
* Favorite problems
* Progress

---

## 🚀 Project Management

Manage personal and engineering projects from the same workspace.

Project information can include:

* Project description
* Repository
* Live demo
* Technology stack
* Progress
* Tasks
* Ideas
* Timeline

---

## 📝 Developer Notes

A dedicated space for storing technical knowledge.

Designed to support developer-oriented content such as:

* Markdown
* Code
* Checklists
* Links
* Technical explanations
* References

---

## 📖 Resources

Save useful engineering resources in one place.

Examples include:

* Documentation
* YouTube videos
* Courses
* Books
* GitHub repositories
* Articles
* Tutorials

---

## 📅 Planner

Organize your learning and development schedule.

Planned capabilities include:

* Daily tasks
* Weekly goals
* Monthly goals
* Study planning
* Learning calendar

---

## 📈 Analytics

Understand your learning behavior through data.

Analytics can include:

* Learning activity
* Study hours
* Weekly progress
* Monthly progress
* Technology progress
* Revision completion
* DSA progress
* Activity charts
* Learning trends

---

## ⏱ Study Timer

A focused study workflow for deep work.

Planned/active capabilities include:

* Focus sessions
* Pomodoro workflow
* Break sessions
* Session history
* Focus statistics

---

## 🔔 Notifications

Notification functionality can be used for important learning events such as:

* Revision reminders
* Study reminders
* Streak reminders
* Weekly reviews

Browser notification support depends on the application's current implementation and browser permissions.

---

# 🏗 Architecture

DevOS follows a modern full-stack architecture.

```text
┌──────────────────────────────────────────┐
│                  DevOS                   │
│                                          │
│       Next.js + React + TypeScript       │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│              Application UI              │
│                                          │
│ Dashboard │ Learning │ Revision │ DSA    │
│ Projects  │ Notes    │ Planner  │ etc.  │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│              Next.js API Routes          │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│                  Prisma                  │
│                ORM Layer                 │
│                                          │
├──────────────────────────────────────────┤
│                                          │
│               PostgreSQL                 │
│             Persistent Data              │
│                                          │
└──────────────────────────────────────────┘
```

### High-level data flow

```text
User
  ↓
DevOS UI
  ↓
Next.js
  ↓
API Routes
  ↓
Authentication
  ↓
Prisma
  ↓
PostgreSQL
```

This allows DevOS to maintain persistent application data instead of relying exclusively on browser-local storage.

---

# 🗄 Database & Prisma

DevOS uses **PostgreSQL** as its persistent database and **Prisma** as the ORM.

Prisma provides:

* Type-safe database queries
* Schema management
* Database migrations
* Generated database client
* Structured data access

The database contains persistent application data associated with users and their DevOS activity.

### Important

The application should use a hosted PostgreSQL database for production deployments.

For local development, PostgreSQL can either be:

* Hosted remotely
* Run locally

The database connection is configured through environment variables.

---

# 🛠 Tech Stack

| Technology      | Purpose                    |
| --------------- | -------------------------- |
| Next.js         | Full-stack React framework |
| React           | User interface             |
| TypeScript      | Type safety                |
| Tailwind CSS    | Styling                    |
| shadcn/ui       | UI components              |
| Zustand         | Client state management    |
| Prisma          | Database ORM               |
| PostgreSQL      | Persistent database        |
| React Hook Form | Form management            |
| Zod             | Validation                 |
| Recharts        | Data visualization         |
| Vercel          | Production deployment      |
| Git             | Version control            |
| GitHub          | Source control             |

---

# 📂 Project Structure

The exact structure may evolve as DevOS grows, but the application generally follows a structure similar to:

```text
devos/
│
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── learning/
│   ├── revision/
│   ├── projects/
│   ├── notes/
│   ├── resources/
│   ├── planner/
│   ├── analytics/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── learning/
│   └── ...
│
├── hooks/
│
├── lib/
│   ├── auth/
│   ├── prisma/
│   └── ...
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── store/
│
├── types/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

# 🚀 Getting Started

## Prerequisites

Before running DevOS locally, make sure you have:

* Node.js
* npm
* PostgreSQL database
* Git

Check Node.js:

```bash
node --version
```

Check npm:

```bash
npm --version
```

---

# 1. Clone the Repository

```bash
git clone https://github.com/yourusername/devos.git
```

Move into the project:

```bash
cd devos
```

---

# 2. Install Dependencies

```bash
npm install
```

---

# 3. Configure Environment Variables

Create a local environment file:

```text
.env.local
```

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

NODE_ENV="development"
```

> Never commit real credentials to GitHub.

For production, configure the environment variables through your hosting provider rather than committing them to the repository.

---

# 4. Configure Prisma

Generate the Prisma client:

```bash
npx prisma generate
```

If the project contains existing migrations, apply them using:

```bash
npx prisma migrate deploy
```

For local development when creating new migrations:

```bash
npx prisma migrate dev
```

Do **not** use `prisma migrate reset` unless you intentionally want to destroy the local database.

---

# 5. Start Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If port 3000 is already occupied, Next.js may automatically start on another port such as:

```text
http://localhost:3001
```

---

# 🧪 Development Commands

### Start development server

```bash
npm run dev
```

### Production build

```bash
npm run build
```

### Start production server

```bash
npm start
```

### Run linting

```bash
npm run lint
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Check migration status

```bash
npx prisma migrate status
```

### Create a development migration

```bash
npx prisma migrate dev
```

---

# 🔐 Environment Variables

DevOS uses environment variables for configuration and secrets.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

NODE_ENV="development"
```

Never commit:

```text
.env
.env.local
```

to source control.

Never expose:

* Database passwords
* API keys
* Authentication secrets
* Private tokens
* Production credentials

A safe repository should contain an example configuration such as:

```text
.env.example
```

without real secrets.

---

# ☁️ Deployment

DevOS is designed to be deployable as a modern Next.js application.

A typical production architecture is:

```text
GitHub
   │
   ▼
Vercel
   │
   ├── Next.js Application
   │
   └── API Routes
           │
           ▼
        Prisma
           │
           ▼
    Hosted PostgreSQL
```

## Vercel Deployment

1. Push the project to GitHub.
2. Import the repository into Vercel.
3. Configure production environment variables.
4. Set the production `DATABASE_URL`.
5. Deploy the application.
6. Run/verify Prisma migrations against the production database.
7. Verify authentication and API routes.
8. Verify database connectivity.

### Production Environment

The production environment should use a hosted PostgreSQL database.

Do not use:

```env
DATABASE_URL="postgresql://postgres:mongoose@localhost:5432/devos"
```

for Vercel production.

`localhost` refers to the machine running the application, not your personal computer.

---

# 🧬 Database Deployment

When deploying a new Prisma schema/migration to production:

```bash
npx prisma migrate deploy
```

This applies existing migrations without resetting the database.

Avoid destructive commands in production.

---

# 🔒 Security

DevOS follows a security-conscious architecture.

Important practices include:

* Environment-based secrets
* Server-side database access
* Prisma for database queries
* Authentication checks on protected resources
* Input validation
* No credentials committed to Git
* No direct database credentials in frontend code

Never expose `DATABASE_URL` to the client.

---

# 📱 Responsive Design

DevOS is designed to provide a consistent experience across:

* 📱 Mobile
* 📱 Tablet
* 💻 Laptop
* 🖥 Desktop
* 🖥 Large monitors

The interface adapts navigation, grids, forms, tables, dialogs, and content layouts according to screen size.

The primary design goal is to maintain usability without simply shrinking the desktop interface.

---

# 🎨 Design Philosophy

DevOS follows these principles:

### Minimal

Remove unnecessary visual noise.

### Premium

Use strong typography, spacing, hierarchy, and subtle interaction design.

### Developer-focused

The interface is designed around how software engineers actually learn and work.

### Fast

Avoid unnecessary complexity and expensive UI operations.

### Persistent

Important user data should survive browser refreshes, sessions, and application redeployments.

### Maintainable

Prefer reusable components and clear application architecture.

### Accessible

Keyboard navigation, readable contrast, focus states, and usable interactions are important parts of the design.

---

# 🗺 Roadmap

## Foundation

* [x] Next.js application
* [x] React + TypeScript
* [x] Learning management
* [x] Spaced repetition
* [x] API architecture
* [x] Prisma integration
* [x] PostgreSQL integration
* [x] Persistent data architecture
* [x] Authentication foundation

## Productivity

* [ ] Advanced DSA tracker
* [ ] Project management
* [ ] Developer notes
* [ ] Resource management
* [ ] Planner
* [ ] Study timer

## Intelligence & Analytics

* [ ] Advanced learning analytics
* [ ] Learning heatmap
* [ ] Knowledge retention insights
* [ ] Weak-topic detection
* [ ] Personalized revision recommendations

## Developer Experience

* [ ] Command palette
* [ ] Global search
* [ ] Keyboard shortcuts
* [ ] Import/export
* [ ] Backup system
* [ ] Advanced offline capabilities

---

# 🧪 Testing & Quality

Before creating a production deployment, verify:

```bash
npm run lint
npm run build
```

Then test:

* Authentication
* Database connection
* Learning CRUD
* Revision workflow
* Protected API routes
* Responsive layouts
* Forms
* Error states
* Loading states
* Production environment variables

---

# 🐛 Troubleshooting

## Prisma `ECONNREFUSED`

If you see:

```text
ECONNREFUSED
```

Prisma cannot reach the PostgreSQL server configured in `DATABASE_URL`.

Check:

1. The database is running.
2. `DATABASE_URL` is correct.
3. The database host is reachable.
4. The database port is correct.
5. Prisma has been generated.

Run:

```bash
npx prisma generate
```

Then verify the database connection.

---

## Port 3000 Already in Use

If Next.js reports:

```text
Port 3000 is in use
```

it will usually automatically try another port.

You can identify the process using port 3000 on Windows with:

```powershell
netstat -ano | findstr :3000
```

Then investigate the corresponding process before terminating it.

---

## Next.js `.next` Errors

If the generated `.next` directory becomes corrupted, stop the development server and remove only `.next`.

PowerShell:

```powershell
Remove-Item -Recurse -Force .next
```

Then restart:

```bash
npm run dev
```

Do not delete `prisma/`, source code, or application data to fix a `.next` problem.

---

# 🤝 Contributing

DevOS is primarily being developed as a personal developer productivity platform.

The project may evolve significantly as new ideas, workflows, and architecture are introduced.

Suggestions, issues, and improvements are welcome.

If contributing code:

1. Create a branch.
2. Make focused changes.
3. Keep existing functionality working.
4. Run linting.
5. Run a production build.
6. Test affected features.
7. Open a pull request with a clear description.

---

# 📄 License

This project is licensed under the MIT License.

See the `LICENSE` file for details.

---

# ⭐ Why DevOS?

Software engineers often spread their learning across multiple tools.

```text
Notes          → One application
DSA            → Another
Projects       → GitHub
Tasks          → Todo application
Resources      → Browser bookmarks
Revision       → Memory
Progress       → Nowhere
```

DevOS brings these workflows together.

```text
             ┌─────────────────────┐
             │        DevOS        │
             ├─────────────────────┤
             │ 🧠 Learning         │
             │ 🔄 Revision         │
             │ 💻 DSA              │
             │ 🚀 Projects         │
             │ 📝 Notes            │
             │ 📖 Resources        │
             │ 📅 Planner          │
             │ ⏱ Study Timer       │
             │ 📊 Analytics        │
             └─────────────────────┘
```

The long-term vision is to build a **personal operating system for software engineers**.

Not another generic productivity app.

A workspace specifically designed around the process of becoming a better developer.

---

## 🚀 Vision

DevOS is more than a learning tracker.

The long-term goal is to create a system that understands:

```text
What you're learning
        ↓
What you've forgotten
        ↓
What you should revise
        ↓
What you're building
        ↓
Where you're improving
        ↓
What you should learn next
```

A developer's learning journey is not a collection of isolated notes.

It is a continuously evolving system.

**DevOS is being built to manage that system.**

---

<p align="center">
  Built with ❤️ using Next.js, TypeScript, Prisma and PostgreSQL.
</p>

<p align="center">
  <strong>Learn. Build. Revise. Repeat. 🚀</strong>
</p>
