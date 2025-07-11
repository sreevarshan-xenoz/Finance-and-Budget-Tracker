# Finance-and-Budget-Tracker

# Personal Finance and Budget Tracker Web Application

A full-stack web application designed to help users manage personal finances through expense tracking, budget management, and financial analytics. Built with modern web technologies including React, Node.js, Express, MongoDB, and integrated financial APIs[4][9][14].

## Table of Contents
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Integration](#api-integration)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Troubleshooting](#troubleshooting)
- [Acknowledgments](#acknowledgments)

## Features

### Core Financial Management
- **Transaction Tracking**: Manual entry system with auto-categorization using machine learning models[19][20]
- **Bank Synchronization**: Secure integration with banking institutions via Plaid API for real-time transaction imports[4][14]
- **Budget Analytics**: Dynamic budget creation with spending alerts and visual progress indicators[9][19]

### Advanced Functionality
- **Predictive Cash Flow Modeling**: Machine learning-powered 30/60/90-day financial forecasts[20]
- **Document Processing**: Receipt scanning and OCR-based expense extraction[19]
- **Investment Tracking**: Portfolio monitoring with market data integration[4]

### Data Visualization
- Interactive dashboards with D3.js charts showing:
  - Spending heatmaps by category/time
  - Net worth progression timelines
  - Budget vs actual comparative analyses[9][17][20]

## Technology Stack

### Frontend
- **React** with TypeScript for type-safe component architecture[14]
- **Redux Toolkit** with persistent state management[9]
- **Material-UI** component library with custom themeing[14]
- **Victory.js** for interactive data visualizations[17]

### Backend
- **Node.js** runtime with Express.js REST API[9][14]
- **MongoDB** Atlas cloud database with Mongoose ODM[4][17]
- **JWT** authentication with refresh token rotation[14]

### Operational
- **Docker** containerization for development/production parity[14]
- **Jest** testing framework with 85%+ coverage[14]
- **GitHub Actions** CI/CD pipeline[14]

## Installation

### Prerequisites
- Node.js v18+ & npm v9+
- MongoDB Atlas cluster or local instance
- Plaid API credentials[14]

Clone repository
git clone https://github.com/sreevarshan-xenoz/Finance-and-Budget-Tracker.git
cd finance-tracker

Install dependencies
cd backend && npm install
cd ../frontend && npm install

text

### Environment Configuration
Create `.env` files with sensitive credentials:

**Backend (.env)**
MONGO_URI=mongodb+srv://<credentials>.mongodb.net/finance
PLAID_CLIENT_ID=your_plaid_id
JWT_SECRET=complex_secret_phrase

text

## API Integration

### Financial Data Services
1. **Plaid API**: Handles bank account connections and transaction syncing[4][14]
2. **Alpha Vantage**: Stock market data for investment tracking[19]
3. **CurrencyLayer**: Real-time exchange rates for multi-currency support[19]

// Example Plaid integration
const plaid = require('plaid');
const client = new plaid.Client({
clientID: process.env.PLAID_CLIENT_ID,
secret: process.env.PLAID_SECRET,
env: plaid.environments.sandbox
});

text

## Deployment

### Production Setup
Build frontend assets
cd frontend && npm run build

Start production server
cd ../backend
NODE_ENV=production node server.js

text

### Cloud Platforms
- **Frontend**: Deploy static build to Vercel/AWS Amplify[14]
- **Backend**: Containerized deployment on Heroku/DigitalOcean[14]
- **Database**: Managed MongoDB Atlas cluster[4][17]

## Contributing

### Development Workflow
1. Create feature branch from `develop`
2. Implement changes with TypeScript strict mode
3. Write Jest unit tests for new functionality[14]
4. Submit PR with detailed description of changes

Run test suite
npm test

Lint codebase
npm run lint

text

## License

MIT License - See [LICENSE.md](LICENSE) for full text[4][9][14]

## Troubleshooting

### Common Issues
- **Bank Connection Failures**: Verify Plaid environment settings[14]
- **JWT Authentication Errors**: Check token expiration timing[14]
- **Chart Rendering Issues**: Update Victory.js dependencies[17]

Reset development database
mongo finance-dev --eval "db.dropDatabase()"

text

## Acknowledgments
- Transaction categorization model adapted from TensorFlow.js examples
- UI inspiration from Mint and Personal Capital[19]
- Security practices from OWASP Web Security Guidelines[14]