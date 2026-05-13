# SkyManage Use Case Diagrams

This directory contains comprehensive use case diagrams for the SkyManage project management platform, created using PlantUML.

## Diagram Overview

### 1. Main Use Case Diagram (`main-use-case-diagram.puml`)
**Purpose**: High-level overview of the entire SkyManage platform
**Actors**: User, Project Manager, Team Member, Administrator, AI System
**Key Features**:
- Authentication and profile management
- Project and task management
- Collaboration features
- AI-powered analytics
- System administration

### 2. Authentication System (`authentication-use-cases.puml`)
**Purpose**: Detailed authentication and security features
**Actors**: Unauthenticated User, Authenticated User, System Administrator, Firebase Auth, Email Service
**Key Features**:
- User registration and login
- Password management
- Profile management
- Session management
- Security features (2FA, email verification)
- Admin user management

### 3. Project Management Features (`project-management-use-cases.puml`)
**Purpose**: Core project management functionality
**Actors**: Project Manager, Team Member, Stakeholder, System
**Key Features**:
- Project lifecycle management
- Task management and Kanban boards
- Milestone and sprint planning
- Resource management
- Project documentation

### 4. Collaboration Features (`collaboration-use-cases.puml`)
**Purpose**: Team collaboration and communication
**Actors**: Team Member, Project Manager, External Collaborator, Email Service, File Storage
**Key Features**:
- Invitation system
- Real-time communication
- Comments and mentions
- File sharing and collaboration
- Activity tracking
- Notification system
- Access control

### 5. AI Features & Analytics (`ai-analytics-use-cases.puml`)
**Purpose**: AI-powered features and data analytics
**Actors**: Project Manager, Team Member, Data Analyst, AI System, External AI Service
**Key Features**:
- AI task recommendations
- Natural language processing
- Smart search and discovery
- Analytics and reporting
- Predictive analytics
- AI assistant features
- Data visualization

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
3. Run: `java -jar plantuml.jar use-cases/*.puml`
4. This will generate PNG files for all diagrams

### Option 4: Docker
```bash
docker run --rm -v $(pwd):/data plantuml/plantuml -tpng use-cases/*.puml
```

## Diagram Features

### Visual Elements
- **Actors**: Represented with stick figures (awesome style)
- **Use Cases**: Rounded rectangles with color coding
- **System Boundaries**: Larger rectangles grouping related functionality
- **Relationships**: Arrows showing associations, includes, and extends
- **Notes**: Additional context and explanations

### Color Coding
- **Main Diagram**: Light Blue use cases
- **Authentication**: Light Green use cases
- **Project Management**: Light Cyan use cases
- **Collaboration**: Light Pink use cases
- **AI & Analytics**: Lavender use cases

### Relationship Types
- **→**: Association (actor uses use case)
- **..> <<include>>**: Mandatory inclusion
- **..> <<extend>>**: Optional extension
- **<|--**: Generalization (inheritance)

## Technical Notes

### PlantUML Version
These diagrams were created using PlantUML syntax compatible with version 1.2023.x and above.

### Dependencies
- Java Runtime Environment (for local rendering)
- PlantUML JAR file (for local rendering)
- Graphviz (optional, for better diagram rendering)

### Customization
The diagrams use custom styling through `skinparam` commands:
- Actor style: Awesome (modern stick figures)
- Custom colors for different modules
- Consistent arrow and border colors

## Integration with SkyManage

These use case diagrams directly reflect the actual implementation of SkyManage:

### Frontend Components Referenced
- `App.tsx` - Main application structure
- `Dashboard.tsx` - Project overview
- `Projects.tsx` - Project management
- `MissionControl.tsx` - Advanced features
- `NeuralNetwork.tsx` - AI visualization
- `Invitations.tsx` - Collaboration system

### Backend Services Referenced
- `server.ts` - API endpoints
- Firebase Authentication
- MongoDB Atlas database
- AWS S3 file storage
- Google Generative AI integration

### Key Features Mapped
- Real-time collaboration via Firebase
- AI-powered search and recommendations
- Project management with Kanban boards
- File upload and sharing
- Email notifications and invitations

## Future Enhancements

These diagrams can be extended to include:
- Sequence diagrams for user workflows
- Class diagrams for system architecture
- Component diagrams for microservices
- Deployment diagrams for infrastructure
- State diagrams for user sessions

## Contributing

When modifying these diagrams:
1. Maintain consistent styling
2. Use descriptive use case names
3. Include relevant notes for complex flows
4. Test rendering after changes
5. Update this README if adding new diagrams

## Support

For issues with diagram rendering:
- Check PlantUML syntax validity
- Ensure PlantUML version compatibility
- Verify all relationships are properly defined
- Test with different rendering tools
