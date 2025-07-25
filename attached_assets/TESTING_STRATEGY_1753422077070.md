# LoveMatch Thailand - Testing Strategy

## Testing Overview

This document outlines the comprehensive testing strategy for LoveMatch Thailand, ensuring high-quality, secure, and reliable dating application delivery.

## Testing Pyramid

```
                    ┌─────────────────┐
                    │   E2E Tests     │ (10%)
                    │   UI Tests      │
                    └─────────────────┘
                  ┌───────────────────────┐
                  │  Integration Tests    │ (20%)
                  │  API Tests           │
                  └───────────────────────┘
              ┌─────────────────────────────────┐
              │        Unit Tests               │ (70%)
              │   Component Tests              │
              └─────────────────────────────────┘
```

---

## Unit Testing Strategy

### Frontend Unit Tests (React Native/React)

**Testing Framework:** Jest + React Native Testing Library

**Coverage Requirements:**
- Minimum 80% code coverage
- 100% coverage for critical business logic
- All utility functions and helpers

**Test Categories:**

#### Component Tests
```typescript
// Example: SwipeCard component test
import { render, fireEvent } from '@testing-library/react-native';
import SwipeCard from '../components/SwipeCard';

describe('SwipeCard', () => {
  const mockUser = {
    id: '1',
    name: 'Test User',
    age: 25,
    videoUrl: 'https://example.com/video.mp4'
  };

  it('should render user information correctly', () => {
    const { getByText } = render(<SwipeCard user={mockUser} />);
    expect(getByText('Test User, 25')).toBeTruthy();
  });

  it('should handle swipe gestures', () => {
    const onSwipe = jest.fn();
    const { getByTestId } = render(
      <SwipeCard user={mockUser} onSwipe={onSwipe} />
    );
    
    fireEvent(getByTestId('swipe-card'), 'onSwipeRight');
    expect(onSwipe).toHaveBeenCalledWith('like', mockUser.id);
  });
});
```

#### Service Tests
```typescript
// Example: Authentication service test
import AuthService from '../services/AuthService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign up user with valid credentials', async () => {
    const mockResponse = { user: { id: '1' }, error: null };
    (supabase.auth.signUp as jest.Mock).mockResolvedValue(mockResponse);

    const result = await AuthService.signUp('test@example.com', 'password123');
    
    expect(result.user).toBeDefined();
    expect(result.error).toBeNull();
  });

  it('should handle sign up errors', async () => {
    const mockError = { message: 'Email already exists' };
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({ 
      user: null, 
      error: mockError 
    });

    const result = await AuthService.signUp('test@example.com', 'password123');
    
    expect(result.user).toBeNull();
    expect(result.error).toEqual(mockError);
  });
});
```

#### Utility Function Tests
```typescript
// Example: Matching algorithm test
import { calculateCompatibilityScore } from '../utils/matching';

describe('calculateCompatibilityScore', () => {
  const user1 = {
    age: 25,
    interests: ['music', 'travel', 'food'],
    location: 'Bangkok'
  };

  const user2 = {
    age: 27,
    interests: ['music', 'movies', 'food'],
    location: 'Bangkok'
  };

  it('should calculate compatibility score correctly', () => {
    const score = calculateCompatibilityScore(user1, user2);
    
    // Age compatibility: 0.9 (2 years difference)
    // Interest overlap: 0.67 (2/3 common interests)
    // Location match: 1.0 (same city)
    // Expected score: ~0.85
    
    expect(score).toBeGreaterThan(0.8);
    expect(score).toBeLessThan(0.9);
  });
});
```

### Backend Unit Tests (Supabase Edge Functions)

**Testing Framework:** Deno Test

```typescript
// Example: Edge function test
import { assertEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import { handler } from "../supabase/functions/match-users/index.ts";

Deno.test("match-users function", async () => {
  const request = new Request("http://localhost:8000/match-users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: "user1",
      preferences: { ageRange: [20, 30], maxDistance: 50 }
    })
  });

  const response = await handler(request);
  const data = await response.json();

  assertEquals(response.status, 200);
  assertEquals(Array.isArray(data.matches), true);
});
```

---

## Integration Testing Strategy

### API Integration Tests

**Testing Framework:** Jest + Supertest

**Test Categories:**

