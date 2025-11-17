# Klash Backend

NestJS backend for Klash application with Twitter integration and prediction markets.

## Features

### Twitter Integration
- Twitter API integration for:
  - Searching tweets
  - Getting user profiles
  - Fetching trending topics
  - Detecting controversial tweets
  - Monitoring influencers
  - Analyzing sentiment from tweet replies

### Prediction Markets
- Automated market creation for controversial tweets
- Market resolution based on sentiment analysis
- Integration with Aptos blockchain

### Core Features
- RESTful API endpoints
- Input validation
- Error handling
- Environment configuration
- Swagger API documentation
- Scheduled tasks for automation

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Python 3.8+ (for Twitter scraping and analysis)
- MongoDB (for data storage)
- Aptos CLI (optional, for smart contract interaction)
- MongoDB (local or remote)
- Twitter API credentials

## Installation

1. Clone the repository
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Install Python dependencies:
   ```bash
   pip install -r src/python/requirements.txt
   ```
4. Download the SpaCy English language model:
   ```bash
   python -m spacy download en_core_web_sm
   ```
5. Create a `.env` file based on `.env.example`
6. Set up Twitter accounts for scraping in `accounts.txt` (format: username:password:email:email_password)
7. Start the development server:
   ```bash
   npm run start:dev
   ```

## Configuration

Update the following environment variables in your `.env` file:

```
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_BASE_URL=https://api.twitterapi.io
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost/klash
```

## Running the App

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run build
$ npm run start:prod
```

## API Documentation

Once the application is running, you can access the API documentation at:

```
http://localhost:3000/api/docs
```

## Available Endpoints

### Twitter API

- `GET /api/twitter/search?query=:query&count=:count` - Search for tweets
- `GET /api/twitter/user/:username` - Get user profile by username
- `GET /api/twitter/trends` - Get trending topics

### Health Check

- `GET /api/health` - Check if the API is running

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Project Structure

```
src/
├── app.controller.ts       # Basic controller with health check endpoint
├── app.module.ts          # Root application module
├── app.service.ts         # Basic service with health check
├── main.ts                # Application entry file
├── config/                # Configuration files
│   └── configuration.ts   # Application configuration
├── twitter/               # Twitter module
│   ├── dto/               # Data transfer objects
│   ├── twitter.controller.ts  # Twitter API endpoints
│   ├── twitter.module.ts  # Twitter module definition
│   └── twitter.service.ts # Twitter API business logic
└── common/                # Common modules and interfaces
    └── interfaces/        # TypeScript interfaces
```

## License

This project is [MIT licensed](LICENSE).
