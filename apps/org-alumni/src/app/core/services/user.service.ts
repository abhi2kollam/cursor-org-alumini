import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable, map, of, switchMap } from 'rxjs';
import { Auth, authState, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from '@angular/fire/auth';

export interface User {
  id?: string;
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  employeeId?: string;
  isVerified: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: Date;
  lastLogin?: Date;
  phoneNumber?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly collectionPath = 'users';

  constructor(
    private firestoreService: FirestoreService,
    private auth: Auth
  ) {}

  // Authentication methods
  get currentUser$() {
    return authState(this.auth).pipe(
      switchMap(user => {
        if (user) {
          return this.getUserByUid(user.uid);
        }
        return of(null);
      })
    );
  }

  async signInWithEmail(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async signInWithGithub(): Promise<UserCredential> {
    const provider = new GithubAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async registerWithEmail(email: string, password: string, userData: Partial<User>): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    return this.createUserDocument(credential.user.uid, {
      ...userData,
      id: credential.user.uid,
      uid: credential.user.uid,
      email: credential.user.email || email,
      displayName: userData.displayName || email.split('@')[0],
      isVerified: false,
      isAdmin: false,
      isBlocked: false,
      createdAt: new Date()
    });
  }

  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  // Firestore methods
  getAllUsers(): Observable<User[]> {
    return this.firestoreService.getCollection<User>(this.collectionPath);
  }

  getPendingUsers(): Observable<User[]> {
    return this.firestoreService.getCollection<User>(
      this.collectionPath, 
      [this.firestoreService.whereEqual('isVerified', false)]
    );
  }

  getUserByUid(uid: string): Observable<User | null> {
    return this.firestoreService.getCollection<User>(
      this.collectionPath,
      [this.firestoreService.whereEqual('uid', uid)]
    ).pipe(
      map(users => users.length > 0 ? users[0] : null)
    );
  }

  getUserById(id: string): Observable<User> {
    return this.firestoreService.getDocument<User>(this.collectionPath, id);
  }

  async createUserDocument(uid: string, data: User): Promise<void> {
    await this.firestoreService.addDocument(this.collectionPath, data);
  }

  updateUser(id: string, data: Partial<User>): Promise<void> {
    return this.firestoreService.updateDocument<User>(this.collectionPath, id, data);
  }

  verifyUser(id: string): Promise<void> {
    return this.firestoreService.updateDocument<User>(this.collectionPath, id, { 
      isVerified: true 
    });
  }

  toggleBlockUser(id: string, isBlocked: boolean): Promise<void> {
    return this.firestoreService.updateDocument<User>(this.collectionPath, id, { 
      isBlocked 
    });
  }

  deleteUser(id: string): Promise<void> {
    return this.firestoreService.deleteDocument(this.collectionPath, id);
  }
} 