#### Authentication Flow Tests
```typescript
describe('Authentication Integration', () => {
  it('should complete full registration flow', async () => {
    // 1. Sign up user
    const signUpResponse = await request(app)
      .post('/auth/signup')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        fullName: 'Test User',
        age: 25
      });

    expect(signUpResponse.status).toBe(201);
    
    // 2. Verify email (mock)
    const verifyResponse = await request(app)
      .post('/auth/verify')
      .send({ token: 'mock-verification-token' });

    expect(verifyResponse.status).toBe(200);

    // 3. Sign in
    const signInResponse = await request(app)
      .post('/auth/signin')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });

    expect(signInResponse.status).toBe(200);
    expect(signInResponse.body.session).toBeDefined();
  });
});
```

#### Profile Management Tests
```typescript
describe('Profile Management Integration', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Set up authenticated user
    const authResponse = await createTestUser();
    authToken = authResponse.token;
    userId = authResponse.userId;
  });

  it('should upload and process video profile', async () => {
    const videoFile = fs.readFileSync('./test-assets/sample-video.mp4');
    
    const uploadResponse = await request(app)
      .post(`/profile/${userId}/video`)
      .set('Authorization', `Bearer ${authToken}`)
      .attach('video', videoFile, 'profile-video.mp4');

    expect(uploadResponse.status).toBe(200);
    expect(uploadResponse.body.videoUrl).toBeDefined();
    expect(uploadResponse.body.thumbnailUrl).toBeDefined();
  });
});
```

### Database Integration Tests

```typescript
describe('Database Integration', () => {
  beforeEach(async () => {
    // Clean database before each test
    await cleanTestDatabase();
  });

  it('should create user with proper relationships', async () => {
    const user = await createUser({
      email: 'test@example.com',
      fullName: 'Test User'
    });

    // Test user creation
    expect(user.id).toBeDefined();
    
    // Test profile creation
    const profile = await getProfile(user.id);
    expect(profile.email).toBe('test@example.com');
    
    // Test RLS policies
    const otherUserProfile = await getProfileAsUser(user.id, 'other-user-id');
    expect(otherUserProfile).toBeNull(); // Should not access other user's profile
  });
});
```

---

## End-to-End Testing Strategy

### E2E Testing Framework: Detox (React Native) + Playwright (Web)

#### Critical User Journeys

**Journey 1: User Registration and Profile Setup**
```typescript
describe('User Onboarding Journey', () => {
  it('should complete full onboarding process', async () => {
    // 1. Launch app
    await device.launchApp();
    
    // 2. Navigate to sign up
    await element(by.id('signup-button')).tap();
    
    // 3. Fill registration form
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('SecurePass123!');
    await element(by.id('name-input')).typeText('Test User');
    await element(by.id('age-input')).typeText('25');
    
    // 4. Accept terms and sign up
    await element(by.id('terms-checkbox')).tap();
    await element(by.id('signup-submit')).tap();
    
    // 5. Verify email verification screen
    await expect(element(by.text('Check your email'))).toBeVisible();
    
    // 6. Mock email verification
    await mockEmailVerification();
    
    // 7. Complete profile setup
    await element(by.id('upload-video-button')).tap();
    await mockVideoUpload();
    
    // 8. Select interests
    await element(by.id('interest-music')).tap();
    await element(by.id('interest-travel')).tap();
    await element(by.id('complete-profile')).tap();
    
    // 9. Verify main app screen
    await expect(element(by.id('discover-screen'))).toBeVisible();
  });
});
```

**Journey 2: Matching and Messaging**
```typescript
describe('Matching and Messaging Journey', () => {
  beforeAll(async () => {
    await setupTestUsers(); // Create test users for matching
  });

  it('should match users and enable messaging', async () => {
    // 1. Navigate to discover screen
    await element(by.id('discover-tab')).tap();
    
    // 2. Swipe right on a user
    await element(by.id('swipe-card')).swipe('right');
    
    // 3. Check for match notification
    await expect(element(by.text('It\'s a Match!'))).toBeVisible();
    
    // 4. Navigate to chat
    await element(by.id('start-chat-button')).tap();
    
    // 5. Send a message
    await element(by.id('message-input')).typeText('Hello! Nice to meet you!');
    await element(by.id('send-button')).tap();
    
    // 6. Verify message appears
    await expect(element(by.text('Hello! Nice to meet you!'))).toBeVisible();
    
    // 7. Verify message encryption
    await verifyMessageEncryption();
  });
});
```

### Performance E2E Tests

