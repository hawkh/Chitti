# Requirements Document

## Introduction

The Simplified Mobile Interface system transforms the existing AI defect detection capabilities into a super-easy, mobile-first application designed specifically for welders and fabrication technicians. The system focuses on maximum simplicity with 1-2 clicks per task, big buttons, Hindi/English language toggle, and a streamlined 5-page structure. The goal is to provide free entry access leading to a dashboard app where users can quickly upload weld or wafer photos for instant "Safe/Fix?" feedback.

## Glossary

- **Chitti_System**: The simplified mobile interface application for AI defect detection
- **Weld_Check**: AI analysis process for welding defect detection
- **Etching_Check**: AI analysis process for semiconductor wafer void detection
- **Worker_Role**: Basic user role with view-only access to results and tips
- **Boss_Role**: Manager role with additional access to downloads and monthly reports
- **Carbon_Save_Tracker**: Feature that calculates and displays environmental impact savings
- **OTP_Login**: One-time password authentication system using phone/email
- **Demo_Mode**: Free trial functionality that works without user registration

## Requirements

### Requirement 1

**User Story:** As a welder or fab tech, I want to quickly upload a photo of my work and get instant feedback, so that I can know if it's safe or needs fixing without technical expertise.

#### Acceptance Criteria

1. WHEN a user accesses the home page, THE Chitti_System SHALL display a prominent upload button within 3 seconds
2. WHEN a user taps the upload button, THE Chitti_System SHALL open camera/gallery options with large, clear icons
3. WHEN a photo is selected, THE Chitti_System SHALL process it and display results within 10 seconds
4. WHEN results are ready, THE Chitti_System SHALL show clear "Safe" or "Fix" status with green/red visual indicators
5. WHEN displaying results, THE Chitti_System SHALL provide simple fix tips in plain language

### Requirement 2

**User Story:** As a small shop owner, I want a free demo mode that works immediately without signup, so that I can try the system before committing to registration.

#### Acceptance Criteria

1. WHEN a visitor lands on the home page, THE Chitti_System SHALL provide "Try Demo" buttons for both weld and etching checks
2. WHEN demo mode is activated, THE Chitti_System SHALL process uploaded photos without requiring user registration
3. WHEN demo results are shown, THE Chitti_System SHALL display a "Sign up for full features" prompt
4. WHEN demo processing completes, THE Chitti_System SHALL limit users to 3 free checks per day
5. IF demo limit is reached, THEN THE Chitti_System SHALL display signup encouragement with benefits

### Requirement 3

**User Story:** As a user who speaks Hindi, I want to toggle between Hindi and English languages, so that I can use the app in my preferred language.

#### Acceptance Criteria

1. WHEN the app loads, THE Chitti_System SHALL display a prominent Hindi/English toggle button
2. WHEN language is changed, THE Chitti_System SHALL update all text content immediately without page reload
3. WHEN Hindi is selected, THE Chitti_System SHALL display all interface text in Hindi script
4. WHEN language preference is set, THE Chitti_System SHALL remember the choice for future visits
5. WHEN voice features are used, THE Chitti_System SHALL support voice input in the selected language

### Requirement 4

**User Story:** As a busy worker, I want super-fast login using just my phone number, so that I can access my dashboard in under 30 seconds.

#### Acceptance Criteria

1. WHEN accessing login, THE Chitti_System SHALL display only phone/email field and role dropdown
2. WHEN phone number is entered, THE Chitti_System SHALL send OTP within 5 seconds
3. WHEN OTP is entered correctly, THE Chitti_System SHALL log user in and redirect to dashboard
4. WHEN role is selected as "Worker", THE Chitti_System SHALL configure interface for basic features
5. WHEN role is selected as "Boss", THE Chitti_System SHALL enable additional download and report features

### Requirement 5

**User Story:** As a worker, I want a simple dashboard with big buttons and instant results, so that I can complete quality checks in under 1 minute per item.

#### Acceptance Criteria

1. WHEN dashboard loads, THE Chitti_System SHALL display upload area covering 50% of screen
2. WHEN toggle is used, THE Chitti_System SHALL switch between "Weld" and "Etching" modes with clear visual feedback
3. WHEN photo is uploaded, THE Chitti_System SHALL show processing spinner with "AI thinking..." message
4. WHEN analysis completes, THE Chitti_System SHALL display score, benchmark comparison, and carbon savings
5. WHEN results are shown, THE Chitti_System SHALL provide actionable tips in simple language

### Requirement 6

**User Story:** As a manager, I want to see environmental impact and cost savings, so that I can justify the system's value to my business.

#### Acceptance Criteria

1. WHEN analysis completes, THE Chitti_System SHALL calculate and display carbon savings with tree icon
2. WHEN displaying savings, THE Chitti_System SHALL show monetary value in rupees (₹)
3. WHEN benchmark is shown, THE Chitti_System SHALL compare user performance to industry average
4. WHEN monthly view is accessed, THE Chitti_System SHALL aggregate total savings and environmental impact
5. IF Boss_Role is active, THEN THE Chitti_System SHALL provide detailed savings breakdown for download

### Requirement 7

**User Story:** As a user, I want to share my success stories with the community, so that I can help other workers learn from my experience.

#### Acceptance Criteria

1. WHEN results are displayed, THE Chitti_System SHALL show optional "Share Story" button
2. WHEN share is selected, THE Chitti_System SHALL open simple form with photo and text area
3. WHEN story is submitted, THE Chitti_System SHALL display "Thanks - your tip helps 100 welders!" message
4. WHEN sharing, THE Chitti_System SHALL keep submissions anonymous by default
5. WHEN story is shared, THE Chitti_System SHALL unlock community tips feature for the user

### Requirement 8

**User Story:** As a boss/manager, I want monthly PDF reports for audits and tenders, so that I can demonstrate quality improvements to clients and regulators.

#### Acceptance Criteria

1. WHEN Boss_Role accesses reports, THE Chitti_System SHALL display calendar picker for month selection
2. WHEN month is selected, THE Chitti_System SHALL generate report showing pass rates, savings, and CO₂ reduction
3. WHEN report is ready, THE Chitti_System SHALL provide "Download PDF" button with clear file icon
4. WHEN PDF is generated, THE Chitti_System SHALL include charts showing trends and improvements
5. IF user is offline, THEN THE Chitti_System SHALL email report link when connection is restored

### Requirement 9

**User Story:** As a mobile user, I want the app to work offline and sync later, so that I can use it in areas with poor network connectivity.

#### Acceptance Criteria

1. WHEN network is unavailable, THE Chitti_System SHALL save uploaded photos locally for later processing
2. WHEN connection is restored, THE Chitti_System SHALL automatically sync pending uploads
3. WHEN offline mode is active, THE Chitti_System SHALL display clear "Offline - will sync later" indicator
4. WHEN cached results exist, THE Chitti_System SHALL display them immediately even when offline
5. WHEN sync completes, THE Chitti_System SHALL notify user of successful upload and processing

### Requirement 10

**User Story:** As a user with limited technical skills, I want voice guidance and simple visual feedback, so that I can use the app without reading complex instructions.

#### Acceptance Criteria

1. WHEN user enables voice mode, THE Chitti_System SHALL provide spoken instructions for each step
2. WHEN photo quality is poor, THE Chitti_System SHALL give voice feedback like "Move closer" or "More light needed"
3. WHEN results are ready, THE Chitti_System SHALL use large icons and color coding for instant understanding
4. WHEN errors occur, THE Chitti_System SHALL provide helpful voice guidance for resolution
5. WHEN processing is complete, THE Chitti_System SHALL play success sound and show celebration animation