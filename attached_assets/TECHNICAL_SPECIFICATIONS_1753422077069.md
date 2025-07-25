# LoveMatch Thailand - Technical Specifications

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │    Web App      │    │   Admin Panel   │
│  (React Native) │    │    (React)      │    │    (React)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │    API Gateway          │
                    │   (Supabase Edge)       │
                    └─────────────┬───────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────┴───────┐    ┌─────────┴───────┐    ┌─────────┴───────┐
│   Database      │    │   Storage       │    │   Real-time     │
│ (PostgreSQL)    │    │   (Supabase)    │    │  (WebSockets)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- React Native with Expo (Mobile)
- React with Vite (Web)
- TypeScript for type safety
- NativeWind/Tailwind CSS for styling
- React Navigation for routing

**Backend:**
- Supabase (BaaS)
- PostgreSQL database
- Supabase Auth for authentication
- Supabase Storage for file uploads
- Supabase Real-time for messaging

**External Services:**
- Social Media APIs (Facebook, Instagram, TikTok, Twitter)
- Payment Processing (Stripe/RevenueCat)
- Content Moderation API
- Push Notifications (Expo Push)

---

## Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  bio text,
  age integer CHECK (age >= 18 AND age <= 100),
  location text,
  interests text[] DEFAULT '{}',
  video_intro_url text,
  subscription_status subscription_status DEFAULT 'free',
  is_verified boolean DEFAULT false,
  last_active timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

#### matches
```sql
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL REFERENCES users(id),
  user2_id uuid NOT NULL REFERENCES users(id),
  match_type match_type NOT NULL,
  ai_score numeric(3,2) CHECK (ai_score >= 0 AND ai_score <= 1),
  video_interaction_data jsonb DEFAULT '{}',
  matched_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id != user2_id)
);
```

#### messages
```sql
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id),
  sender_id uuid NOT NULL REFERENCES users(id),
  content text NOT NULL,
  message_type message_type DEFAULT 'text',
  is_encrypted boolean DEFAULT true,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);
```

#### social_media_links
```sql
CREATE TABLE social_media_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id),
  platform social_platform NOT NULL,
  platform_user_id text NOT NULL,
  platform_username text,
  access_token text, -- Encrypted
  is_active boolean DEFAULT true,
  last_synced timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform)
);
```

### Indexes for Performance
```sql
-- User queries
CREATE INDEX idx_users_location ON users(location);
CREATE INDEX idx_users_age ON users(age);
CREATE INDEX idx_users_subscription ON users(subscription_status);
CREATE INDEX idx_users_last_active ON users(last_active);

-- Matching queries
CREATE INDEX idx_matches_user1 ON matches(user1_id);
CREATE INDEX idx_matches_user2 ON matches(user2_id);
CREATE INDEX idx_matches_matched_at ON matches(matched_at);

-- Message queries
CREATE INDEX idx_messages_match_id ON messages(match_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Social media queries
CREATE INDEX idx_social_links_user_id ON social_media_links(user_id);
```

---

## API Specifications

### Authentication Endpoints

#### POST /auth/signup
```typescript
interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  age: number;
  pdpaConsent: boolean;
}

interface SignUpResponse {
  user: User;
  session: Session;
  emailVerificationSent: boolean;
}
```

#### POST /auth/signin
```typescript
interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  user: User;
  session: Session;
}
```

#### POST /auth/oauth/{provider}
```typescript
interface OAuthRequest {
  provider: 'facebook' | 'instagram' | 'tiktok' | 'twitter';
  redirectUrl: string;
}

interface OAuthResponse {
  authUrl: string;
  state: string;
}
```

### Profile Management Endpoints

#### GET /profile/{userId}
```typescript
interface ProfileResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  age: number;
  location?: string;
  interests: string[];
  videoIntroUrl?: string;
  subscriptionStatus: 'free' | 'premium' | 'vip';
  isVerified: boolean;
  lastActive: string;
}
```

#### PUT /profile/{userId}
```typescript
interface UpdateProfileRequest {
  fullName?: string;
  bio?: string;
  location?: string;
  interests?: string[];
}
```

#### POST /profile/{userId}/video
```typescript
interface VideoUploadRequest {
  file: File; // Max 50MB, 60 seconds
}

interface VideoUploadResponse {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  moderationStatus: 'pending' | 'approved' | 'rejected';
}
```

### Matching Endpoints

#### GET /matches/discover
```typescript
interface DiscoverRequest {
  limit?: number;
  ageRange?: [number, number];
  maxDistance?: number;
  interests?: string[];
}

interface DiscoverResponse {
  users: UserProfile[];
  hasMore: boolean;
  nextCursor?: string;
}
```

#### POST /matches/swipe
```typescript
interface SwipeRequest {
  targetUserId: string;
  action: 'like' | 'super_like' | 'pass';
  interactionData?: {
    videoWatchTime: number;
    profileViewTime: number;
  };
}

interface SwipeResponse {
  matched: boolean;
  matchId?: string;
  aiScore?: number;
}
```

### Messaging Endpoints

#### GET /messages/{matchId}
```typescript
interface MessagesRequest {
  limit?: number;
  before?: string;
}

interface MessagesResponse {
  messages: Message[];
  hasMore: boolean;
  nextCursor?: string;
}
```