```typescript
describe('Performance Tests', () => {
  it('should load discover screen within 3 seconds', async () => {
    const startTime = Date.now();
    
    await device.launchApp();
    await element(by.id('discover-tab')).tap();
    await waitFor(element(by.id('swipe-card'))).toBeVisible().withTimeout(3000);
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });

  it('should handle video playback smoothly', async () => {
    await element(by.id('discover-tab')).tap();
    await element(by.id('play-video-button')).tap();
    
    // Verify video plays without stuttering
    await expect(element(by.id('video-player'))).toBeVisible();
    await sleep(5000); // Let video play for 5 seconds
    
    // Check for smooth playback (no error states)
    await expect(element(by.id('video-error'))).not.toBeVisible();
  });
});
```

---

## Security Testing Strategy

### Automated Security Tests

#### Authentication Security Tests
```typescript
describe('Authentication Security', () => {
  it('should prevent brute force attacks', async () => {
    const attempts = [];
    
    // Attempt 6 failed logins
    for (let i = 0; i < 6; i++) {
      const response = await request(app)
        .post('/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      attempts.push(response.status);
    }
    
    // First 5 should return 401, 6th should return 429 (rate limited)
    expect(attempts.slice(0, 5)).toEqual([401, 401, 401, 401, 401]);
    expect(attempts[5]).toBe(429);
  });

  it('should validate JWT tokens properly', async () => {
    const invalidToken = 'invalid.jwt.token';
    
    const response = await request(app)
      .get('/profile/me')
      .set('Authorization', `Bearer ${invalidToken}`);
    
    expect(response.status).toBe(401);
  });
});
```

#### Input Validation Tests
```typescript
describe('Input Validation Security', () => {
  it('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/profile/update')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        bio: maliciousInput
      });
    
    // Should sanitize input, not execute SQL
    expect(response.status).toBe(200);
    
    // Verify users table still exists
    const usersExist = await checkTableExists('users');
    expect(usersExist).toBe(true);
  });

  it('should prevent XSS attacks', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const response = await request(app)
      .post('/profile/update')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        bio: xssPayload
      });
    
    expect(response.status).toBe(200);
    
    // Verify script tags are escaped
    const profile = await getProfile(userId);
    expect(profile.bio).not.toContain('<script>');
    expect(profile.bio).toContain('&lt;script&gt;');
  });
});
```

### Manual Security Testing

#### Penetration Testing Checklist
- [ ] Authentication bypass attempts
- [ ] Authorization escalation tests
- [ ] Session management vulnerabilities
- [ ] Input validation bypass
- [ ] File upload security
- [ ] API security testing
- [ ] Mobile app security testing

---

## Performance Testing Strategy

### Load Testing

**Tool:** Artillery.js

```yaml
# load-test-config.yml
config:
  target: 'https://api.lovematch-thailand.com'
  phases:
    - duration: 60
      arrivalRate: 10
    - duration: 120
      arrivalRate: 50
    - duration: 60
      arrivalRate: 100
  defaults:
    headers:
      Authorization: 'Bearer {{ $randomString() }}'

scenarios:
  - name: "User Discovery Flow"
    weight: 70
    flow:
      - get:
          url: "/matches/discover"
      - think: 2
      - post:
          url: "/matches/swipe"
          json:
            targetUserId: "{{ $randomString() }}"
            action: "like"

  - name: "Messaging Flow"
    weight: 30
    flow:
      - get:
          url: "/messages/{{ matchId }}"
      - post:
          url: "/messages/{{ matchId }}"
          json:
            content: "Hello there!"
            messageType: "text"
```

### Stress Testing

```typescript
describe('Stress Tests', () => {
  it('should handle concurrent user registrations', async () => {
    const concurrentUsers = 100;
    const registrationPromises = [];

    for (let i = 0; i < concurrentUsers; i++) {
      registrationPromises.push(
        request(app)
          .post('/auth/signup')
          .send({
            email: `user${i}@example.com`,
            password: 'SecurePass123!',
            fullName: `User ${i}`,
            age: 25
          })
      );
    }

    const results = await Promise.allSettled(registrationPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    
    // Should handle at least 90% of concurrent registrations
    expect(successful).toBeGreaterThan(90);
  });
});
```

---

## Mobile-Specific Testing

### Device Testing Matrix

| Device Category | iOS Versions | Android Versions |
|----------------|--------------|------------------|
| Flagship | 15.0+, 16.0+, 17.0+ | 11, 12, 13, 14 |
| Mid-range | 14.0+, 15.0+ | 10, 11, 12 |
| Budget | 13.0+, 14.0+ | 9, 10, 11 |

### Platform-Specific Tests

