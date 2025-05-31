# Homework Manager

This is a homework management application that allows teachers and students to manage homework assignments effectively. It is built with Next.js and React, and it uses Supabase for authentication and backend data management.

## Features

- **User Authentication:** Login functionality using Supabase Auth.
- **Student Management:** Import student data via CSV files. The CSV import ensures that the class information is among a predefined set (minimum A, B, C, maximum 30 classes).
- **Homework Management:** Manage homework status (active, completed, etc.) for students.
- **Local Storage Integration:** Uses localStorage for storing student data, allowing for a quick start and offline development.
- **Supabase Integration:** Uses Supabase for user authentication and can be extended for database storage.
- **Modern UI:** Built with Next.js, React, and Tailwind CSS for responsive design.

## Tech Stack

- **Next.js & React:** Frontend framework for building user interfaces and managing state.
- **Supabase:** Backend as a Service for handling authentication and data operations.
- **Tailwind CSS:** Utility-first CSS framework for rapid UI development.
- **date-fns:** Library for date handling.

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
- npm or yarn

### Installation

1. **Clone the Repository:**
   \`\`\`bash
   git clone https://github.com/Reasonofmoon/homework-management.git
   cd homework-management
   \`\`\`

2. **Install Dependencies:**
   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. **Set Up Environment Variables:**

   Create a `.env.local` file in the root of the project with the following content:
   \`\`\`env
   NEXT_PUBLIC_SUPABASE_URL=https://iegyqrnlvcjjjwryiilg.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   \`\`\`
   **Note:** Do not commit any `.env` files to your repository. The provided `.gitignore` already excludes these files.

4. **Run the Development Server:**
   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This project can be deployed on platforms like Vercel, Netlify, or any other hosting provider that supports Next.js.

### Vercel Deployment

1. **Connect Your GitHub Repository:**
   Follow Vercel's instructions to import your repository.

2. **Set Environment Variables on Vercel:**
   In the Vercel project dashboard, set the environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Deploy:**
   Every commit pushed to your main branch will trigger an automatic deployment.

## Security

- Sensitive environment variables are managed in `.env` files, and these files are excluded from version control through the `.gitignore`.
- For additional security, use platform-specific secret management (e.g., GitHub Secrets, Vercel Environment Variables).

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
