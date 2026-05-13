# SkyManage Class Diagrams

This directory contains comprehensive class diagrams for the SkyManage project management platform, created using PlantUML. These diagrams provide detailed insights into the system's architecture, component relationships, and data models.

## Diagram Overview

### 1. Main Architecture Class Diagram (`main-architecture-class-diagram.puml`)
**Purpose**: High-level system architecture overview
**Scope**: Complete frontend-backend integration
**Key Components**:
- Frontend React components and structure
- Backend Express server and API
- Database layer (Firestore & MongoDB)
- External services integration
- Data flow and dependencies

### 2. Frontend Components Class Diagram (`frontend-components-class-diagram.puml`)
**Purpose**: Detailed React component architecture
**Scope**: Frontend application structure
**Key Components**:
- Main application components (App, Layout, Login)
- Page components (Dashboard, Projects, Settings, etc.)
- UI components (KanbanBoard, TaskModal, FileUploader, etc.)
- Custom React hooks (useAuth, useProjects, useTasks, etc.)
- Component props and interfaces
- State management patterns

### 3. Backend Services Class Diagram (`backend-services-class-diagram.puml`)
**Purpose**: Backend API and service architecture
**Scope**: Server-side implementation
**Key Components**:
- Express server setup and middleware
- API controllers and routing
- Service layer architecture
- Database connections and management
- External API integrations
- Error handling and logging

### 4. Data Models and Interfaces Class Diagram (`data-models-interfaces-class-diagram.puml`)
**Purpose**: Complete data model definitions
**Scope**: Data structures and type definitions
**Key Components**:
- Core data models (User, Project, Task, Comment, etc.)
- Supporting models (ProjectMember, FileAttachment, Invitation, etc.)
- Enums and type definitions
- Interface definitions for contracts
- AI and analytics models
- Configuration models

### 5. Authentication and Security Class Diagram (`authentication-security-class-diagram.puml`)
**Purpose**: Security and authentication architecture
**Scope**: Complete security implementation
**Key Components**:
- Authentication system (Firebase integration)
- Security middleware and guards
- User management and roles
- Security services (encryption, hashing, validation)
- Threat detection and audit logging
- Session management

## How to View These Diagrams

