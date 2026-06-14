<div align="center">
    <picture>
        <img src="public/buzzfinder-logo.png" alt="BuzzFinder Logo" width="100"/>
    </picture>
    <h1>BuzzFinder</h1>
    <i>Reconnecting People With Lost Items</i>
    <br />
    <a href="#introduction"><strong>Introduction</strong></a> ·
    <a href="#features"><strong>Features</strong></a> ·
    <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a> ·
    <a href="#project-structure"><strong>Project Structure</strong></a> ·
    <a href="#contributing"><strong>Contributing</strong></a>
</div>

## Introduction

BuzzFinder is a web application designed to simplify the process of **finding and reporting lost and found items**. BuzzFinder connects users to help retrieve their lost belongings or return found items to their rightful owners.

## Features

- **Streamlined Item Reporting:** Easily report lost items or post found items with detailed descriptions, images, categories, and specific location information.
- **Interactive Map Display:** Visually explore found items on an interactive map with location pins.
- **Real-time Messaging:** Message users through an integrated chat system to coordinate item returns or inquiries.
- **Item Dashboard:** View and filter all reported lost and found items in one central location.

## Tech Stack

- [Next.js](https://nextjs.org/) - React Framework
- [TailwindCSS](https://tailwindcss.com/) - CSS Styling
- [@vis.gl/react-google-maps](https://visgl.github.io/react-google-maps/) - Google Maps Integration
- [MongoDB](https://www.mongodb.com/) - Database
- [Next-Auth](https://next-auth.js.org/) - Authentication
- [Pusher](https://pusher.com/) - Real-Time Messaging
- [@getbrevo/brevo](https://www.npmjs.com/package/@getbrevo/brevo) - Email Services

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (LTS version recommended)
- npm or Yarn (npm is used in the examples)
- MongoDB instance (local or cloud-hosted)
- Google Cloud Project with Maps JavaScript API enabled and a valid API key.
- Pusher account for real-time features.
- NextAuth environment variables for Google, Microsoft Entra ID, and database connection.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/itsevelync/buzz-finder.git
    cd buzz-finder
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file in the root of the project and add your environment variables.

    ```
    # MongoDB
    MONGODB_URI=your_mongodb_connection_string

    # NextAuth
    NEXTAUTH_SECRET=your_nextauth_secret_string
    NEXTAUTH_URL=http://localhost:3000

    # Google OAuth
    AUTH_GOOGLE_ID=your_google_client_id
    AUTH_GOOGLE_SECRET=your_google_client_secret

    # Microsoft Entra ID (for Georgia Tech)
    AUTH_MICROSOFT_ENTRA_ID=your_microsoft_entra_client_id
    AUTH_MICROSOFT_ENTRA_ID_SECRET_VALUE=your_microsoft_entra_client_secret
    AUTH_MICROSOFT_ENTRA_ID_TENANT_ID=your_microsoft_entra_tenant_id

    # Google Maps
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

    # Pusher
    NEXT_PUBLIC_PUSHER_APP_KEY=your_pusher_app_key
    NEXT_PUBLIC_PUSHER_CLUSTER=your_pusher_cluster
    PUSHER_APP_ID=your_pusher_app_id
    PUSHER_SECRET=your_pusher_secret

    # Brevo
    BREVO_API_KEY=your_brevo_api_key
    ```

    _Refer to the respective documentation for how to obtain these keys and IDs._

### Running Locally

1.  **Run the development server:**

    ```bash
    npm run dev
    ```

2.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── public/                 # Static assets (images, icons)
└── src/
    ├── actions/            # Server actions for data manipulation
    ├── app/                # Next.js App Router: pages and API routes
    ├── components/         # Reusable React components
    ├── constants/          # Application-wide constants
    ├── context/            # React Context API for global state
    ├── hooks/              # Custom React hooks
    ├── lib/                # Utility functions and external integrations
    └── model/              # Mongoose schemas for MongoDB
```

## Contributing

We welcome all contributions from the community! Please feel free to open issues or submit pull requests.
