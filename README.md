   # TrustCart AI - Promise vs Proof Verification System

   🧠 **AI-powered trust verification platform for social commerce**

   TrustCart AI compares seller promises with official billing documents to detect mismatches automatically, creating a transparent and accountable trust layer for digital commerce.

   ## 🚀 Features

   ### Core Verification
   - **Promise vs Invoice Verification**: Compare seller commitments with actual bills
   - **AI-Powered Analysis**: Semantic comparison using rule-based verification + Ollama/Mistral integration
   - **Dynamic Trust Scoring**: Real-time seller trust score updates based on verification history
   - **Mismatch Detection**: Identify discrepancies in price, delivery, returns, and descriptions
   - **Explainable Results**: Clear analysis of verification outcomes with severity levels

   ### User Management
   - **Firebase Authentication**: Email/password + Google OAuth integration
   - **User-Bound Data**: Personalized dashboards and audit logs
   - **Profile Management**: Google profile photo integration

   ### Trust & Analytics
   - **Public Seller IDs**: Unique identifiers (SELLER-ABC-123) for easy lookup
   - **Smart Seller Search**: Find sellers by name, email, or platform - no need to memorize IDs
   - **New Seller Handling**: Proper onboarding without fake trust scores
   - **Immutable Audit Logs**: Complete action tracking with pagination
   - **Real-time System Stats**: Auto-refreshing metrics with smooth animations

   ### Multi-Platform Support
   - **WhatsApp, Instagram, Facebook**: Seller verification across platforms
   - **Privacy-First**: Local AI processing with Ollama (no external API calls)

   ## 🛠️ Tech Stack

   - **Frontend**: Next.js 16, TypeScript, Tailwind CSS
   - **Backend**: Next.js API Routes
   - **Database**: MongoDB with Mongoose
   - **Authentication**: Firebase Auth (Email + Google OAuth)
   - **AI Engine**: Rule-based + Ollama/Mistral local AI
   - **UI Components**: React Hot Toast, Lucide Icons

   ## 🚀 Quick Start

   ### For Users (Buyers/Sellers)
   1. **Visit the App**: Open TrustCart AI in your browser
   2. **Sign Up**: Create account with email or Google
   3. **Find Sellers**: Search by name/email (no complex IDs needed!)
   4. **Check Trust Scores**: View seller reliability before buying
   5. **Verify Transactions**: Help build community trust after purchases

   ### For Developers
   1. **Clone & Install**: Get the code and dependencies
   2. **Configure**: Set up MongoDB and Firebase
   3. **Run**: Start development server
   4. **Customize**: Adapt for your platform needs

   *See detailed setup instructions below* ⬇️

   ## 📦 Installation

   1. **Clone the repository**
      ```bash
      git clone <repository-url>
      cd trustcart-ai
      ```

   2. **Install dependencies**
      ```bash
      npm install
      ```

   3. **Set up environment variables**
      
      Create `.env.local` with your configuration:
      ```env
      # MongoDB Connection
      MONGODB_URI=mongodb://localhost:27017/trustcart-ai
      # or use MongoDB Atlas
      MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/trustcart
      
      # Firebase Configuration
      NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
      NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
      NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
      ```

   4. **Set up Ollama (Optional - for local AI)**
      ```bash
      # Install Ollama
      curl -fsSL https://ollama.ai/install.sh | sh
      
      # Pull Mistral model
      ollama pull mistral
      ```

   4. **Start the development server**
      ```bash
      npm run dev
      ```

   5. **Access the application**
      - Open `http://localhost:3000`
      - Sign up or login with email/Google
      - Start verifying transactions!

   6. **Seed demo data (optional)**
      
      Visit `http://localhost:3000/api/seed` or make a POST request to seed demo sellers.

   ## 🎯 Usage

   ### Authentication
   - **Sign Up**: Create account with email/password or Google OAuth
   - **Login**: Access your personalized dashboard
   - **Profile**: View Google profile photo and user info

   ### 1. Register Sellers
   - Navigate to "Register Seller" tab
   - Add seller details (name, email, platform)
   - Get unique public seller ID (SELLER-ABC-123)
   - New sellers start with null trust score

   ### 2. Verify Transactions
   - Go to "Verify Transaction" tab
   - **Find Seller**: Search by name, email, or enter seller ID
   - Input seller promises (price, delivery, returns, etc.)
   - Enter actual invoice details
   - Get AI verification results with detailed analysis

   ### 3. View Trust Scores
   - Go to "Analytics" tab
   - **Multiple Search Options**:
   - **Search by Name/Email**: Type seller name or email for instant results
   - **Public Seller ID**: Enter SELLER-ABC-123 format if you have it
   - **Browse Directory**: Explore all registered sellers
   - View complete trust metrics and verification history
   - No need to memorize cryptic seller IDs!

   ### 4. Monitor Activity
   - **Dashboard**: View your verification stats and recent activity
   - **Audit Logs**: Complete history of all actions with filtering
   - **System Stats**: Real-time platform metrics

   ## 🔍 How Verification Works

   1. **Promise Capture**: Record seller commitments from chat/posts
   2. **Invoice Analysis**: Extract actual billing details
   3. **AI Comparison**: 
      - Rule-based semantic analysis
      - Optional Ollama/Mistral local AI processing
      - Strict policy matching and critical word detection
   4. **Mismatch Detection**: Identify and categorize issues by severity
   5. **Trust Score Update**: Dynamic scoring based on verification accuracy
   6. **Audit Logging**: Immutable record of all verification activities
   7. **Report Generation**: Detailed verification results with explanations

   ## 📊 Trust Score System

   - **New Sellers**: No score (🆕) - awaiting first verification
   - **90-100**: Excellent (🌟) - Highly trustworthy
   - **80-89**: Very Good (✅) - Reliable seller
   - **70-79**: Good (👍) - Generally trustworthy
   - **60-69**: Fair (⚠️) - Some concerns
   - **0-59**: Poor (🚨) - High risk

   **Scoring Factors:**
   - Recent verification performance (60% weight)
   - Historical success rate (40% weight)
   - Severity of mismatches (high: -30, medium: -15, low: -8)
   - Consistency over time

   ## 🧪 API Endpoints

   ### Authentication
   - `POST /api/auth/profile` - Get user profile
   - Firebase Auth handles login/signup

   ### Sellers
   - `POST /api/sellers` - Register new seller
   - `GET /api/sellers` - Get all sellers
   - `GET /api/sellers?email=<email>` - Get seller by email

   ### Verification
   - `POST /api/verify` - Perform promise vs proof verification
   - `GET /api/verify?sellerId=<id>` - Get verification history

   ### Trust Score
   - `GET /api/trust-score/[sellerId]` - Get seller trust metrics (MongoDB ID)
   - `GET /api/trust-score/public/[sellerId]` - Get trust score by public ID

   ### Audit Logs
   - `GET /api/audit-logs` - Get user's audit logs with pagination
   - `GET /api/audit-logs/stats` - Get audit statistics
   - `DELETE /api/audit-logs` - Bulk delete logs

   ### System
   - `GET /api/health` - Health check
   - `POST /api/seed` - Seed demo data

   ## 🔮 Future Enhancements

   - **Advanced AI Models**: GPT-4, Claude integration options
   - **Voice Promise Capture**: Regional language support with speech-to-text
   - **Browser Extension**: Invoice verification plugin for e-commerce sites
   - **Blockchain Integration**: Immutable promise logs on-chain
   - **Payment Gateway Integration**: Real-time verification during checkout
   - **Mobile App**: React Native implementation
   - **Seller Analytics**: Advanced insights and recommendations
   - **Multi-language Support**: Localization for global markets

   ## 🏗️ Architecture

   ```
   src/
   ├── app/
   │   ├── api/           # API routes
   │   │   ├── auth/      # Authentication endpoints
   │   │   ├── audit-logs/# Audit logging system
   │   │   ├── sellers/   # Seller management
   │   │   ├── trust-score/# Trust score APIs
   │   │   └── verify/    # Verification engine
   │   ├── layout.tsx     # Root layout
   │   └── page.tsx       # Main application
   ├── components/        # React components
   │   ├── auth/          # Authentication components
   │   └── ...            # Feature components
   ├── contexts/          # React contexts (Auth)
   ├── lib/
   │   ├── mongodb.ts     # Database connection
   │   ├── firebase.ts    # Firebase configuration
   │   ├── ollama.ts      # Local AI service
   │   ├── models/        # Mongoose schemas
   │   └── ai/            # Verification engine
   ├── services/          # Business logic
   │   ├── auditService.ts    # Audit logging
   │   └── trustScoreService.ts # Trust calculations
   ├── utils/             # Utilities and helpers
   └── types/             # TypeScript definitions
   ```

   ## 🤝 Contributing

   1. Fork the repository
   2. Create feature branch (`git checkout -b feature/amazing-feature`)
   3. Commit changes (`git commit -m 'Add amazing feature'`)
   4. Push to branch (`git push origin feature/amazing-feature`)
   5. Open Pull Request

   ## 📄 License

   This project is licensed under the MIT License.

   ## 🎯 Use Cases

   ### For Buyers
   - **Before Purchasing**: 
   - Search seller by name/email (no ID needed!)
   - Check trust score and verification history
   - Make informed buying decisions
   - **After Purchasing**: 
   - Verify transactions to help the community
   - Compare promises vs actual delivery
   - Build seller accountability

   ### For Sellers
   - **Getting Started**:
   - Register business profile easily
   - Share public seller ID with customers
   - Build trust through verified transactions
   - **Growing Business**:
   - Monitor trust score regularly
   - Encourage customer verifications
   - Maintain service quality

   ### For Platforms & Marketplaces
   - **Trust Layer**: Add verification to existing platforms
   - **Fraud Prevention**: Identify problematic sellers early
   - **User Protection**: Help buyers make safer choices
   - **Analytics**: Track platform-wide trust metrics

   ### Real-World Scenarios
   - **WhatsApp Business**: "Search for 'Rajesh Electronics' to check their trust score before ordering"
   - **Instagram Shopping**: "Verify that influencer's product claims match reality"
   - **Facebook Marketplace**: "Check seller reputation before meeting in person"
   - **Small E-commerce**: "Build customer confidence with verified trust scores"
   - **B2B Transactions**: "Validate supplier commitments and delivery terms"
   - **Service Providers**: "Verify service promises vs actual delivery"

   ## 🔒 Privacy & Security

   - **Local AI Processing**: Ollama/Mistral runs locally (no data sent to external APIs)
   - **Firebase Security**: Industry-standard authentication and authorization
   - **Immutable Audit Logs**: Complete traceability without data modification
   - **User Data Isolation**: Each user sees only their own data
   - **GDPR Compliant**: User data control and deletion capabilities

   ## 📈 Performance

   - **Real-time Updates**: Auto-refreshing stats and metrics
   - **Efficient Pagination**: Optimized database queries for large datasets
   - **Fallback Data**: Graceful degradation during database issues
   - **Connection Monitoring**: Automatic retry and error handling
   - **Smooth Animations**: Enhanced UX with number transitions
   - **Smart Search**: Instant seller lookup with autocomplete

   ## 📚 Documentation

   - **README.md**: Complete setup and feature overview
   - **USAGE_GUIDE.md**: Detailed user guide with step-by-step instructions
   - **API Documentation**: Complete endpoint reference in README

   ---

   **Built with ❤️ for transparent digital commerce**

   *Empowering buyers and sellers with AI-driven trust verification*

   ## 🌟 What Makes TrustCart AI Special

   ### User-Friendly Design
   - **No Cryptic IDs**: Search sellers by name or email, just like you would naturally
   - **Intuitive Interface**: Clean, modern design that anyone can use
   - **Smart Defaults**: System guides users to the right actions

   ### Real-World Practicality
   - **Works with Existing Workflows**: Integrates with WhatsApp, Instagram, Facebook
   - **Privacy-First**: Your data stays local with Ollama AI processing
   - **Community-Driven**: Every verification helps build trust for everyone

   ### Enterprise-Ready
   - **Scalable Architecture**: Built on Next.js 16 and MongoDB
   - **Audit Compliance**: Immutable logs for regulatory requirements
   - **API-First**: Easy integration with existing platforms

   ### Continuous Innovation
   - **AI-Powered**: Advanced semantic analysis with local LLM support
   - **Real-time Analytics**: Live trust metrics and system health
   - **Future-Proof**: Designed for blockchain integration and advanced AI models
