# Football Team App

This is a Next.js application to display football teams, built with Tailwind CSS and Shadcn UI.

## Setup

1.  **Environment Variables**:
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

2.  **Install Dependencies**:

    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## Features

- **Team Display**: Shows team details, crest, and colors.
- **Squad List**: Lists all players with their position and nationality.
- **Coach Info**: Displays the head coach's details.
- **Dark Mode**: Sleek dark interface with glassmorphism effects.

## Tech Stack

- Next.js 15
- Tailwind CSS
- Shadcn UI
- Supabase
