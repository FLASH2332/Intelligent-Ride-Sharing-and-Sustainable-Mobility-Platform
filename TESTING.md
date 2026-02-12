# Unit Testing Guide

This project uses **three different testing tools** for comprehensive test coverage:

## Backend Testing Stack

### Tools Used:
1. **Jest** - JavaScript testing framework
2. **Supertest** - HTTP assertions for API testing  
3. **Sinon** - Test spies, stubs, and mocks

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Files Created:

- **`src/utils/passwordValidator.test.js`** - Unit tests for password validation logic
  - Tests all password strength requirements
  - Edge cases (empty, null, undefined)
  - Multiple valid/invalid password formats

- **`src/services/token.service.test.js`** - Unit tests for JWT token generation
  - Token creation with correct payload
  - JWT secret validation
  - Token expiration verification
  - Uses **Sinon** for mocking jwt.sign

- **`src/controllers/authController.test.js`** - Integration tests for authentication API
  - Uses **Supertest** for HTTP testing
  - Tests registration endpoint validation
  - Tests login endpoint
  - Mocks database models with **Sinon**

### Example Test Output:
```
PASS  src/utils/passwordValidator.test.js
PASS  src/services/token.service.test.js
PASS  src/controllers/authController.test.js

Test Suites: 3 passed, 3 total
Tests:       30 passed, 30 total
```

---

##  Frontend Testing Stack

### Tools Used:
1. **Vitest** - Fast unit test framework (Vite-native)
2. **React Testing Library** - Test React components
3. **@testing-library/user-event** - Simulate user interactions

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Test Files Created:

- **`src/components/InputField.test.jsx`** - Component tests for InputField
  - Rendering labels and placeholders
  - Required field indicators
  - User input simulation with **user-event**
  - onChange handler verification
  - Styling and accessibility

- **`src/components/FeatureCard.test.jsx`** - Component tests for FeatureCard
  - Icon, title, and description rendering
  - CSS class verification
  - Hover effects and transitions
  - Multiple card instances

- **`src/utils/auth.test.js`** - Unit tests for authentication utilities
  - localStorage interactions
  - Token retrieval and validation
  - isAuthenticated logic
  - Logout functionality and redirects
  - Complete auth flow integration test

### Example Test Output:
```
✓ src/components/InputField.test.jsx (10 tests)
✓ src/components/FeatureCard.test.jsx (9 tests)
✓ src/utils/auth.test.js (11 tests)

Test Files  3 passed (3)
Tests  30 passed (30)
```

---

##  Coverage Reports

### Backend Coverage
```bash
cd backend
npm run test:coverage
```
Coverage report will be generated in `backend/coverage/`

### Frontend Coverage
```bash
cd frontend
npm run test:coverage
```
Coverage report will be generated in `frontend/coverage/`

---

##  What's Being Tested

### Backend:
 Password validation logic  
 JWT token generation and verification  
 Authentication API endpoints  
 Database model interactions (mocked)  
 Error handling and validation  

### Frontend:
 Component rendering  
 User interactions (typing, clicking)  
 Form input handling  
 Authentication state management  
 localStorage operations  
 CSS styling and classes  

---

##  Next Steps

### Expand Backend Testing:
- Add tests for remaining controllers (ride, trip, user)
- Test middleware (auth, platform, orgAdmin)
- Test socket.io events (rideSocket, trackingSocket)
- Add database integration tests with test database

### Expand Frontend Testing:
- Test more complex components (MapView, LiveTrackingMap)
- Test page components (Login, Signup, Dashboard)
- Test routing and navigation
- Add E2E tests with Playwright or Cypress

---

##  Best Practices

1. **Write tests first** (TDD approach) or alongside features
2. **Test user behavior**, not implementation details
3. **Mock external dependencies** (APIs, databases, third-party libraries)
4. **Aim for 80%+ code coverage**
5. **Keep tests isolated** - each test should be independent
6. **Use descriptive test names** - describe what's being tested and expected outcome

---

##  Troubleshooting

### Backend Issues:
```bash
# If Jest fails with ES modules
export NODE_OPTIONS=--experimental-vm-modules

# Clear Jest cache
npx jest --clearCache
```

### Frontend Issues:
```bash
# If Vitest can't find modules
npm install --save-dev @vitest/ui

# Clear Vitest cache
npx vitest --clearCache
```

---

## 📚 Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Sinon Documentation](https://sinonjs.org/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)

