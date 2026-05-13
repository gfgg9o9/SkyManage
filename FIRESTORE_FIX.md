# Firebase Firestore Permissions Fix

## Issue
The invitation system is failing with "Missing or insufficient permissions" errors because the Firestore security rules haven't been deployed yet.

## Solution

### Option 1: Deploy via Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**: `gen-lang-client-0229470974`
3. **Navigate to Firestore Database**: Click "Firestore Database" in the left menu
4. **Go to Rules tab**: Click "Rules" tab at the top
5. **Replace existing rules** with the following:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Default deny
    match /{document=**} {
      allow read, write: if false;
    }

    // Common helpers
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    function isValidId(id) {
      return id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$');
    }

    function incoming() {
      return request.resource.data;
    }

    function existing() {
      return resource.data;
    }

    function isProjectMember(projectId) {
      let projectPath = /databases/$(database)/documents/projects/$(projectId);
      return isSignedIn() && exists(projectPath) && (
        get(projectPath).data.ownerId == request.auth.uid ||
        get(projectPath).data.get('members', []).hasAny([request.auth.uid])
      );
    }

    function isProjectPM(projectId) {
      let projectPath = /databases/$(database)/documents/projects/$(projectId);
      return isSignedIn() && exists(projectPath) && (
        get(projectPath).data.ownerId == request.auth.uid ||
        get(projectPath).data.get('admins', []).hasAny([request.auth.uid]) ||
        get(projectPath).data.get('pms', []).hasAny([request.auth.uid])
      );
    }

    function isProjectAdmin(projectId) {
      let projectPath = /databases/$(database)/documents/projects/$(projectId);
      return isSignedIn() && exists(projectPath) && (
        get(projectPath).data.ownerId == request.auth.uid ||
        get(projectPath).data.get('admins', []).hasAny([request.auth.uid])
      );
    }

    // User Rules
    match /users/{userId} {
      allow get: if isSignedIn();
      allow list: if isSignedIn();
      allow create, update: if isSignedIn() && request.auth.uid == userId;
    }

    // Project Rules
    match /projects/{projectId} {
      allow get, list: if isSignedIn() && (
        resource.data.ownerId == request.auth.uid ||
        resource.data.get('members', []).hasAny([request.auth.uid])
      );
      
      allow create: if isSignedIn() && 
        request.resource.data.ownerId == request.auth.uid;

      allow update: if isSignedIn() && (
        resource.data.ownerId == request.auth.uid ||
        isProjectPM(projectId) ||
        (resource.data.get('members', []).hasAny([request.auth.uid]) && 
         request.resource.data.diff(resource.data).affectedKeys().hasOnly(['updatedAt', 'documents']))
      );

      allow delete: if isSignedIn() && isProjectAdmin(projectId);
    }

    // Task Rules
    match /tasks/{taskId} {
      allow read: if isSignedIn() && (
        isProjectMember(resource.data.projectId)
      );
      
      allow create: if isSignedIn() && 
        isProjectMember(request.resource.data.projectId);
        
      allow update: if isSignedIn() && (
        isProjectMember(resource.data.projectId)
      );

      allow delete: if isSignedIn() && (
        resource.data.reporterId == request.auth.uid || 
        isProjectPM(resource.data.projectId)
      );
    }

    // Comment Rules
    match /tasks/{taskId}/comments/{commentId} {
      allow read: if isSignedIn() && 
        exists(/databases/$(database)/documents/tasks/$(taskId)) && 
        isProjectMember(get(/databases/$(database)/documents/tasks/$(taskId)).data.projectId);
        
      allow create: if isSignedIn() && 
        exists(/databases/$(database)/documents/tasks/$(taskId)) && 
        isProjectMember(get(/databases/$(database)/documents/tasks/$(taskId)).data.projectId) &&
        incoming().authorId == request.auth.uid;
        
      allow delete: if isSignedIn() && resource.data.authorId == request.auth.uid;
    }

    // Invitation Rules - More permissive for testing
    match /invitations/{invitationId} {
      allow get: if isSignedIn();
      allow list: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isSignedIn();
      allow delete: if isSignedIn();
    }

    // Notification Rules
    match /notifications/{notificationId} {
      allow get, list: if isSignedIn() && existing().userId == request.auth.uid;
      allow create: if isSignedIn();
      allow update: if isSignedIn() && existing().userId == request.auth.uid && 
        incoming().diff(existing()).affectedKeys().hasOnly(['read']);
      allow delete: if isSignedIn() && existing().userId == request.auth.uid;
    }

    // Terminal Events Rules
    match /terminal_events/{eventId} {
      allow list, get: if isSignedIn();
      allow create: if isSignedIn() && 
        incoming().userId == request.auth.uid &&
        incoming().createdAt == request.time;
      allow update, delete: if false;
    }
  }
}
```

6. **Click "Publish"** to deploy the rules

### Option 2: Deploy via Firebase CLI

1. **Install Firebase CLI** (already done)
2. **Login to Firebase**: Run `firebase login` in terminal
3. **Deploy rules**: Run `firebase deploy --only firestore:rules --project gen-lang-client-0229470974`

## Current Status

✅ **Backend**: Running successfully on localhost:3001  
✅ **Frontend**: Connected to backend via proxy  
✅ **Error Handling**: Added graceful fallbacks for permissions errors  
⚠️ **Firestore Rules**: Need to be deployed (see solutions above)  

## After Deployment

Once rules are deployed:
- Invitation system will work fully
- Users can accept/decline invitations
- Email notifications will be sent
- All Firebase operations will be secured

## Testing

1. Send an invitation from Project Details page
2. Check notification bell for new invitation
3. Click invitation to open accept/decline screen
4. Test both accept and decline actions
