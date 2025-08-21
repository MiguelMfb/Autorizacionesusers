# User Management App

A comprehensive React application for managing users, authorizations, and services. This enterprise-grade application provides a robust interface for handling user data, authorizations, and service management with advanced filtering, sorting, and detailed views.

## Features

### User Management
- **User Management View** (`/components/UserManagementView.tsx`)
  - Advanced filtering by dependency and search terms
  - Sortable columns for all user attributes
  - Pagination with configurable items per page
  - Quick access to user details
  - Status indicators for service requests and authorization validity
  - Unified user management interface
  - Comprehensive user actions (View Details, Edit, Delete)
  - Real-time validation and updates

### Authorization Management
- **Authorization Management View** (`/components/AuthorizationManagementView.tsx`)
  - Advanced filtering system:
    - Date range selection
    - Identification search
    - MiPres number filtering
    - Dependency filtering
    - Authorization status filtering
  - Export capabilities (print and spreadsheet)
  - Detailed authorization tracking
  - Service counting and monitoring
  - Validity period management

### User Detail View
- **User Detail View** (`/components/UserDetailView.tsx`)
  - Comprehensive user information display
  - Authorization history
  - Service tracking
  - Detailed metrics and status indicators

### Edit User Modal
- **Edit User Modal** (`/components/EditUserModal.tsx`)
  - Comprehensive form for user data editing
  - Real-time validation
  - Authorization period management
  - Service configuration
  - Tarifa selection with autocomplete
  - Toggle switches for boolean values

### Navigation
- **Sidebar** (`/components/Sidebar.tsx`)
  - Collapsible navigation menu
  - Hierarchical menu structure
  - Active item highlighting
  - Quick access to all application sections

## Technical Stack

### Core Technologies
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling

### Key Dependencies
- `@headlessui/react`: Accessible UI components
- `lucide-react`: Icon system
- `react-datepicker`: Date selection
- `react-select`: Enhanced dropdowns

### Development Tools
- ESLint for code quality
- TypeScript for type safety
- Autoprefixer for CSS compatibility
- PostCSS for CSS processing

## Project Structure

```
/src
├── components/
│   ├── AuthorizationManagementView.tsx
│   ├── EditUserModal.tsx
│   ├── Sidebar.tsx
│   ├── UserDetailView.tsx
│   └── UserManagementView.tsx
├── types/
│   └── index.ts
├── utils/
│   └── api.ts
├── App.tsx
├── index.css
└── main.tsx
```

## Component Details

### UserManagementView
- Main user management interface
- CRUD operations
- Status tracking
- Service management
- Advanced filtering and sorting
- Action menu for each user (Details, Edit, Delete)
- Integrated user list and management features

### AuthorizationManagementView
- Manages authorization records
- Advanced filtering capabilities
- Sortable data grid
- Export functionality
- Pagination system

### UserDetailView
- Authorization history
- Service tracking
- Filtering capabilities
- Detailed user information

### EditUserModal
- Form validation
- Real-time updates
- Date range selection
- Service configuration
- Authorization management

### Sidebar
- Responsive design
- Collapsible interface
- Nested navigation
- Active state management

## Types and Interfaces

### Key Types
- `User`: Core user data structure
- `Authorization`: Authorization record structure
- `UserListSummary`: Condensed user information
- `UserAuthorizationDetail`: Detailed authorization data

### Utility Types
- `SortConfig`: Sorting configuration
- `PaginationConfig`: Pagination settings
- `Option`: Select option structure
- `FetchParams`: API request parameters

## API Integration

### Core Functions
- `fetchUsers`: Retrieve user data
- `fetchAuthorizations`: Get authorization records
- `saveUser`: Update user information
- `deleteUser`: Remove user records
- `lookupTarifas`: Tarifa search functionality

### Mock Data
- Simulated API responses
- Realistic data structures
- Pagination handling
- Filter implementation

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Implement proper error handling
- Maintain consistent naming conventions

### Component Structure
- Functional components with hooks
- Proper prop typing
- Clear separation of concerns
- Reusable utility functions

### State Management
- Local state with useState
- Complex state with useReducer
- Memoization with useMemo and useCallback
- Side effects with useEffect

### UI/UX Principles
- Responsive design
- Accessible components
- Consistent styling
- Clear user feedback

## Future Enhancements

- Real-time updates
- Advanced search capabilities
- Report generation
- User activity tracking
- Service scheduling
- Integration with external systems