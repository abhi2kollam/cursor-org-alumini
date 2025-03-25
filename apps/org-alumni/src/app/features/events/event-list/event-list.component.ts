import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EventService, EventWithCreator } from '../../../core/services/event.service';
import { UserService } from '../../../core/services/user.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-semibold text-gray-900">Events</h1>
            <p class="mt-1 text-sm text-gray-600">Connect with fellow alumni at these upcoming events</p>
          </div>
          <div *ngIf="isAdmin$ | async">
            <a 
              routerLink="/events/create" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Event
            </a>
          </div>
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

        <!-- Events list -->
        <div *ngIf="!loading" class="space-y-6">
          <div *ngFor="let event of events" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 class="text-lg leading-6 font-medium text-gray-900">
                  {{ event.title }}
                </h3>
                <p class="mt-1 max-w-2xl text-sm text-gray-500">
                  {{ event.startDate | date:'EEEE, MMMM d, y, h:mm a' }}
                </p>
              </div>
              <div *ngIf="(isAdmin$ | async) || event.creator.uid === (currentUserId$ | async)" class="flex space-x-2">
                <a 
                  [routerLink]="['/events', event.id, 'edit']" 
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Edit
                </a>
              </div>
            </div>
            <div class="border-t border-gray-200 px-4 py-5 sm:p-0">
              <dl class="sm:divide-y sm:divide-gray-200">
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">
                    Location
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ event.location }}
                  </dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">
                    Description
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ event.description }}
                  </dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">
                    Organized by
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ event.creator.displayName }}
                  </dd>
                </div>
                <div class="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500">
                    Attendees
                  </dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {{ event.attendeeCount }} people attending
                  </dd>
                </div>
              </dl>
            </div>
            <div class="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between items-center">
              <a 
                [routerLink]="['/events', event.id]" 
                class="text-indigo-600 hover:text-indigo-900 font-medium"
              >
                View details
              </a>
              <button 
                (click)="toggleAttendance(event)" 
                [ngClass]="event.isAttending ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {{ event.isAttending ? 'Cancel attendance' : 'Attend event' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && events.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No events</h3>
          <p class="mt-1 text-sm text-gray-500">
            There are no upcoming events scheduled at this time.
          </p>
          <div *ngIf="isAdmin$ | async" class="mt-6">
            <a 
              routerLink="/events/create" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create a new event
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class EventListComponent implements OnInit {
  events: EventWithCreator[] = [];
  loading: boolean = true;
  isAdmin$: Observable<boolean>;
  currentUserId$: Observable<string | undefined>;

  constructor(
    private eventService: EventService,
    private userService: UserService
  ) {
    this.isAdmin$ = this.userService.currentUser$.pipe(
      map(user => !!user?.isAdmin)
    );
    
    this.currentUserId$ = this.userService.currentUser$.pipe(
      map(user => user?.uid)
    );
  }

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getUpcomingEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  toggleAttendance(event: EventWithCreator): void {
    if (!event.id) return;
    
    this.userService.currentUser$.subscribe(user => {
      if (!user) {
        // Handle not logged in case
        return;
      }
      
      this.eventService.toggleAttendance(event.id!, user.uid)
        .then(() => {
          // Update local state
          event.isAttending = !event.isAttending;
          event.attendeeCount = event.isAttending 
            ? event.attendeeCount + 1 
            : Math.max(0, event.attendeeCount - 1);
        })
        .catch(error => {
          console.error('Error toggling attendance:', error);
        });
    }).unsubscribe();
  }
} 