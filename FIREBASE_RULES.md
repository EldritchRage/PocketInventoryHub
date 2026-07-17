Firestore & Storage Rules (example)

Use these example rules in the Firebase Console -> Firestore Rules and Storage Rules to allow authenticated users to read/write products and upload images. Adjust to your security model before deploying.

Firestore (firestore.rules):

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /products/{productId} {
      allow read: if true; // allow public read — change as needed
      allow create, update, delete: if request.auth != null; // only authenticated users
    }
  }
}

Storage (storage.rules):

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}

Apply these by opening the Firebase Console and pasting the contents into the Rules editors for Firestore and Storage. If you prefer the Firebase CLI, save files and run `firebase deploy --only firestore:rules,storage:rules` after authenticating.
