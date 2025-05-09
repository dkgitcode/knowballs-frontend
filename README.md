# Manimsplain Demo

A visual learning platform that explains complex topics through beautiful animations, powered by [Manim](https://www.manim.community/).

## Overview

This demo showcases the core concept of Manimsplain - a platform that generates interactive lessons with mathematical animations. The demo features a sample lesson on Linear Regression, demonstrating how complex mathematical concepts can be broken down and visualized.

### Key Features in Demo

- 🎯 Interactive search interface with dynamic placeholders
- 🎨 Dark mode optimized UI
- 🎬 Sample video component placeholders
- ⚡ Animated content transitions
- 💬 Follow-up question interface

## Getting Started

1. Clone the repository
2. Install dependencies
3. Run the development server.

```bash
npm install
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication Setup with Supabase

This project uses Supabase for authentication. To set up authentication:

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in Supabase
3. Enable Email/Password authentication in Authentication > Providers
4. Copy your Supabase URL and anon key from Project Settings > API
5. Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

6. Replace the placeholder values with your actual Supabase credentials
7. Restart your development server

### Authentication Features

- 🔐 Email/password authentication
- 👤 User profiles
- 🔄 Persistent sessions
- 🔒 Protected routes

## Demo Features

### Interactive Search
The demo includes a sophisticated search interface with animated placeholders that showcase various mathematical concepts you can explore.


### Sample Lesson Structure
The demo includes a complete linear regression lesson that showcases:

- Basic concept explanation
- Mathematical formulas
- Visual representations
- Real-world applications
- Interactive elements



## Full Version (In Development)

The full version of Manimsplain is currently being developed with additional features:

- 🤖 AI-powered lesson generation
- 🎨 Real-time Manim animation generation
- 🔄 Dynamic content adaptation based on user questions
- 📚 Extensive topic library
- 👥 User accounts and progress tracking
- 💾 Lesson history and bookmarking

## Tech Stack

- **Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **UI Components**: Customized shadcn/ui
- **Animations**: Manim (full version)
- **Typography**: PT Serif

## Project Structure 🏗️

Here's an overview of the main directories and files in this project:

*   **`/.next/`**: Contains the output of the Next.js build. You DON'T usually need to touch this.
*   **`/app/`**: Core directory for the Next.js App Router.
    *   `layout.tsx`: The ROOT layout for the entire application.
    *   `page.tsx`: The main landing page of the application.
    *   `globals.css`: GLOBAL CSS styles.
    *   `/api/`: Contains API route handlers.
    *   `/[...route]/page.tsx` or `/[...route]/layout.tsx`: Defines pages and layouts for different routes (e.g., `/login`, `/profile`, `/visualizer`).
*   **`/components/`**: Contains reusable React components used throughout the application.
    *   `/ui/`: Base UI components, likely from shadcn/ui, customized for the project.
    *   `/pages/`: This seems to contain components that are specific to certain pages or larger sections of the UI.
    *   Other `.tsx` files: Individual components like `sidebar.tsx`, `search-input.tsx`, etc.
*   **`/hooks/`**: Custom React Hooks to encapsulate and reuse stateful logic (e.g., `useAuth.ts`, `useToast.ts`).
*   **`/lib/`**: Contains utility functions. Currently, it has a `utils.ts`.
*   **`/node_modules/`**: Stores all the project dependencies. You DON'T usually need to touch this.
*   **`/public/`**: Stores static assets like images, fonts, and videos that are served directly by the browser.
*   **`/utils/`**: Contains utility functions and helpers.
    *   `utils.ts`: General utility functions. (NOTE: There's also a `lib/utils.ts`, consider consolidating these if they serve similar purposes! 🤔)
    *   `/supabase/`: Likely contains Supabase client initialization and helper functions for interacting with Supabase services.
*   **`/.cursor/`**: Directory for Cursor specific files. You DON'T usually need to touch this.
*   **`/.git/`**: Directory for Git version control. You DON'T usually need to touch this.
*   **`add_delete_policy.sql`**: SQL script, possibly for setting up Supabase database policies.
*   **`components.json`**: Configuration file for shadcn/ui, defining component dependencies and styles.
*   **`middleware.ts`**: Next.js middleware for running code before a request is completed (e.g., for authentication, redirects).
*   **`next.config.ts`**: Configuration file for Next.js.
*   **`package.json`**: Lists project dependencies and scripts.
*   **`postcss.config.mjs`**: Configuration for PostCSS, used with Tailwind CSS.
*   **`tailwind.config.ts`**: Configuration file for Tailwind CSS.
*   **`tsconfig.json`**: Configuration file for TypeScript.
*   **`README.md`**: THIS FILE! 🎉 It provides an overview of the project.

## Contributing

While this is currently a demo, we're actively working on the full version. If you're interested in contributing or following the development, stay tuned for updates.

## License

MIT License - feel free to use this demo code as inspiration for your own projects.

---

**Note**: This is a demonstration version. The animations shown in the demo are placeholders. The full version will include real-time generated Manim animations based on user queries.

For updates on the full version, watch this repository or follow our development progress.