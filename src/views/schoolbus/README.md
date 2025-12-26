# School Bus Management System - UI Pages

This directory contains all the UI pages for the School Bus Management System based on the functional requirements specification.

## 📋 Pages Overview

### 1. **School Bus Dashboard** (`SchoolBusDashboard.jsx`)
- **Purpose**: Main landing page with overview of all modules
- **Features**:
  - Module navigation cards
  - System overview and key features
  - Quick access to all functionalities

### 2. **Parent Tracking** (`ParentTracking.jsx`)
- **Purpose**: Real-time bus tracking for parents
- **Features**:
  - Real-time bus location display (map integration required)
  - Student information display
  - Bus information with driver details
  - Geofence alerts:
    - Bus within 3 km of designated stop
    - Bus arrived at designated stop
    - Bus departed from designated stop
  - ETA to designated stop
  - Important notes and restrictions

### 3. **School Bus Tagging** (`SchoolBusTagging.jsx`)
- **Purpose**: Tag vehicles to school with SMS-based OTP validation
- **Features**:
  - 4-step tagging process:
    1. Request Tag (enter vehicle registration number)
    2. OTP Validation (SMS-based)
    3. Upload Documents (mandatory documents)
    4. Approval (State Admin review)
  - System restrictions display
  - Tagged vehicles table with status
  - Required documents:
    - School Bus Permit
    - Request letter from School Principal
    - Vehicle Registration Certificates (RCs)
    - Authorization letter from vehicle owner
    - Skytron VLTD fitment receipt

### 4. **Route Management** (`RouteManagement.jsx`)
- **Purpose**: Create and manage bus routes and bus stops
- **Features**:
  - Create new bus routes
  - Add/edit/remove bus stops with geo-coordinates (latitude-longitude)
  - Route visualization (map integration required)
  - Bus stop management with timing
  - Route details (total stops, distance, status)

### 5. **Bus Assignment** (`BusAssignment.jsx`)
- **Purpose**: Assign and reassign buses to routes
- **Features**:
  - Assign buses to routes
  - Reassign buses to different routes
  - Untag buses from routes
  - Statistics cards (assigned, unassigned, total routes)
  - Bus assignment table with driver information
  - System restrictions (only pre-registered vehicles)

### 6. **Profile Management** (`ProfileManagement.jsx`)
- **Purpose**: Manage parent and student profiles
- **Features**:
  - Two tabs: Parent Profiles and Student Profiles
  - **Parent Profiles**:
    - Create parent user profiles
    - Capture geo-location (latitude-longitude)
    - Contact information (email, mobile)
    - Address with geo-coordinates
  - **Student Profiles**:
    - Create student profiles
    - Link to parent accounts (one or more students per parent)
    - Class, section, roll number
    - Designated bus stop assignment
  - Statistics display

## 🎨 Design Features

All pages follow the existing Skytron UI design system:

- **Material-UI Components**: Using `MainCard`, `Card`, `Typography`, etc.
- **Theme Colors**: 
  - Primary: `#2196f3` (Blue)
  - Secondary: `#673ab7` (Purple)
  - Success: `#00e676` (Green)
  - Warning: `#ffc107` (Yellow)
  - Error: `#f44336` (Red)
- **Consistent Layout**: Clean, professional design with proper spacing
- **Responsive**: Mobile-friendly grid layouts
- **Icons**: Material-UI icons for visual clarity
- **Alerts**: Informational alerts for important notes and restrictions

## 🔌 Integration Points

### API Integration Required
All pages currently use mock data. The following API endpoints need to be integrated:

1. **Parent Tracking**:
   - `GET /api/schoolbus/tracking/:studentId` - Get real-time bus location
   - `GET /api/schoolbus/alerts/:parentId` - Get geofence alerts

2. **School Bus Tagging**:
   - `POST /api/schoolbus/tag/request` - Request vehicle tagging
   - `POST /api/schoolbus/tag/validate-otp` - Validate OTP
   - `POST /api/schoolbus/tag/upload-documents` - Upload documents
   - `GET /api/schoolbus/tagged-vehicles` - Get tagged vehicles list

