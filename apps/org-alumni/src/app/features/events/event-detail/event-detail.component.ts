import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { EventService, EventWithCreator } from '../../../core/services/event.service';
import { UserService } from '../../../core/services/user.service';
import { Observable, map, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center">
          <button 
            (click)="goBack()" 
            class="inline-flex items-center mr-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            <svg class="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
            </svg>
            Back to Events
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Event Details</h1>
        </div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <!-- Loading indicator -->
        <div *ngIf="loading" class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Error message -->
        <div *ngIf="!loading && error" class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
            </div>
          </div>
        </div>

        <!-- Event details -->
        <div *ngIf="!loading && !error && event" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ event.title }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                Organized by {{ event.creator.displayName }}
              </p>
            </div>
            <div *ngIf="canEdit$ | async" class="flex space-x-2">
              <a 
                [routerLink]="['/events', event.id, 'edit']" 
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </a>
              <button 
                (click)="deleteEvent()" 
                class="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div class="border-t border-gray-200">
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Date and Time
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ event.startDate | date:'EEEE, MMMM d, y, h:mm a' }} - 
                  {{ event.endDate | date:'h:mm a' }}
                </dd>
              </div>
              
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Location
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ event.location }}
                </dd>
              </div>
              
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Description
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {{ event.description }}
                </dd>
              </div>
              
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Attendees
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ event.attendeeCount }} people attending
                </dd>
              </div>
              
              <div *ngIf="event.imageUrl" class="bg-gray-50 px-4 py-5 sm:px-6">
                <dt class="text-sm font-medium text-gray-500 mb-2">
                  Event Image
                </dt>
                <dd>
                  <img [src]="event.imageUrl" alt="Event image" class="max-w-full h-auto rounded-lg shadow-md">
                </dd>
              </div>
            </dl>
          </div>
          
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
            <button 
              (click)="toggleAttendance()" 
              [ngClass]="event.isAttending ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {{ event.isAttending ? 'Cancel attendance' : 'Attend event' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EventDetailComponent implements OnInit {
  event: EventWithCreator | null = null;
  loading: boolean = true;
  error: string | null = null;
  canEdit$: Observable<boolean>;
  
  constructor(
    private eventService: EventService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.canEdit$ = this.userService.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of(false);
        
        return this.route.paramMap.pipe(
          switchMap(params => {
            const eventId = params.get('id');
            if (!eventId) return of(false);
            
            return this.eventService.getEventById(eventId).pipe(
              map(event => {
                if (!event) return false;
                return user.isAdmin || event.creator.uid === user.uid;
              })
            );
          })
        );
      })
    );
  }

  ngOnInit(): void {
    this.loadEvent();
  }

  loadEvent(): void {
    this.loading = true;
    this.error = null;
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Event ID not found';
      this.loading = false;
      return;
    }
    
    this.eventService.getEventById(id).subscribe({
      next: (event) => {
        this.event = event;
        if (!event) {
          this.error = 'Event not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading event:', err);
        this.error = 'Failed to load event. Please try again later.';
        this.loading = false;
      }
    });
  }

  toggleAttendance(): void {
    if (!this.event || !this.event.id) return;
    
    this.userService.currentUser$.subscribe(user => {
      if (!user) {
        // Handle not logged in case
        return;
      }
      
      this.eventService.toggleAttendance(this.event!.id!, user.uid)
        .then(() => {
          // Update local state
          if (this.event) {
            this.event.isAttending = !this.event.isAttending;
            this.event.attendeeCount = this.event.isAttending 
              ? this.event.attendeeCount + 1 
              : Math.max(0, this.event.attendeeCount - 1);
          }
        })
        .catch(error => {
          console.error('Error toggling attendance:', error);
        });
    }).unsubscribe();
  }

  deleteEvent(): void {
    if (!this.event || !this.event.id) return;
    
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      this.eventService.deleteEvent(this.event.id)
        .then(() => {
          this.router.navigate(['/events']);
        })
        .catch(error => {
          console.error('Error deleting event:', error);
          this.error = 'Failed to delete event. Please try again later.';
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }
} 