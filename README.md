# Project Management Application

A comprehensive project management application built with Next.js, Prisma, and TypeScript. This application helps manage construction projects, including estimates, photos, sketches, and project details.

## Features

- Project Creation and Management
- Photo Management with AWS S3 Integration
- Sketch Upload and Management
- Estimate Creation and Tracking
- Project Timeline Visualization
- Weather Integration for Project Sites
- Location Mapping with Google Maps

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Material-UI
- **Database**: SQLite with Prisma ORM
- **Storage**: AWS S3 for file storage
- **Maps**: Google Maps API
- **Authentication**: Built-in auth system

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/ajsorbello/PMclient.git
cd PMclient
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="file:./dev.db"
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_BUCKET_NAME=your_bucket_name
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

4. Initialize the database:
```bash
cd frontend
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev:frontend
```

## Project Structure

- `/frontend` - Next.js frontend application
  - `/app` - Next.js app directory with routes and API endpoints
  - `/components` - React components
  - `/lib` - Utility functions and configurations
  - `/prisma` - Database schema and migrations
- `/backend` - Node.js backend services (if needed)
- `/scripts` - Utility scripts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - [@ajsorbello](https://github.com/ajsorbello)