#### POST /messages/{matchId}
```typescript
interface SendMessageRequest {
  content: string;
  messageType: 'text' | 'image' | 'video' | 'audio';
  encryptedContent: string;
}

interface SendMessageResponse {
  messageId: string;
  timestamp: string;
  deliveryStatus: 'sent' | 'delivered' | 'read';
}
```

---

## Security Specifications

### Authentication Security

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Session Management:**
- JWT tokens with 24-hour expiration
- Refresh tokens with 30-day expiration
- Automatic token refresh
- Secure token storage (encrypted)

**Rate Limiting:**
- Login attempts: 5 per 15 minutes per IP
- Password reset: 3 per hour per email
- API requests: 100 per minute per user

### Data Encryption

**At Rest:**
- Database encryption using AES-256
- File storage encryption
- Encrypted OAuth tokens
- Encrypted sensitive user data

**In Transit:**
- TLS 1.3 for all API communications
- End-to-end encryption for messages
- Secure WebSocket connections

**Message Encryption:**
```typescript
// End-to-end encryption implementation
class MessageEncryption {
  async encryptMessage(message: string, recipientPublicKey: string): Promise<string> {
    const key = await crypto.subtle.importKey(
      'spki',
      this.base64ToArrayBuffer(recipientPublicKey),
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      false,
      ['encrypt']
    );
    
    const encrypted = await crypto.subtle.encrypt(
      'RSA-OAEP',
      key,
      new TextEncoder().encode(message)
    );
    
    return this.arrayBufferToBase64(encrypted);
  }
}
```

### PDPA Compliance

**Data Collection:**
- Explicit consent for all data collection
- Clear purpose specification
- Minimal data collection principle
- Consent withdrawal mechanism

**User Rights:**
- Right to access personal data
- Right to rectification
- Right to erasure
- Right to data portability
- Right to object to processing

**Data Retention:**
- User profiles: Until account deletion
- Messages: 1 year after last activity
- Analytics data: 2 years
- Logs: 90 days

---

## Performance Specifications

### Response Time Requirements

| Endpoint Category | Target Response Time | Maximum Acceptable |
|------------------|---------------------|-------------------|
| Authentication | < 500ms | 1s |
| Profile Operations | < 1s | 2s |
| Matching/Discovery | < 2s | 3s |
| Messaging | < 300ms | 500ms |
| File Upload | < 5s | 10s |

### Scalability Requirements

**Concurrent Users:**
- Phase 1: 1,000 concurrent users
- Phase 2: 10,000 concurrent users
- Phase 3: 100,000 concurrent users

**Database Performance:**
- Read queries: < 100ms average
- Write queries: < 200ms average
- Complex queries (matching): < 500ms average

**File Storage:**
- Video upload: 50MB max, < 30s upload time
- Image upload: 10MB max, < 10s upload time
- CDN delivery: < 2s global access time

### Caching Strategy

**Application Cache:**
- User profiles: 15 minutes
- Match results: 5 minutes
- Static content: 24 hours

**Database Cache:**
- Query result cache: 5 minutes
- Connection pooling: 20 connections max
- Read replicas for scaling

**CDN Cache:**
- Images: 7 days
- Videos: 30 days
- Static assets: 1 year

---

## Monitoring & Analytics

### System Monitoring

**Infrastructure Metrics:**
- CPU usage
- Memory consumption
- Database connections
- Storage usage
- Network latency

**Application Metrics:**
- API response times
- Error rates
- User session duration
- Feature usage statistics

**Business Metrics:**
- User registration rate
- Match success rate
- Message volume
- Subscription conversions
- User retention

### Error Handling

**Error Categories:**
- Client errors (4xx): User-friendly messages
- Server errors (5xx): Generic error messages
- Network errors: Retry mechanisms
- Validation errors: Field-specific feedback

**Logging Strategy:**
- Error logs: All errors with stack traces
- Access logs: API requests and responses
- Audit logs: Security-related events
- Performance logs: Slow queries and operations

### Analytics Implementation

```typescript
// Analytics service for tracking user behavior
class AnalyticsService {
  trackEvent(event: string, properties: Record<string, any>) {
    // Track user interactions
    // Respect user privacy settings
    // Anonymize sensitive data
  }
  
  trackUserJourney(userId: string, step: string) {
    // Track user onboarding progress
    // Identify drop-off points
    // Optimize conversion funnel
  }
}
```

---

## Deployment Specifications

### Environment Configuration

**Development:**
- Local Supabase instance
- Mock external APIs
- Debug logging enabled
- Hot reloading

**Staging:**
- Full Supabase project
- Real external API integrations
- Production-like data
- Performance monitoring

**Production:**
- Optimized Supabase configuration
- CDN integration
- Monitoring and alerting
- Automated backups

### CI/CD Pipeline

```yaml
# GitHub Actions workflow
name: Deploy LoveMatch Thailand
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test
      - name: Security scan
        run: npm audit

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: expo publish --release-channel staging
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Deploy to production
        run: expo publish --release-channel production
```

### Backup Strategy

**Database Backups:**
- Automated daily backups
- Point-in-time recovery
- Cross-region replication
- 30-day retention

**File Storage Backups:**
- Automated backup to secondary region
- Version control for critical files
- 90-day retention for user content

**Disaster Recovery:**
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Automated failover procedures
- Regular disaster recovery testing

---

This technical specification provides the foundation for implementing LoveMatch Thailand's core features with enterprise-grade security, performance, and scalability requirements.