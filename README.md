# Premium Automotive Platform

This project is a sophisticated global automotive marketplace that aggregates investment-grade classic cars, restomods, and hot rods. It also serves as a comprehensive database for car show events worldwide. The platform provides AI-powered market analysis, user personalization features, and community engagement tools.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Framer Motion
- **Backend:** Node.js, Express, TypeScript
- **Database:** SQLite, Drizzle ORM (with `better-sqlite3`)
- **Testing:** Vitest, Supertest
- **AI Integration:** Anthropic Claude, Google Gemini, Perplexity AI

---

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v20 or later recommended)
- npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd premium-automotive-platform
    ```

2.  **Install dependencies:**
    This project uses npm for package management. Run the following command in the root directory to install all dependencies for both the server and client.
    ```bash
    npm install
    ```

### Database Setup

The application uses a local SQLite database. The database file will be created at `/db/local.db`.

1.  **Create the Database Schema:**
    Run the Drizzle ORM migration script to create all the necessary tables.
    ```bash
    npm run db:migrate
    ```

2.  **Seed the Database:**
    After the tables are created, you need to populate them with initial data.

    *   **Seed core data:** This script seeds essential data like testimonials, team members, etc.
        ```bash
        npm run db:seed
        ```
    *   **Import Car Show Events:**
        ```bash
        npm run import:events
        ```
    *   **Import Vehicle Listings:**
        ```bash
        npm run import:cars
        ```

### Running the Application

Once the setup is complete, you can run the development server. This command starts both the backend Express server and the frontend Vite server concurrently.

```bash
npm run dev
```

The application should now be running, typically at `http://localhost:5000`.

### Running Tests

This project includes an integration test suite for the backend API. The tests are written with Vitest and Supertest.

To run the full test suite, execute the following command:

```bash
npm test
```

This will verify that all API endpoints are functioning as expected.
