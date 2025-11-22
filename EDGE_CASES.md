# Edge Cases & Test Scenarios

## 1. File Upload Edge Cases
- [ ] Empty file (0 bytes)
- [ ] Corrupted image file
- [ ] Non-image file (PDF, TXT, etc.)
- [ ] Extremely large file (>50MB)
- [ ] Unsupported format (BMP, TIFF, etc.)
- [ ] File without extension
- [ ] Multiple files uploaded simultaneously
- [ ] Network timeout during upload
- [ ] Duplicate file uploads

## 2. User Input Edge Cases
- [ ] Empty phone/email field
- [ ] Invalid phone format (letters, special chars)
- [ ] Invalid email format
- [ ] Phone number too short/long
- [ ] SQL injection attempts
- [ ] XSS script injection
- [ ] Unicode/emoji in inputs
- [ ] Very long text inputs (>10000 chars)

## 3. Language Toggle Edge Cases
- [ ] Switching language mid-upload
- [ ] Missing translations
- [ ] RTL language support
- [ ] Special characters in Hindi text
- [ ] Language persistence across sessions

## 4. API Edge Cases
- [ ] API timeout (>30s)
- [ ] API returns 500 error
- [ ] API returns malformed JSON
- [ ] Network disconnection
- [ ] Rate limiting (too many requests)
- [ ] Concurrent requests
- [ ] Missing required parameters
- [ ] Invalid defect type query

## 5. Database Edge Cases
- [ ] Database connection failure
- [ ] Duplicate user creation
- [ ] Missing foreign key relations
- [ ] Transaction rollback scenarios
- [ ] Concurrent writes
- [ ] Database migration failures

## 6. Authentication Edge Cases
- [ ] Expired session
- [ ] Invalid user token
- [ ] User role mismatch
- [ ] Accessing boss-only routes as worker
- [ ] Multiple login sessions
- [ ] Logout during active upload

## 7. Browser/Device Edge Cases
- [ ] Offline mode
- [ ] Low memory devices
- [ ] Slow network (2G/3G)
- [ ] Browser back button during upload
- [ ] Page refresh during processing
- [ ] Multiple tabs open
- [ ] Incognito/private mode
- [ ] Disabled JavaScript
- [ ] Disabled cookies/localStorage

## 8. AI Processing Edge Cases
- [ ] Image with no defects
- [ ] Image with multiple defects
- [ ] Blurry/low quality image
- [ ] Image too dark/bright
- [ ] Wrong object in image (not weld/wafer)
- [ ] Model loading failure
- [ ] Model inference timeout
- [ ] Confidence score = 0
- [ ] Confidence score = 100

## 9. Results Display Edge Cases
- [ ] Zero carbon savings
- [ ] Negative benchmark values
- [ ] Missing tip data
- [ ] Very long tip text
- [ ] Score > 100 or < 0
- [ ] NaN or Infinity values

## 10. Reports Edge Cases
- [ ] No data for selected month
- [ ] Future month selected
- [ ] Invalid date format
- [ ] PDF generation failure
- [ ] Empty report data
- [ ] Very large dataset (>10000 records)
