import { Injectable } from '@angular/core';
import { Observable, map, of, switchMap } from 'rxjs';
import { UserService, User } from './user.service';
import { FirestoreService } from './firestore.service';
import { AlumniProfile } from '../../features/connects/models/connect.model';

@Injectable({
  providedIn: 'root'
})
export class ConnectService {
  private readonly collectionPath = 'users';

  constructor(
    private userService: UserService,
    private firestoreService: FirestoreService
  ) {}

  // Get all verified alumni
  getAllAlumni(): Observable<User[]> {
    return this.userService.getAllUsers().pipe(
      map(users => users.filter(user => user.isVerified && !user.isBlocked))
    );
  }

  // Search alumni by name or email
  searchAlumni(query: string): Observable<User[]> {
    return this.getAllAlumni().pipe(
      map(users => {
        const lowercaseQuery = query.toLowerCase();
        return users.filter(user => 
          user.displayName.toLowerCase().includes(lowercaseQuery) || 
          user.email.toLowerCase().includes(lowercaseQuery) ||
          (user.employeeId && user.employeeId.toLowerCase().includes(lowercaseQuery))
        );
      })
    );
  }

  // Get alumni by ID
  getAlumniById(id: string): Observable<User | null> {
    return this.userService.getUserById(id).pipe(
      map(user => {
        if (user && user.isVerified && !user.isBlocked) {
          return user;
        }
        return null;
      })
    );
  }

  // Update alumni profile
  updateAlumniProfile(id: string, profileData: Partial<AlumniProfile>): Promise<void> {
    return this.firestoreService.updateDocument<AlumniProfile>(
      this.collectionPath, 
      id, 
      profileData
    );
  }

  // Update contact information
  updateContactInfo(id: string, contactInfo: {
    phoneNumber?: string;
    linkedinUrl?: string;
    twitterUrl?: string;
  }): Promise<void> {
    return this.firestoreService.updateDocument<User>(
      this.collectionPath,
      id,
      contactInfo
    );
  }

  // Get current user's profile
  getCurrentUserProfile(): Observable<User | null> {
    return this.userService.currentUser$;
  }

  // Check if current user can edit a profile
  canEditProfile(profileId: string): Observable<boolean> {
    return this.userService.currentUser$.pipe(
      map(currentUser => {
        if (!currentUser) return false;
        
        // User can edit their own profile or admin can edit any profile
        return currentUser.id === profileId || currentUser.isAdmin;
      })
    );
  }
} 