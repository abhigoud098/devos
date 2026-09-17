# 🧠 DevOS — Developer Second Brain

<p align="center">
  <strong>Your personal, offline-first developer productivity and learning workspace.</strong><br />
  Learn • Build • Revise • Solve DSA • Track • Optimize with AI
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18.3.1-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.5.4-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7.9.1-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-PgPool-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Dexie.js-IndexedDB-orange?style=for-the-badge" alt="Dexie" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI_Copilot-8E75C2?style=for-the-badge&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Resend-Email_Engine-000000?style=for-the-badge" alt="Resend" />
</p>

---

## 📌 Table of Contents

- [About DevOS](#-about-devos)
- [Key Highlights](#-key-highlights)
- [Feature Modules](#-feature-modules)
  - [1. 🏠 Command Center (Dashboard)](#1--command-center-dashboard)
  - [2. 🤖 Context-Aware AI Copilot (`/ai`)](#2--context-aware-ai-copilot-ai)
  - [3. 📚 Structured Learning Tracker (`/learning`)](#3--structured-learning-tracker-learning)
  - [4. 🧠 Smart Spaced Repetition (`/revision`)](#4--smart-spaced-repetition-revision)
  - [5. 💻 DSA Problem Vault (`/dsa`)](#5--dsa-problem-vault-dsa)
  - [6. 🚀 Project Showcase & Management (`/projects`)](#6--project-showcase--management-projects)
  - [7. 📝 Technical Developer Notes (`/notes`)](#7--technical-developer-notes-notes)
  - [8. 📖 Curated Resource Library (`/resources`)](#8--curated-resource-library-resources)
  - [9. 📅 Study Planner & Calendar (`/planner`)](#9--study-planner--calendar-planner)
  - [10. ⏱ Focus & Pomodoro Timer (`/timer`)](#10--focus--pomodoro-timer-timer)
  - [11. 📈 In-Depth Analytics (`/analytics`)](#11--in-depth-analytics-analytics)
  - [12. 🔔 Email Notifications & Cron Reminders (`/settings`)](#12--email-notifications--cron-reminders-settings)
- [System Architecture](#-system-architecture)
- [Data Flow & Offline Synchronization](#-data-flow--offline-synchronization)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Database Schema & Models](#-database-schema--models)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Database Setup & Seeding](#-database-setup--seeding)
- [Windows & OneDrive Compatibility](#-windows--onedrive-compatibility)
- [Production Build & Deployment](#-production-build--deployment)
- [Security & Best Practices](#-security--best-practices)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 About DevOS

Software engineers constantly juggle disparate tools to manage their careers and skill growth:
- **Notes** in Notion or Obsidian
- **DSA practice** in LeetCode or spreadsheets
- **Projects** across GitHub repositories
- **Tasks** in Todoist or Trello
- **Bookmarks** scattered in browsers
- **Revision intervals** lost to memory
- **Study time** in standalone Pomodoro timers

**DevOS** replaces this fragmented setup with a unified, offline-first developer operating system. It synchronizes your learning, revisions, algorithm prep, code projects, and technical knowledge into a cohesive second brain that helps you answer:
> *"What should I learn next, what am I in danger of forgetting, and what should I build today?"*

---

## ✨ Key Highlights

- ⚡ **Offline-First with Seamless Cloud Sync**: Powered by **Dexie.js (IndexedDB)** for instantaneous local performance, paired with a two-way synchronization engine to **PostgreSQL via Prisma ORM**.
- 🤖 **Context-Aware AI Assistant**: A developer AI copilot built on Google Gemini with local intelligent fallbacks. Automatically pulls your current study schedule, overdue revisions, and DSA struggles into context.
- 🔁 **SuperMemo-Inspired Spaced Repetition**: Automatic revision scheduling at scientifically proven intervals (1, 2, 5, 7, 10, 15, 21, 30, 60, 90 days).
- 📧 **Automated Email Reminders**: Send daily revision digests and study alerts via **Resend** or SMTP (**Nodemailer**), powered by automated Vercel Cron jobs.
- 🎨 **Modern Dark Aesthetic**: Clean, distraction-free UI built with **Tailwind CSS**, **Framer Motion**, and accessible **Radix UI** primitives.
- 🛡 **Robust Authentication**: Token and cookie-based server authentication with password reset tokens and bcrypt-compatible password verification.

---

## 🧰 Feature Modules

### 1. 🏠 Command Center (Dashboard)
- **Today's Focus & Daily Target**: Aggregates today's scheduled topics, overdue revisions, and pending planner tasks.
- **Active Study Streak**: Gamified consistency tracker measuring daily engineering activity.
- **Quick Action Bar**: Instantly log study sessions, record DSA problems, or launch the focus timer.
- **Weekly Progress & Activity Graph**: Visual heatmaps and bar charts tracking focused hours.

### 2. 🤖 Context-Aware AI Copilot (`/ai`)
- **Intent-Driven Reasoning**: Distinguishes between study planning (`TODAY_STUDY`), revision queries (`REVISION_DUE`), problem-solving (`DSA_PROBLEM`), and general technical queries.
- **Student Context Injection**: The backend dynamically queries your active database records to feed your real learning state into the AI prompt.
- **Rate-Limiting & Protection**: Built-in 20 request/minute user rate limiting with graceful recovery.
- **Dual Engine**: Direct integration with Google Gemini Flash models with offline structured guidance fallback.

### 3. 📚 Structured Learning Tracker (`/learning`)
- Categorize knowledge by **Technology**, **Topic**, and **Subtopic** (e.g., *React → Hooks → useEffect*).
- Track **Confidence Score** (1–10), **Difficulty Level** (Easy, Medium, Hard), and **Hours Studied**.
- Attach interview questions, markdown notes, and reference links directly to topics.
- Schedule specific review dates and toggle automated spaced repetition.

### 4. 🧠 Smart Spaced Repetition (`/revision`)
- Automatic scheduling across proven retention intervals:
  $$\text{Day 1} \rightarrow \text{Day 2} \rightarrow \text{Day 5} \rightarrow \text{Day 7} \rightarrow \text{Day 10} \rightarrow \text{Day 15} \rightarrow \text{Day 21} \rightarrow \text{Day 30} \rightarrow \text{Day 60} \rightarrow \text{Day 90}$$
- **Today's Due Reviews**: Never miss a review session.
- **Completion Tracking**: Record review notes and log confidence improvements over time.
- **Daily Revision Digest**: One-click email button to receive your day's revision checklist.

### 5. 💻 DSA Problem Vault (`/dsa`)
- Catalog coding problems categorized by pattern (Two Pointers, Sliding Window, DFS/BFS, Dynamic Programming, Graphs, Heaps, Backtracking, etc.).
- Document your **Struggle Points** and **Key Takeaways / Algorithmic Insights**.
- Set independent revision intervals for challenging problems to ensure mastery before interviews.

### 6. 🚀 Project Showcase & Management (`/projects`)
- Track personal and production projects from `Idea` $\rightarrow$ `Building` $\rightarrow$ `Completed`.
- Store GitHub repository URLs, live deployment demos, and technology tags.
- Attach project thumbnails, architecture notes, and task checklists.

### 7. 📝 Technical Developer Notes (`/notes`)
- Rich Markdown note editor for architecture decisions, snippets, and quick tips.
- Categorization by tags (*General, Frontend, Backend, Architecture, DevOps*).
- Image and diagram attachment support.

### 8. 📖 Curated Resource Library (`/resources`)
- Centralized bookmarking for documentation, articles, YouTube tutorials, GitHub repos, and courses.
- Filter by media type and associate resources directly with learning topics.

### 9. 📅 Study Planner & Calendar (`/planner`)
- Daily task planning with estimated hour allocations.
- Calendar view displaying past achievements and upcoming study obligations.
- One-click task completion syncing to analytics.

### 10. ⏱ Focus & Pomodoro Timer (`/timer`)
- Customizable Pomodoro intervals: Focus (default 25 min), Short Break (5 min), Long Break (15 min).
- Audio chimes and browser notification triggers on interval completion.
- Completed sessions automatically log to database history and analytics.

### 11. 📈 In-Depth Analytics (`/analytics`)
- Visualized metrics using **Recharts**:
  - Total Study Hours & Daily Distributions
  - Subject / Technology Breakdown
  - Spaced Repetition Retention Rate
  - DSA Pattern Mastery Progress

### 12. 🔔 Email Notifications & Cron Reminders (`/settings`)
- Configure automated email reminders before scheduled study sessions.
- Trigger automated cron processing via `/api/cron/study-reminders`.
- Supports dual transport: **Resend API** for high deliverability or custom **SMTP**.

---

## 🏗 System Architecture

```mermaid
flowchart TD
    subgraph Client [Client / Browser Layer]
        UI[Next.js App Router UI]
        DexieDB[(IndexedDB / Dexie.js)]
        State[Zustand & React Context]
        ClientAPI[Typed API Client]
    end

    subgraph Server [Next.js Server Layer]
        AppRoutes[App Router API Endpoints]
        AuthEngine[Auth & Session Engine]
        AIService[AI Intent & Context Engine]
        EmailService[Resend & Nodemailer Engine]
        SyncEngine[Two-Way Sync Controller]
    end

    subgraph Database [Persistence Layer]
        PrismaORM[Prisma ORM Client]
        PgPool[PostgreSQL Connection Pool]
        Postgres[(PostgreSQL Database)]
    end

    subgraph External [External Services]
        Gemini[Google Gemini API]
        ResendAPI[Resend Email API]
        SMTP[Custom SMTP Server]
    end

    UI <--> DexieDB
    UI <--> State
    State <--> ClientAPI
    ClientAPI <--> AppRoutes

    AppRoutes --> AuthEngine
    AppRoutes --> SyncEngine
    AppRoutes --> AIService
    AppRoutes --> EmailService

    AIService --> Gemini
    EmailService --> ResendAPI
    EmailService --> SMTP

    SyncEngine --> PrismaORM
    AppRoutes --> PrismaORM
    PrismaORM --> PgPool
    PgPool --> Postgres
=======
<div align="center">

# 🧠 DevOS

### Developer Second Brain

<p>
  <strong>A developer-focused operating system for learning, building, revising, and growing.</strong>
</p>

<p>
  DevOS brings your learning, projects, DSA, notes, revisions, planning, analytics, and AI assistance into one connected workspace.
</p>

<br />

<img src="https://img.shields.io/badge/Status-Active%20Development-22c55e?style=for-the-badge" />
<img src="https://img.shields.io/badge/Architecture-Offline%20First-8b5cf6?style=for-the-badge" />
<img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />

<br /><br />

<img src="https://skillicons.dev/icons?i=nextjs,react,typescript,tailwind,postgres,prisma,git,github" />

<br /><br />

<a href="#-features">Features</a>
 •  <a href="#-architecture">Architecture</a>
 •  <a href="#-tech-stack">Tech Stack</a>
 •  <a href="#-getting-started">Getting Started</a>
 •  <a href="#-roadmap">Roadmap</a>

</div>

---

# 🚀 What is DevOS?

> **DevOS is a Developer Second Brain.**

Software developers learn continuously.

But their journey is usually scattered across different applications.

```text
📚 Learning        → Documentation / Courses
🧠 Revision        → Memory
💻 DSA             → Coding Platforms
🚀 Projects        → GitHub
📝 Notes           → Notion / Obsidian
🔗 Resources       → Browser Bookmarks
📅 Planning        → Todo Applications
⏱ Focus           → Pomodoro Apps
📊 Progress        → Spreadsheets
```

DevOS brings these workflows into one connected system.

```text
                         ┌───────────────────┐
                         │       DevOS       │
                         │ Developer Brain   │
                         └─────────┬─────────┘
                                   │
        ┌──────────────┬───────────┼───────────┬──────────────┐
        │              │           │           │              │
        ▼              ▼           ▼           ▼              ▼

    Learning       Revision       DSA       Projects        Notes

        │              │           │           │              │
        └──────────────┴───────────┼───────────┴──────────────┘
                                   │
                                   ▼

                              Resources

                                   │
                                   ▼

                               Planner

                                   │
                                   ▼

                                Timer

                                   │
                                   ▼

                               Analytics
```

The goal is simple:

# 🤔 What should I focus on today?

DevOS is designed to help answer that question.

---

# ✨ Why DevOS?

DevOS is not just a task manager.

It is designed around the **developer growth cycle**.

```mermaid
flowchart LR

    A[📚 Learn]
        --> B[💻 Practice]

    B --> C[🚀 Build]

    C --> D[📝 Record]

    D --> E[🧠 Revise]

    E --> F[📊 Analyze]

    F --> G[🎯 Improve]

    G --> A
```

Every module contributes to this loop.

---

# 🔥 Highlights

<table>
<tr>
<td width="50%">

## ⚡ Offline First

Instant local data access using:

* Dexie.js
* IndexedDB
* Local-first workflows

</td>

<td width="50%">

## ☁️ Cloud Persistence

Two-way synchronization with:

* Next.js API
* Prisma ORM
* PostgreSQL

</td>
</tr>

<tr>
<td width="50%">

## 🤖 AI Copilot

Context-aware assistance powered by:

* Google Gemini
* Learning context
* Revision data
* DSA progress

</td>

<td width="50%">

## 🧠 Smart Revision

Spaced repetition system for:

* Better retention
* Revision scheduling
* Learning consistency

</td>
</tr>

</table>

---

# ✨ Features

## 🏠 Command Center

Your developer dashboard.

A single place to understand your current progress.

```text
🔥 Learning Streak

📚 Topics In Progress

🧠 Revisions Due

⏱ Study Time

🎯 Today's Focus

💻 DSA Progress

🚀 Active Projects

📊 Weekly Activity
```

Instead of opening multiple applications:

> Open DevOS and see what needs your attention.

---

# 🤖 AI Copilot

DevOS includes a context-aware developer assistant.

The AI can understand your current DevOS activity.

```text
Your Learning Data
        │
        ▼
Your Revision Status
        │
        ▼
Your DSA Progress
        │
        ▼
      AI Context
        │
        ▼
🤖 Personalized Assistance
```

### AI Capabilities

* 📚 Study planning
* 🧠 Revision guidance
* 💻 DSA assistance
* 🎯 Learning recommendations
* 💡 Technical explanations

The AI is designed to provide more useful assistance by understanding your current developer journey.

---

# 📚 Learning Tracker

Track your technical knowledge in a structured way.

```text
Technology
    │
    ▼
Topic
    │
    ▼
Subtopic
```

### Example

```text
React
 │
 └── Hooks
       │
       └── useEffect
```

Each topic can track:

| Property   | Example   |
| ---------- | --------- |
| Technology | React     |
| Topic      | Hooks     |
| Subtopic   | useEffect |
| Difficulty | Medium    |
| Confidence | 7/10      |
| Status     | Learning  |
| Study Time | 4.5 Hours |

---

# 🧠 Smart Revision

Learning something once is easy.

Remembering it is harder.

DevOS uses a spaced revision workflow.

```mermaid
flowchart TD

    A[📚 Learn Topic]

    A --> B[Generate Revision Schedule]

    B --> C[📅 Revision Due]

    C --> D{Completed?}

    D -- Yes --> E[Schedule Next Revision]

    D -- No --> F[Mark Overdue]

    F --> C

    E --> G[🧠 Improve Retention]
```

### Revision Intervals

```text
Learn
  │
  ▼
Day 1
  │
  ▼
Day 2
  │
  ▼
Day 5
  │
  ▼
Day 7
  │
  ▼
Day 10
  │
  ▼
Day 15
  │
  ▼
Day 21
  │
  ▼
Day 30
  │
  ▼
Day 60
  │
  ▼
Day 90
>>>>>>> 22a052a57760471e1c72544774ed584b7fd453b3
```

---

<<<<<<< HEAD
## 🔄 Data Flow & Offline Synchronization

DevOS uses an **offline-first local database** with **background cloud sync**:

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant LocalDB as Local IndexedDB (Dexie)
    participant Sync as Sync Worker
    participant Server as Next.js API (/api/sync)
    participant CloudDB as PostgreSQL (Prisma)

    User->>LocalDB: Create / Update Record (e.g. Study Topic)
    LocalDB-->>User: Instant UI Update (0ms latency)
    
    rect rgb(20, 25, 35)
        Note over LocalDB,Server: When Internet Connection is Active
        Sync->>LocalDB: Read Pending Local Changes
        Sync->>Server: POST /api/sync with Payload & Auth Token
        Server->>CloudDB: Upsert Records via Prisma Transaction
        CloudDB-->>Server: Cloud Records & Confirmation
        Server-->>Sync: Return Synced State & Remote Updates
        Sync->>LocalDB: Reconcile Local Cache
    end
=======
# 💻 DSA Problem Vault

A dedicated workspace for Data Structures and Algorithms.

```text
DSA
│
├── Arrays
├── Strings
├── Hash Maps
├── Stacks
├── Queues
├── Linked Lists
├── Trees
├── Graphs
├── Dynamic Programming
├── Greedy
├── Sliding Window
└── Backtracking
```

Track:

```text
✓ Problems Solved

✓ Difficulty

✓ Patterns

✓ Struggle Points

✓ Key Takeaways

✓ Revision Schedule

✓ Confidence
```

---

# 🚀 Project Workspace

Track the projects you build.

```text
Project
│
├── 📄 Description
├── 💻 GitHub Repository
├── 🌐 Live Demo
├── 🛠 Tech Stack
├── 📋 Tasks
├── 💡 Ideas
└── 📊 Progress
```

Project progress:

```text
💡 Idea
   ↓
🏗 Building
   ↓
🧪 Testing
   ↓
🚀 Completed
```

---

# 📝 Developer Notes

Build your personal technical knowledge base.

```text
Notes
│
├── 💻 Code Snippets
├── 🧠 Technical Concepts
├── 🏗 Architecture
├── 📝 Quick Notes
├── 🔗 References
└── 💡 Ideas
```

> Learn something once. Store it properly. Find it when needed.

---

# 📖 Resource Library

Keep useful resources organized.

```text
📚 Documentation

🎥 YouTube

🎓 Courses

📕 Books

🐙 GitHub Repositories

📰 Articles

🛠 Tutorials
```

---

# 📅 Study Planner

Convert goals into action.

```mermaid
flowchart LR

    A[🎯 Goal]

    A --> B[📅 Plan]

    B --> C[⏰ Schedule]

    C --> D[📚 Study]

    D --> E[✅ Complete]

    E --> F[📊 Measure]
```

Features:

* Daily planning
* Study tasks
* Calendar view
* Estimated study time
* Completion tracking

---

# ⏱ Focus Timer

A built-in Pomodoro workspace.

```text
Start
  │
  ▼
🎯 Focus
  │
  ▼
☕ Short Break
  │
  ▼
🎯 Focus
  │
  ▼
🧠 Long Break
  │
  ▼
📊 Session Complete
```

### Default Intervals

| Mode          | Duration   |
| ------------- | ---------- |
| 🎯 Focus      | 25 Minutes |
| ☕ Short Break | 5 Minutes  |
| 🧠 Long Break | 15 Minutes |

---

# 📈 Analytics

Turn your activity into insights.

Track:

```text
📚 Learning Progress

⏱ Study Hours

🧠 Revision Completion

💻 DSA Progress

📅 Weekly Activity

📈 Learning Trends
```

Analytics should answer:

> What am I improving?

> Where am I weak?

> What am I ignoring?

> What should I focus on next?

---

# 🔔 Smart Notifications

DevOS can help you stay consistent.

Notification capabilities include:

```text
🧠 Revision Reminders

📚 Study Reminders

📅 Scheduled Tasks

📧 Daily Revision Digest
```

Email delivery supports:

* Resend
* SMTP
* Nodemailer

Automated reminders can be triggered through scheduled cron jobs.

---

# 🏗 Architecture

DevOS uses a **hybrid local-first architecture**.

```mermaid
flowchart TD

    USER[👨‍💻 Developer]

    subgraph CLIENT["🖥 Browser"]
        UI[Next.js UI]
        STATE[React Context / State]
        LOCAL[Dexie.js]
        IDB[(IndexedDB)]
    end

    subgraph SERVER["⚡ Next.js Server"]
        API[API Routes]
        AUTH[Authentication]
        SYNC[Sync Engine]
        AI[AI Engine]
        EMAIL[Email Service]
    end

    subgraph DATABASE["🗄 Persistence"]
        PRISMA[Prisma ORM]
        POSTGRES[(PostgreSQL)]
    end

    subgraph SERVICES["🌐 External Services"]
        GEMINI[Google Gemini]
        RESEND[Resend]
        SMTP[SMTP]
    end

    USER --> UI

    UI --> STATE

    UI <--> LOCAL

    LOCAL <--> IDB

    STATE <--> API

    API --> AUTH
    API --> SYNC
    API --> AI
    API --> EMAIL

    SYNC --> PRISMA
    API --> PRISMA

    PRISMA --> POSTGRES

    AI --> GEMINI

    EMAIL --> RESEND
    EMAIL --> SMTP
```

---

# ⚡ Local-First + Cloud Sync

DevOS is designed to feel fast.

Data is first available locally.

```text
User Action
    │
    ▼
React UI
    │
    ▼
Dexie.js
    │
    ▼
IndexedDB
    │
    ▼
Instant UI Update ⚡
```

When synchronization is available:

```text
IndexedDB
    │
    ▼
Sync Engine
    │
    ▼
Next.js API
    │
    ▼
Prisma
    │
    ▼
PostgreSQL ☁️
```

This architecture combines:

```text
⚡ Local Speed

+

💾 Offline Persistence

+

☁️ Cloud Synchronization
```

---

# 🔄 Data Flow

```mermaid
sequenceDiagram

    participant U as User
    participant UI as Next.js UI
    participant Local as IndexedDB
    participant API as API
    participant DB as PostgreSQL

    U->>UI: Create / Update Data

    UI->>Local: Save Locally

    Local-->>UI: Instant Update

    UI->>API: Sync Request

    API->>DB: Save Data

    DB-->>API: Success

    API-->>UI: Sync Complete
>>>>>>> 22a052a57760471e1c72544774ed584b7fd453b3
```

---

<<<<<<< HEAD
## 🧰 Technology Stack

| Domain | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router) | `14.2.5` | Full-stack React framework with SSR and Route Handlers |
| **UI Library** | React / React DOM | `18.3.1` | Declarative component hierarchy |
| **Language** | TypeScript | `5.5.4` | Strict static typing and interface definitions |
| **Styling** | Tailwind CSS | `3.4.7` | Utility-first CSS design system |
| **Animations** | Framer Motion | `11.3.19` | Smooth layout and interactive micro-animations |
| **Primitives** | Radix UI | Latest | Accessible dialogs, tooltips, tabs, and selects |
| **ORM** | Prisma | `7.9.1` | Next-generation type-safe database toolkit |
| **Database Pool** | `@prisma/adapter-pg` / `pg` | `7.9.1` / `8.23.0` | High-performance pooled PostgreSQL client |
| **Local Database** | Dexie.js | `4.0.8` | Offline IndexedDB storage wrapper |
| **AI Integration** | Google Gemini API | `1.5 / 2.0 Flash` | Contextual learning recommendations & chat |
| **Email Service** | Resend / Nodemailer | `^6.25.0` / `^9.1.0` | Transactional email & scheduled revision alerts |
| **Charts** | Recharts | `2.12.7` | SVG-based responsive data visualization |
| **Icons** | Lucide React | `0.417.0` | Comprehensive icon suite |

---

## 📂 Project Directory Structure

```text
devos/
├── app/                               # Next.js App Router (Pages & API)
│   ├── (auth)/                        # Auth routes
│   │   ├── login/page.tsx             # Login interface
│   │   ├── signup/page.tsx            # Signup interface
│   │   ├── forgot-password/page.tsx   # Password reset request
│   │   └── reset-password/page.tsx    # Password reset submission
│   ├── ai/page.tsx                    # DevOS AI Copilot chat workspace
│   ├── analytics/page.tsx             # Study analytics & retention charts
│   ├── dsa/page.tsx                   # DSA problem vault & pattern tracker
│   ├── learning/page.tsx              # Technology & topic management
│   ├── notes/page.tsx                 # Technical markdown notes
│   ├── notifications/page.tsx         # Notification feeds
│   ├── planner/page.tsx               # Daily & monthly study planner
│   ├── profile/page.tsx               # User profile & academic preferences
│   ├── projects/page.tsx              # Project showcase & tracking
│   ├── resources/page.tsx             # Resource & bookmark vault
│   ├── revision/page.tsx              # Spaced repetition review engine
│   ├── settings/page.tsx              # Email reminders, theme, security
│   ├── timer/page.tsx                 # Pomodoro focus session timer
│   ├── page.tsx                       # Central Command Center Dashboard
│   ├── layout.tsx                     # Global layout wrapper & fonts
│   └── api/                           # Backend Server Route Handlers
│       ├── ai/chat/route.ts           # Context-aware AI chat handler
│       ├── auth/                      # Login, signup, me, profile, password
│       ├── cron/study-reminders/      # Automated reminder cron endpoint
│       ├── dsa/                       # CRUD for DSA problems
│       ├── learning/                  # CRUD for topics & email-today
│       ├── notes/                     # CRUD for notes
│       ├── planner/                   # CRUD for tasks
│       ├── preferences/               # User preference & theme API
│       ├── projects/                  # CRUD for projects
│       ├── resources/                 # CRUD for resources
│       ├── revision/goals/            # Daily/weekly revision targets
│       ├── settings/email/            # Email configuration endpoint
│       ├── sync/route.ts              # Dexie-to-PostgreSQL sync handler
│       └── timer/                     # Focus sessions & timer settings
├── components/                        # Modular UI Component Library
│   ├── auth/                          # Auth layouts & PasswordInput toggle
│   ├── ui/                            # Buttons, Dialogs, Cards, Inputs
│   └── ...                            # Feature-specific components
├── context/                           # React Context Providers (AuthContext)
├── lib/                               # Core Utilities & Services
│   ├── ai-service.ts                  # Gemini AI client & intent analysis
│   ├── api-client.ts                  # Typed unified HTTP request wrapper
│   ├── auth-server.ts                 # Server session verification
│   ├── auth-storage.ts                # Client session storage helpers
│   ├── db.ts                          # Dexie.js IndexedDB schema
│   ├── email-service.ts               # Resend & Nodemailer dual transport
│   └── prisma.ts                      # Prisma client with pooled pg adapter
├── prisma/
│   ├── schema.prisma                  # Full relational database schema
│   └── seed.ts                        # Sample demo seed data
├── scripts/
│   └── patch-next.js                  # Windows OneDrive build compatibility patch
├── public/                            # Static assets and icons
├── package.json                       # Dependencies and build scripts
├── prisma.config.ts                   # Prisma 7 configuration file
├── tailwind.config.ts                 # Design tokens & color palette
├── tsconfig.json                      # Strict TypeScript compiler config
└── vercel.json                        # Vercel Cron deployment config
=======
# 🧰 Tech Stack

<div align="center">

### Core

<img src="https://skillicons.dev/icons?i=nextjs,react,typescript"/>

<br/><br/>

### Styling

<img src="https://skillicons.dev/icons?i=tailwind"/>

<br/><br/>

### Database

<img src="https://skillicons.dev/icons?i=postgres,prisma"/>

<br/><br/>

### Tools

<img src="https://skillicons.dev/icons?i=git,github,vscode"/>

</div>

<br />

| Category        | Technology          |
| --------------- | ------------------- |
| Framework       | Next.js 14          |
| UI              | React 18            |
| Language        | TypeScript          |
| Styling         | Tailwind CSS        |
| Animation       | Framer Motion       |
| UI Components   | Radix UI            |
| Local Database  | Dexie.js            |
| Browser Storage | IndexedDB           |
| Cloud Database  | PostgreSQL          |
| ORM             | Prisma              |
| AI              | Google Gemini       |
| Email           | Resend / Nodemailer |
| Charts          | Recharts            |
| Icons           | Lucide React        |

---

# 📂 Project Structure

```text
devos/
│
├── app/
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   │
│   ├── ai/
│   ├── analytics/
│   ├── dsa/
│   ├── learning/
│   ├── notes/
│   ├── planner/
│   ├── projects/
│   ├── resources/
│   ├── revision/
│   ├── settings/
│   ├── timer/
│   │
│   └── api/
│
├── components/
│   ├── auth/
│   ├── ui/
│   └── features/
│
├── context/
│
├── lib/
│   ├── ai-service.ts
│   ├── api-client.ts
│   ├── auth-server.ts
│   ├── db.ts
│   ├── email-service.ts
│   └── prisma.ts
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── scripts/
│
├── public/
│
├── package.json
├── prisma.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
>>>>>>> 22a052a57760471e1c72544774ed584b7fd453b3
```

---

<<<<<<< HEAD
## 🗄 Database Schema & Models

The PostgreSQL database is managed through [prisma/schema.prisma](file:///c:/Users/gouda/OneDrive/Desktop/devos/prisma/schema.prisma):

| Model | Table Name | Purpose | Key Relationships |
| :--- | :--- | :--- | :--- |
| `User` | `users` | User identity & authentication | One-to-many with all domain models |
| `LearningTopic` | `learning_topics` | Technologies, topics & confidence ratings | Belongs to `User`, has many `RevisionEntry` |
| `RevisionEntry` | `revision_entries` | Spaced repetition schedule logs | Belongs to `LearningTopic` |
| `DSAProblem` | `dsa_problems` | Data structures & algorithm problem tracker | Belongs to `User` |
| `Project` | `projects` | Portfolio & development projects | Belongs to `User` |
| `Note` | `notes` | Markdown developer notes & cheatsheets | Belongs to `User` |
| `ResourceItem` | `resource_items` | External developer documentation & bookmarks | Belongs to `User` |
| `PlannerTask` | `planner_tasks` | Daily study checklist items | Belongs to `User` |
| `StudySession` | `study_sessions` | Focus timer logs & Pomodoro intervals | Belongs to `User` |
| `UserPreference` | `user_preferences` | Theme, email notifications & AI preferences | Belongs to `User` (1-to-1) |
| `RevisionGoal` | `revision_goals` | Daily and weekly revision target numbers | Belongs to `User` (1-to-1) |
| `PasswordResetToken` | `password_reset_tokens` | Secure token hashes for account recovery | Belongs to `User` |

---

## 🌱 Environment Variables

Create a `.env.local` file in the project root based on `.env.example`:

```bash
# ==============================================================================
# Database Configuration (PostgreSQL / Supabase / Neon)
# ==============================================================================
DATABASE_URL="postgresql://user:password@host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/postgres"
NODE_ENV="development"

# ==============================================================================
# Email Notifications (Resend API - Recommended)
# ==============================================================================
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="DevOS <onboarding@resend.dev>"

# ==============================================================================
# Optional SMTP Fallback (e.g. Gmail App Password)
# ==============================================================================
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"

# ==============================================================================
# Cron Security (Protects automated reminder endpoints)
# ==============================================================================
CRON_SECRET="your-secure-random-secret-token"

# ==============================================================================
# AI Assistant (Google Gemini Flash)
# ==============================================================================
AI_API_KEY="your-google-gemini-api-key"
AI_MODEL="gemini-1.5-flash"
=======
# 🗄 Core Data Models

```text
User
 │
 ├── Learning Topics
 │      │
 │      └── Revision Entries
 │
 ├── DSA Problems
 │
 ├── Projects
 │
 ├── Notes
 │
 ├── Resources
 │
 ├── Planner Tasks
 │
 ├── Study Sessions
 │
 ├── Preferences
 │
 └── Revision Goals
```

---

# 🤖 AI Architecture

The DevOS AI Copilot uses application context.

```text
Learning Topics
       │
       ▼
Revision Data
       │
       ▼
DSA Progress
       │
       ▼
Planner Tasks
       │
       ▼
   Context Builder
       │
       ▼
Google Gemini
       │
       ▼
🤖 AI Response
```

This allows the AI to provide more relevant developer guidance.

---

# 🔐 Security

DevOS follows important security principles.

```text
User Request
      │
      ▼
Authentication
      │
      ▼
Authorization
      │
      ▼
Validation
      │
      ▼
Business Logic
      │
      ▼
Database
```

### Security Measures

```text
✓ Server-side authentication

✓ Protected API routes

✓ User ownership validation

✓ Secure environment variables

✓ Server-side secrets

✓ Input validation

✓ Password hashing

✓ Secure reset tokens
>>>>>>> 22a052a57760471e1c72544774ed584b7fd453b3
```

---

<<<<<<< HEAD
## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.18.0 or v20+ recommended
- **npm**: v9+
- **PostgreSQL**: Local instance or cloud provider ([Supabase](https://supabase.com), [Neon](https://neon.tech), [Railway](https://railway.app))

### 1. Clone the Repository
```bash
git clone https://github.com/abhigoud098/devos.git
cd devos
```

### 2. Install Dependencies
```bash
npm install
```
> **Note**: A `postinstall` hook runs `prisma generate && node scripts/patch-next.js` automatically.

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in your connection details:
```bash
cp .env.example .env.local
```
=======
```text
DATABASE_URL

AI_API_KEY

RESEND_API_KEY

SMTP_PASSWORD

CRON_SECRET
```

---

# 🌱 Environment Variables
>>>>>>> 22a052a57760471e1c72544774ed584b7fd453b3

### 4. Push Schema to Database
```bash
npm run db:push
```

<<<<<<< HEAD
*(Optional)* Seed sample topics, problems, and notes:
=======
```text
.env.local
```

Example:

```env
# Database

DATABASE_URL=
DIRECT_URL=

# Environment

NODE_ENV=development

# Email

RESEND_API_KEY=
EMAIL_FROM=

# SMTP

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASSWORD=

# Cron

CRON_SECRET=

# AI

AI_API_KEY=
AI_MODEL=gemini-1.5-flash
```

> Never commit `.env.local`.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js 18+
* npm
* Git
* PostgreSQL

---

## 1. Clone

```bash
git clone https://github.com/abhigoud098/devos.git

cd devos
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment

Copy:

```bash
cp .env.example .env.local
```

Then configure your environment variables.

---

## 4. Configure Database

Push the Prisma schema:

```bash
npm run db:push
```

Optional seed data:

>>>>>>> 22a052a57760471e1c72544774ed584b7fd453b3
```bash
npm run db:seed
```

<<<<<<< HEAD
### 5. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Development Commands

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with hot-reload |
| `npm run build` | Generates the Prisma Client and executes an optimized production build |
| `npm start` | Launches the production server locally |
| `npm run lint` | Runs ESLint to verify code quality with zero warnings |
| `npm run db:push` | Pushes the Prisma schema changes directly to PostgreSQL |
| `npm run db:seed` | Populates the database with initial starter data via `prisma/seed.ts` |
| `npm run db:studio` | Launches Prisma Studio GUI at `http://localhost:5555` to browse data |

---

## 🪟 Windows & OneDrive Compatibility

When running Next.js projects inside synchronized folders such as **Microsoft OneDrive on Windows**, OneDrive applies cloud reparse point tags to newly generated files in `.next`. 

Standard Node.js `fs.promises.readlink` calls treat these reparse points as symlinks and throw `EINVAL: invalid argument, readlink` when Next.js attempts to clean the build directory.

DevOS includes an automated fix:
1. **[scripts/patch-next.js](file:///c:/Users/gouda/OneDrive/Desktop/devos/scripts/patch-next.js)**: Safely handles non-symlink OneDrive reparse points.
2. **Automated `postinstall` Hook**: Automatically executes whenever you run `npm install`, ensuring development and production builds run smoothly across Windows, macOS, and Linux.

---

## ☁️ Production Build & Deployment

### Local Verification
Verify that both linting and production bundling pass with zero errors:
```bash
npm run lint
npm run build
```

### Vercel Deployment
1. Push your code to a GitHub repository.
2. Import the project into **[Vercel](https://vercel.com)**.
3. Configure the **Environment Variables** (`DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, `AI_API_KEY`, `CRON_SECRET`).
4. Vercel will automatically detect `vercel.json` and schedule the `/api/cron/study-reminders` cron job.
5. Deploy!

---

## 🔒 Security & Best Practices

- **Zero Client-Side Secrets**: API keys, database connection strings, and SMTP passwords remain strictly on the server.
- **Server-Side User Ownership**: Every route handler inspects the verified Bearer token or session cookie before executing Prisma queries (`where: { userId: user.id }`).
- **Input Sanitization**: Request bodies are validated and sanitized to guard against injection and malformed payloads.
- **Strict Headers**: Built-in HTTP security headers configured in `next.config.mjs` (`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`).

---

## 🤝 Contributing

Contributions, feature requests, and bug reports are welcome!
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](file:///c:/Users/gouda/OneDrive/Desktop/devos/LICENSE) file for details.

---

<p align="center">
  Built with ❤️ for software engineers who believe in continuous learning.
</p>
=======
---

## 5. Start DevOS

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🛠 Commands

| Command             | Description          |
| ------------------- | -------------------- |
| `npm run dev`       | Start development    |
| `npm run build`     | Production build     |
| `npm start`         | Start production     |
| `npm run lint`      | Run ESLint           |
| `npm run db:push`   | Push database schema |
| `npm run db:seed`   | Seed database        |
| `npm run db:studio` | Open Prisma Studio   |

---

# 🪟 Windows + OneDrive

DevOS includes a compatibility patch for Next.js projects running inside synchronized Windows directories such as OneDrive.

The patch handles filesystem reparse-point behavior that can affect Next.js build directories.

```text
Windows
   │
   ▼
OneDrive
   │
   ▼
.next Directory
   │
   ▼
Compatibility Patch
```

The patch is executed automatically during installation.

---

# ☁️ Deployment

DevOS is designed for deployment with:

```text
GitHub
   │
   ▼
Vercel
   │
   ▼
Next.js Application
   │
   ├── API
   ├── AI
   ├── Sync
   └── Cron
          │
          ▼
     PostgreSQL
```

### Deployment Steps

1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Configure environment variables.
4. Configure PostgreSQL.
5. Configure AI credentials.
6. Configure email service.
7. Deploy.

---

# 🧪 Production Checklist

```text
[ ] npm run lint passes

[ ] npm run build passes

[ ] Database connection works

[ ] Prisma schema is configured

[ ] Authentication works

[ ] API routes work

[ ] Local persistence works

[ ] Cloud synchronization works

[ ] AI integration works

[ ] Email reminders work

[ ] Environment variables are configured

[ ] Secrets are not committed
```

---

# 🗺 Roadmap

## 🟢 Core

* [x] Developer Dashboard
* [x] Learning Tracker
* [x] Smart Revision
* [x] Local Persistence
* [x] Cloud Database
* [x] Authentication
* [x] AI Copilot
* [x] Study Timer

## 🟡 In Progress

* [ ] Advanced DSA Analytics
* [ ] Project Improvements
* [ ] Better Knowledge Graph
* [ ] Advanced Search
* [ ] Improved Sync System

## 🔵 Future

* [ ] Command Palette
* [ ] Global Search
* [ ] Keyboard Shortcuts
* [ ] Learning Heatmap
* [ ] Weak Topic Detection
* [ ] AI Learning Recommendations
* [ ] Import / Export
* [ ] Backup System
* [ ] Optional Team Collaboration

---

# 🔮 Vision

DevOS is designed to eventually understand a developer's entire learning journey.

```text
What are you learning?
        │
        ▼
What have you completed?
        │
        ▼
What are you forgetting?
        │
        ▼
What should you revise?
        │
        ▼
Where are you weak?
        │
        ▼
What should you practice?
        │
        ▼
What should you build?
        │
        ▼
How are you improving?
```

---

# 🧠 The DevOS Loop

```mermaid
flowchart TD

    A[📚 Learn]

    A --> B[🧠 Understand]

    B --> C[🔁 Revise]

    C --> D[💻 Practice]

    D --> E[🚀 Build]

    E --> F[📊 Measure]

    F --> G[🎯 Improve]

    G --> A
```

---

# 🤝 Contributing

Contributions and suggestions are welcome.

```bash
git checkout -b feature/amazing-feature
```

Make your changes.

Before opening a pull request:

```bash
npm run lint

npm run build
```

Then:

```bash
git commit -m "Add amazing feature"

git push origin feature/amazing-feature
```

---

# 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

# 🧠 DevOS

### Developer Second Brain

<br/>

**Learn. Practice. Build. Revise. Improve. 🚀**

<br/>

Built with

**Next.js • React • TypeScript • Tailwind CSS**

**Dexie • IndexedDB • Prisma • PostgreSQL**

**Google Gemini • Resend**

<br/>

---

### ⭐ If you like DevOS, consider giving the repository a star!

</div>
>>>>>>> 22a052a57760471e1c72544774ed584b7fd453b3
