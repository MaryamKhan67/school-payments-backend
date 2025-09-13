name: School Payments Backend API
description: >
  A RESTful backend API for School Payment and Dashboard Application. 
  Built with Node.js, Express, MongoDB, and JWT authentication. 
  This microservice handles payment processing, transaction management, 
  and webhook integrations for school payment systems.

live_demo:
  base_url: "https://school-payments-backend.onrender.com"

api_endpoints:
  authentication:
    - method: POST
      endpoint: /auth/register
      description: Register new user
      authentication: Public
    - method: POST
      endpoint: /auth/login
      description: User login (returns JWT token)
      authentication: Public
  payments:
    - method: POST
      endpoint: /create-payment
      description: Create payment request
      authentication: JWT Required
    - method: POST
      endpoint: /webhook
      description: Payment webhook handler
      authentication: Public
  transactions:
    - method: GET
      endpoint: /transactions
      description: Get all transactions (paginated & sorted)
      authentication: JWT Required
    - method: GET
      endpoint: /transactions/school/:schoolId
      description: Get transactions by school
      authentication: JWT Required
    - method: GET
      endpoint: /transaction-status/:orderId
      description: Check transaction status
      authentication: JWT Required

technology_stack:
  framework: Node.js with Express.js
  database: MongoDB Atlas
  authentication: JWT (JSON Web Tokens)
  payment_gateway: Edviron Payment API
  deployment: Render.com
  environment_management: dotenv

installation_setup:
  prerequisites:
    - Node.js (v14 or higher)
    - MongoDB Atlas account
    - npm or yarn
  steps:
    - step: Clone the Repository
      command: |
        git clone https://github.com/MaryamKhan67/school-payments-backend.git
        cd school-payments-backend
    - step: Install Dependencies
      command: npm install
    - step: Environment Configuration
      env_file: |
        PORT=3000
        MONGO_URI=your_mongodb_atlas_connection_string
        JWT_SECRET=your_jwt_secret_key_here
        JWT_EXPIRES_IN=24h
        PAYMENT_PG_KEY=edvtest01
        PAYMENT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0
        PAYMENT_SCHOOL_ID=65b0e6293e9f76a9694d84b4
    - step: Run the Application
      command: |
        # Development mode
        npm run dev
        # Production mode
        npm start

database_schemas:
  order_schema:
    school_id: String
    trustee_id: String
    student_info:
      name: String
      id: String
      email: String
    gateway_name: String
  order_status_schema:
    collect_id: ObjectId (Reference to Order)
    order_amount: Number
    transaction_amount: Number
    payment_mode: String
    payment_details: String
    bank_reference: String
    payment_message: String
    status: String (success, pending, failed)
    error_message: String
    payment_time: Date

authentication:
  requirement: JWT
  header_format: "Authorization: Bearer <your_jwt_token>"

usage_examples:
  user_registration: |
    curl -X POST https://school-payments-backend.onrender.com/auth/register \
      -H "Content-Type: application/json" \
      -d '{"username":"testuser","email":"test@example.com","password":"test123"}'
  user_login: |
    curl -X POST https://school-payments-backend.onrender.com/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"testuser","password":"test123"}'
  get_transactions: |
    curl -X GET https://school-payments-backend.onrender.com/transactions \
      -H "Authorization: Bearer YOUR_JWT_TOKEN" \
      -H "Content-Type: application/json"

deployment:
  platform: Render.com
  runtime: Node.js
  build_command: npm install
  start_command: npm start
  environment_variables: Set in Render dashboard

api_response_format:
  example: |
    {
      "data": [],
      "pagination": {
        "currentPage": 1,
        "totalPages": 0,
        "totalItems": 0,
        "itemsPerPage": 10,
        "hasNext": false,
        "hasPrev": false
      },
      "sort": {
        "field": "payment_time",
        "order": "desc"
      }
    }

troubleshooting:
  - issue: 502 Bad Gateway
    fix: Wait for the application to fully start (2-3 minutes after deployment)
  - issue: 401 Unauthorized
    fix: Check if JWT token is valid and included in headers
  - issue: MongoDB Connection Error
    fix: Verify MongoDB Atlas IP whitelisting

license: Educational assessment purposes only
author: Maryam Khan
support:
  instructions: Check the Render dashboard logs or GitHub repository issues

improvements:
  - Complete installation instructions
  - Detailed environment variables
  - API endpoint table with authentication requirements
  - Usage examples with curl commands
  - Database schema documentation
  - Response format examples
  - Troubleshooting guide
  - Professional structure