#### iOS Tests
```typescript
describe('iOS Specific Features', () => {
  beforeAll(async () => {
    if (device.getPlatform() !== 'ios') {
      pending('iOS only test');
    }
  });

  it('should handle iOS permissions correctly', async () => {
    // Test camera permission
    await element(by.id('upload-video')).tap();
    await expect(element(by.text('Allow Camera Access'))).toBeVisible();
    
    // Grant permission
    await device.grantPermission('camera');
    await element(by.text('OK')).tap();
    
    // Verify camera opens
    await expect(element(by.id('camera-view'))).toBeVisible();
  });
});
```

#### Android Tests
```typescript
describe('Android Specific Features', () => {
  beforeAll(async () => {
    if (device.getPlatform() !== 'android') {
      pending('Android only test');
    }
  });

  it('should handle Android back button', async () => {
    await element(by.id('profile-tab')).tap();
    await element(by.id('edit-profile')).tap();
    
    // Press Android back button
    await device.pressBack();
    
    // Should return to profile screen
    await expect(element(by.id('profile-screen'))).toBeVisible();
  });
});
```

---

## Accessibility Testing

### Automated Accessibility Tests

```typescript
describe('Accessibility Tests', () => {
  it('should have proper accessibility labels', async () => {
    await element(by.id('discover-tab')).tap();
    
    // Check for accessibility labels
    await expect(element(by.id('swipe-card'))).toHaveAccessibilityLabel('User profile card');
    await expect(element(by.id('like-button'))).toHaveAccessibilityLabel('Like this user');
    await expect(element(by.id('pass-button'))).toHaveAccessibilityLabel('Pass on this user');
  });

  it('should support screen readers', async () => {
    // Enable TalkBack/VoiceOver simulation
    await device.enableAccessibility();
    
    await element(by.id('discover-tab')).tap();
    
    // Verify screen reader can navigate
    await element(by.id('swipe-card')).focus();
    await expect(element(by.id('swipe-card'))).toBeFocused();
  });
});
```

---

## Test Data Management

### Test Data Setup

```typescript
// test-data-setup.ts
export class TestDataManager {
  static async createTestUser(overrides = {}) {
    const defaultUser = {
      email: `test-${Date.now()}@example.com`,
      password: 'SecurePass123!',
      fullName: 'Test User',
      age: 25,
      location: 'Bangkok',
      interests: ['music', 'travel']
    };

    return await AuthService.signUp({
      ...defaultUser,
      ...overrides
    });
  }

  static async createTestMatch(user1Id: string, user2Id: string) {
    // Create mutual likes to generate match
    await MatchService.swipe(user1Id, user2Id, 'like');
    await MatchService.swipe(user2Id, user1Id, 'like');
    
    return await MatchService.getMatch(user1Id, user2Id);
  }

  static async cleanupTestData() {
    // Remove all test users and related data
    await supabase
      .from('users')
      .delete()
      .like('email', 'test-%@example.com');
  }
}
```

### Mock Data Services

```typescript
// mock-services.ts
export class MockServices {
  static mockVideoUpload() {
    return {
      videoUrl: 'https://mock-cdn.com/video123.mp4',
      thumbnailUrl: 'https://mock-cdn.com/thumb123.jpg',
      duration: 45,
      moderationStatus: 'approved'
    };
  }

  static mockSocialMediaData() {
    return {
      facebook: {
        id: 'fb123',
        name: 'Test User',
        photos: ['photo1.jpg', 'photo2.jpg']
      },
      instagram: {
        id: 'ig123',
        username: 'testuser',
        media: ['media1.jpg', 'media2.jpg']
      }
    };
  }
}
```

---

## Continuous Integration Testing

### GitHub Actions Workflow

```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:unit
      - run: npm run test:coverage

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run test:integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install
      - run: npm run build
      - run: npm run test:e2e

  security-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm audit
      - run: npm run test:security
      - uses: securecodewarrior/github-action-add-sarif@v1
        with:
          sarif-file: security-results.sarif
```

---

## Test Reporting and Metrics

### Coverage Requirements
- **Unit Tests:** 80% minimum coverage
- **Integration Tests:** 70% API endpoint coverage
- **E2E Tests:** 100% critical user journey coverage

### Quality Gates
- All tests must pass before deployment
- No critical security vulnerabilities
- Performance benchmarks must be met
- Accessibility standards compliance

### Test Metrics Dashboard
- Test execution time trends
- Coverage trends over time
- Flaky test identification
- Performance regression detection

This comprehensive testing strategy ensures LoveMatch Thailand delivers a high-quality, secure, and reliable dating experience for Thai users.