### Option 1: Online PlantUML Server (Recommended)
1. Go to [http://www.plantuml.com/plantuml/](http://www.plantuml.com/plantuml/)
2. Copy the contents of any `.puml` file
3. Paste it into the text area
4. Click "Generate" to view the diagram

### Option 2: VS Code Extension
1. Install the "PlantUML" extension by jebbs in VS Code
2. Open any `.puml` file
3. Use the preview command (Ctrl+Shift+P → "PlantUML: Preview")
4. Or use the Alt+D shortcut

### Option 3: Local PlantUML Installation
1. Install Java if not already installed
2. Download PlantUML from [https://plantuml.com/download](https://plantuml.com/download)
3. Run: `java -jar plantuml.jar class-diagrams/*.puml`
4. This will generate PNG files for all diagrams

### Option 4: Docker
```bash
docker run --rm -v $(pwd):/data plantuml/plantuml -tpng class-diagrams/*.puml
```

## Diagram Features

### Visual Elements
- **Classes**: Represent actual implementation classes
- **Interfaces**: Define contracts and abstractions
- **Enums**: Type-safe enumerations
- **Packages**: Logical grouping of related components
- **Relationships**: Associations, dependencies, inheritance, composition

### Color Coding
- **Main Architecture**: Light Blue classes
- **Frontend Components**: Light Cyan classes
- **Backend Services**: Light Yellow classes
- **Data Models**: Light Pink classes
- **Authentication/Security**: Light Salmon classes
- **Interfaces**: Light Green backgrounds

### Relationship Types
- **-->**: Association/dependency
- **--**: Composition (strong ownership)
- **..>**: Implementation/realization
- **<|--**: Inheritance/generalization
- ******: Aggregation (weak ownership)

## Technical Implementation Details

### Frontend Architecture
- **React 19** with TypeScript
- **Custom Hooks** for state management
- **Component Composition** patterns
- **Props Interface** definitions
- **Service Integration** via hooks

### Backend Architecture
- **Express.js** with TypeScript
- **Middleware Pattern** for security and validation
- **Service Layer** abstraction
- **Repository Pattern** for data access
- **Dependency Injection** principles

### Data Layer
- **Firebase Firestore** for real-time data
- **MongoDB Atlas** for analytics and logs
- **Type-safe Models** with interfaces
- **Validation Rules** and constraints
- **Audit Trail** implementation

### Security Implementation
- **Firebase Authentication** integration
- **JWT Token** management
- **Role-Based Access Control** (RBAC)
- **Session Management** with timeouts
- **Security Auditing** and logging

## Code Mapping

### Frontend Components Referenced
- `App.tsx` - Main application component
- `Layout.tsx` - Application layout and navigation
- `Dashboard.tsx` - Project overview and analytics
- `Projects.tsx` - Project management interface
- `useAuth.tsx` - Authentication hook
- `useFirestore.ts` - Database operations hook
- `types/index.ts` - TypeScript type definitions

### Backend Components Referenced
- `server.ts` - Express server setup
- API routes and controllers
- Middleware implementations
- Service layer abstractions
- Database connection management

### External Services
- **Firebase** - Authentication and Firestore
- **MongoDB Atlas** - Data persistence
- **AWS S3** - File storage
- **Google Generative AI** - AI features
- **Resend** - Email services

## Design Patterns Used

### Frontend Patterns
- **Custom Hooks Pattern** - Logic reuse and state management
- **Component Composition** - Flexible UI building
- **Props Interface Pattern** - Type safety
- **Observer Pattern** - Real-time updates via hooks

### Backend Patterns
- **Middleware Pattern** - Request processing pipeline
- **Repository Pattern** - Data access abstraction
- **Service Layer Pattern** - Business logic separation
- **Dependency Injection** - Loose coupling

### Data Patterns
- **Active Record Pattern** - Model with persistence
- **Data Transfer Objects** - API communication
- **Specification Pattern** - Query building
- **Audit Pattern** - Change tracking

## Security Considerations

### Authentication Flow
1. **Firebase Auth** for user authentication
2. **JWT Tokens** for session management
3. **Token Refresh** for extended sessions
4. **Multi-provider Support** (Google, Email/Password)

### Authorization Model
1. **Role-Based Access Control** (RBAC)
2. **Permission-Based Authorization**
3. **Resource-Level Security**
4. **Team-Based Access Control**

### Security Features
1. **Input Validation** and sanitization
2. **Rate Limiting** for API protection
3. **CSRF Protection** for web forms
4. **Security Headers** for HTTP responses
5. **Audit Logging** for compliance

## Performance Considerations

### Frontend Optimizations
- **React.memo** for component memoization
- **useMemo/useCallback** for expensive operations
- **Lazy Loading** for code splitting
- **Real-time Updates** via Firestore listeners

### Backend Optimizations
- **Connection Pooling** for database
- **Caching Strategies** for frequent queries
- **Batch Operations** for bulk updates
- **Async/Await** for non-blocking I/O

### Database Optimizations
- **Indexing Strategies** for query performance
- **Composite Indexes** for complex queries
- **Data Normalization** for consistency
- **Caching Layers** for hot data

## Future Enhancements

### Planned Architecture Improvements
- **Microservices Architecture** for scalability
- **Event-Driven Architecture** for decoupling
- **GraphQL API** for efficient data fetching
- **CQRS Pattern** for read/write separation

### Additional Diagrams
- **Sequence Diagrams** for user workflows
- **Component Diagrams** for deployment
- **Deployment Diagrams** for infrastructure
- **State Machine Diagrams** for complex flows

## Contributing Guidelines

### When Modifying Diagrams
1. **Maintain Consistency** with existing styling
2. **Update Relationships** when adding new components
3. **Document Changes** in this README
4. **Validate Syntax** using PlantUML tools
5. **Test Rendering** after modifications

### Adding New Components
1. **Define Interfaces** first for contracts
2. **Implement Classes** with proper inheritance
3. **Add Relationships** to existing components
4. **Update Package Groupings** if needed
5. **Document Purpose** and responsibilities

## Troubleshooting

### Common Issues
- **Syntax Errors** - Check PlantUML syntax validation
- **Rendering Issues** - Try different rendering tools
- **Large Diagrams** - Split into smaller diagrams
- **Missing Relationships** - Verify component connections

### Performance Tips
- **Limit Diagram Size** for better rendering
- **Use Package Grouping** for organization
- **Optimize Layout** for readability
- **Test Different Renderers** for best results

## Support and Resources

### PlantUML Documentation
- [Official PlantUML Website](https://plantuml.com/)
- [PlantUML Syntax Guide](https://plantuml.com/zh/syntax-reference)
- [Class Diagram Documentation](https://plantuml.com/class-diagram)

### SkyManage Resources
- [Project Repository](https://github.com/your-org/skymanage)
- [API Documentation](./api-docs/)
- [Development Guide](./development-guide/)
- [Security Guidelines](./security-guide/)

For questions or issues with these diagrams, please refer to the project documentation or create an issue in the repository.
