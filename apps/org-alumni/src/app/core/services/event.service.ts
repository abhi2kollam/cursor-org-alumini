import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { UserService, User } from './user.service';

export interface Event {
  id?: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  createdBy: string; // User ID
  createdAt: Date;
  updatedAt?: Date;
  imageUrl?: string;
  attendees: string[]; // Array of user IDs
}

export interface EventWithCreator extends Event {
  creator: User;
  attendeeCount: number;
  isAttending: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly collectionPath = 'events';

  constructor(
    private firestoreService: FirestoreService,
    private userService: UserService
  ) {}

  getAllEvents(): Observable<EventWithCreator[]> {
    return combineLatest([
      this.firestoreService.getCollection<Event>(
        this.collectionPath, 
        [this.firestoreService.orderByField('startDate')]
      ),
      this.userService.currentUser$
    ]).pipe(
      switchMap(([events, currentUser]) => {
        if (events.length === 0) return of([]);
        
        const creatorIds = [...new Set(events.map(event => event.createdBy))];
        
        return combineLatest(
          creatorIds.map(id => this.userService.getUserByUid(id))
        ).pipe(
          map(creators => {
            const creatorMap = new Map<string, User>();
            creators.forEach(creator => {
              if (creator) creatorMap.set(creator.uid, creator);
            });
            
            return events.map(event => {
              const creator = creatorMap.get(event.createdBy);
              
              return {
                ...event,
                creator: creator!,
                attendeeCount: event.attendees.length,
                isAttending: currentUser ? event.attendees.includes(currentUser.uid) : false
              };
            });
          })
        );
      })
    );
  }

  getUpcomingEvents(): Observable<EventWithCreator[]> {
    const now = new Date();
    
    return this.getAllEvents().pipe(
      map(events => events.filter(event => new Date(event.startDate) > now))
    );
  }

  getEventById(id: string): Observable<EventWithCreator | null> {
    return this.firestoreService.getDocument<Event>(this.collectionPath, id).pipe(
      switchMap(event => {
        if (!event) return of(null);
        
        return combineLatest([
          this.userService.getUserByUid(event.createdBy),
          this.userService.currentUser$
        ]).pipe(
          map(([creator, currentUser]) => {
            if (!creator) return null;
            
            return {
              ...event,
              creator,
              attendeeCount: event.attendees.length,
              isAttending: currentUser ? event.attendees.includes(currentUser.uid) : false
            };
          })
        );
      })
    );
  }

  createEvent(data: Omit<Event, 'id' | 'createdAt' | 'attendees'>): Promise<any> {
    const newEvent: Omit<Event, 'id'> = {
      ...data,
      createdAt: new Date(),
      attendees: [data.createdBy] // Creator is automatically attending
    };
    
    return this.firestoreService.addDocument(this.collectionPath, newEvent);
  }

  updateEvent(id: string, data: Partial<Event>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    return this.firestoreService.updateDocument<Event>(this.collectionPath, id, updateData);
  }

  deleteEvent(id: string): Promise<void> {
    return this.firestoreService.deleteDocument(this.collectionPath, id);
  }

  async toggleAttendance(eventId: string, userId: string): Promise<void> {
    const event = await this.firestoreService.getDocument<Event>(this.collectionPath, eventId).pipe(
      map(event => event)
    ).toPromise();
    
    if (!event) throw new Error('Event not found');
    
    const attendees = [...event.attendees];
    const index = attendees.indexOf(userId);
    
    if (index > -1) {
      attendees.splice(index, 1); // Not attending
    } else {
      attendees.push(userId); // Attending
    }
    
    return this.firestoreService.updateDocument<Event>(this.collectionPath, eventId, { attendees });
  }
} 