3. **Route Management**:
   - `GET /api/schoolbus/routes` - Get all routes
   - `POST /api/schoolbus/routes` - Create new route
   - `PUT /api/schoolbus/routes/:id` - Update route
   - `DELETE /api/schoolbus/routes/:id` - Delete route
   - `POST /api/schoolbus/routes/:id/stops` - Add bus stop
   - `PUT /api/schoolbus/stops/:id` - Update bus stop
   - `DELETE /api/schoolbus/stops/:id` - Delete bus stop

4. **Bus Assignment**:
   - `GET /api/schoolbus/buses` - Get all buses
   - `POST /api/schoolbus/assign` - Assign bus to route
   - `PUT /api/schoolbus/reassign/:busId` - Reassign bus
   - `DELETE /api/schoolbus/untag/:busId` - Untag bus from route

5. **Profile Management**:
   - `GET /api/schoolbus/parents` - Get all parents
   - `POST /api/schoolbus/parents` - Create parent profile
   - `PUT /api/schoolbus/parents/:id` - Update parent profile
   - `DELETE /api/schoolbus/parents/:id` - Delete parent profile
   - `GET /api/schoolbus/students` - Get all students
   - `POST /api/schoolbus/students` - Create student profile
   - `PUT /api/schoolbus/students/:id` - Update student profile
   - `DELETE /api/schoolbus/students/:id` - Delete student profile

### Map Integration Required
The following pages require map integration:

1. **Parent Tracking**: Real-time bus location display
2. **Route Management**: Route and bus stop visualization

Recommended: Use the existing `BhuvanMapComponent` from the codebase.

## 📝 System Restrictions (As Per Specification)

1. **VLTD Requirements**:
   - Schools shall NOT be permitted to request tagging of vehicles that do not already have a VLTD fitted, activated, and uploaded in the Skytron portal

2. **Vehicle Selection**:
   - The system shall allow selection only from pre-registered vehicle registration numbers available in the platform

3. **Parent Tracking**:
   - Parents can view the real-time location of the school bus only during an active trip
   - Off-day or non-operational buses shall not be visible or trackable

4. **Geofence Alerts**:
   - Parents shall receive alerts for their designated stop only
   - Alerts triggered when bus is within 3 km of designated stop
   - Alerts when bus arrives at designated stop
   - Alerts when bus departs from designated stop

## 🚀 Usage

Import and use the components in your routing configuration:

```javascript
import {
  SchoolBusDashboard,
  ParentTracking,
  SchoolBusTagging,
  RouteManagement,
  BusAssignment,
  ProfileManagement
} from './views/schoolbus';

// In your routes configuration
{
  path: '/schoolbus',
  element: <SchoolBusDashboard />
},
{
  path: '/schoolbus/parent-tracking',
  element: <ParentTracking />
},
{
  path: '/schoolbus/bus-tagging',
  element: <SchoolBusTagging />
},
{
  path: '/schoolbus/route-management',
  element: <RouteManagement />
},
{
  path: '/schoolbus/bus-assignment',
  element: <BusAssignment />
},
{
  path: '/schoolbus/profile-management',
  element: <ProfileManagement />
}
```

## 📦 Dependencies

All pages use existing project dependencies:
- `@mui/material` - Material-UI components
- `@mui/icons-material` - Material-UI icons
- `react-router-dom` - Navigation
- Existing UI components from `src/ui-component/cards/MainCard`

## 🎯 Next Steps

1. **Integrate APIs**: Replace mock data with actual API calls
2. **Add Map Components**: Integrate map functionality for tracking and route visualization
3. **Add Form Validation**: Implement proper form validation using Formik or React Hook Form
4. **Add State Management**: Consider using Redux or Context API for state management
5. **Add Error Handling**: Implement proper error handling and user feedback
6. **Add Loading States**: Add loading indicators for async operations
7. **Testing**: Add unit and integration tests

## 📄 License

This code is part of the Skytron Frontend application.
