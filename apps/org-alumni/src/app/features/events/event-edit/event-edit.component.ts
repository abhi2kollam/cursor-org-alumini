import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EventService, EventWithCreator } from '../../../core/services/event.service';
import { UserService } from '../../../core/services/user.service';
import { Storage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from '@angular/fire/storage';
import { Observable, of, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
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
            Back to Event
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Edit Event</h1>
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
        <div *ngIf="error" class="rounded-md bg-red-50 p-4 mb-6">
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

        <!-- Event form -->
        <div *ngIf="!loading && !error && eventForm" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <form [formGroup]="eventForm" (ngSubmit)="onSubmit()">
            <div class="px-4 py-5 sm:p-6">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
                <div class="sm:col-span-4">
                  <label for="title" class="block text-sm font-medium text-gray-700">
                    Event Title *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="title" 
                      formControlName="title" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="eventForm.get('title')?.invalid && eventForm.get('title')?.touched" class="mt-2 text-sm text-red-600">
                    Title is required
                  </p>
                </div>

                <div class="sm:col-span-6">
                  <label for="location" class="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="location" 
                      formControlName="location" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="eventForm.get('location')?.invalid && eventForm.get('location')?.touched" class="mt-2 text-sm text-red-600">
                    Location is required
                  </p>
                </div>

                <div class="sm:col-span-3">
                  <label for="startDate" class="block text-sm font-medium text-gray-700">
                    Start Date and Time *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="datetime-local" 
                      id="startDate" 
                      formControlName="startDate" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="eventForm.get('startDate')?.invalid && eventForm.get('startDate')?.touched" class="mt-2 text-sm text-red-600">
                    Start date is required
                  </p>
                </div>

                <div class="sm:col-span-3">
                  <label for="endDate" class="block text-sm font-medium text-gray-700">
                    End Date and Time *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="datetime-local" 
                      id="endDate" 
                      formControlName="endDate" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="eventForm.get('endDate')?.invalid && eventForm.get('endDate')?.touched" class="mt-2 text-sm text-red-600">
                    End date is required
                  </p>
                  <p *ngIf="eventForm.errors?.['endDateBeforeStart']" class="mt-2 text-sm text-red-600">
                    End date must be after start date
                  </p>
                </div>

                <div class="sm:col-span-6">
                  <label for="description" class="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <div class="mt-1">
                    <textarea 
                      id="description" 
                      formControlName="description" 
                      rows="5" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  <p *ngIf="eventForm.get('description')?.invalid && eventForm.get('description')?.touched" class="mt-2 text-sm text-red-600">
                    Description is required
                  </p>
                </div>

                <div class="sm:col-span-6">
                  <label for="image" class="block text-sm font-medium text-gray-700">
                    Event Image
                  </label>
                  
                  <!-- Current image -->
                  <div *ngIf="currentImageUrl && !imagePreview" class="mt-2 mb-4">
                    <img [src]="currentImageUrl" alt="Current event image" class="max-w-xs h-auto rounded-lg shadow-md">
                    <button 
                      type="button" 
                      (click)="removeCurrentImage()" 
                      class="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove image
                    </button>
                  </div>
                  
                  <div class="mt-1 flex items-center">
                    <input 
                      type="file" 
                      id="image" 
                      (change)="onFileSelected($event)" 
                      accept="image/*" 
                      class="sr-only"
                      #fileInput
                    >
                    <button 
                      type="button" 
                      (click)="fileInput.click()" 
                      class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg class="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                      {{ currentImageUrl ? 'Change Image' : 'Upload Image' }}
                    </button>
                    <span *ngIf="selectedFile" class="ml-4 text-sm text-gray-500">
                      {{ selectedFile.name }}
                    </span>
                  </div>
                </div>

                <!-- New image preview -->
                <div *ngIf="imagePreview" class="sm:col-span-6">
                  <div class="mt-2">
                    <img [src]="imagePreview" alt="New event image preview" class="max-w-xs h-auto rounded-lg shadow-md">
                  </div>
                </div>

                <!-- Upload progress -->
                <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="sm:col-span-6">
                  <div class="w-full bg-gray-200 rounded-full h-2.5">
                    <div class="bg-indigo-600 h-2.5 rounded-full" [style.width.%]="uploadProgress"></div>
                  </div>
                  <p class="mt-2 text-sm text-gray-500">Uploading: {{ uploadProgress }}%</p>
                </div>
              </div>
            </div>
            
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button 
                type="button" 
                (click)="goBack()" 
                class="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                [disabled]="eventForm.invalid || isSubmitting" 
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                [ngClass]="{'opacity-50 cursor-not-allowed': eventForm.invalid || isSubmitting}"
              >
                {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class EventEditComponent implements OnInit {
  eventForm: FormGroup;
  error: string | null = null;
  isSubmitting: boolean = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  uploadProgress: number = 0;
  loading: boolean = true;
  currentImageUrl: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private userService: UserService,
    private storage: Storage,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.eventForm = this.fb.group({
      title: ['', [Validators.required]],
      location: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      description: ['', [Validators.required]]
    }, { validators: this.dateValidator });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const eventId = params.get('id');
      if (eventId) {
        this.loadEvent(eventId);
      }
    });
  }

  dateValidator(group: FormGroup) {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      if (endDate < startDate) {
        return { endDateBeforeStart: true };
      }
    }
    
    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  async uploadImage(): Promise<string | null> {
    if (!this.selectedFile) return null;
    
    const filePath = `events/${new Date().getTime()}_${this.selectedFile.name}`;
    const fileRef = ref(this.storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, this.selectedFile);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          this.uploadProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        }, 
        (error) => {
          console.error('Upload failed:', error);
          reject(error);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  }

  async onSubmit(): Promise<void> {
    if (this.eventForm.invalid) return;
    
    this.isSubmitting = true;
    this.error = null;
    
    try {
      // Get current user
      const currentUser = await this.userService.currentUser$.pipe().toPromise();
      if (!currentUser) {
        this.error = 'You must be logged in to edit an event';
        this.isSubmitting = false;
        return;
      }
      
      // Upload image if selected
      let imageUrl = null;
      if (this.selectedFile) {
        imageUrl = await this.uploadImage();
      }
      
      // Prepare event data
      const eventData = {
        title: this.eventForm.value.title,
        location: this.eventForm.value.location,
        description: this.eventForm.value.description,
        startDate: new Date(this.eventForm.value.startDate),
        endDate: new Date(this.eventForm.value.endDate),
        createdBy: currentUser.uid,
        imageUrl: imageUrl || undefined
      };
      
      // Update event in Firestore
      const eventId = this.route.snapshot.paramMap.get('id');
      if (!eventId) {
        throw new Error('Event ID not found');
      }
      await this.eventService.updateEvent(eventId, eventData);
      
      // Navigate back to events list
      this.router.navigate(['/events']);
    } catch (err) {
      console.error('Error editing event:', err);
      this.error = 'Failed to edit event. Please try again.';
      this.isSubmitting = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/events']);
  }

  async loadEvent(eventId: string): Promise<void> {
    try {
      const event = await this.eventService.getEventById(eventId).toPromise();
      if (event) {
        this.currentImageUrl = event.imageUrl || null;
        this.eventForm.patchValue({
          title: event.title,
          location: event.location,
          startDate: new Date(event.startDate).toISOString().split('T')[0],
          endDate: new Date(event.endDate).toISOString().split('T')[0],
          description: event.description
        });
        this.loading = false;
      } else {
        this.error = 'Event not found';
        this.loading = false;
      }
    } catch (err) {
      console.error('Error loading event:', err);
      this.error = 'Failed to load event. Please try again.';
      this.loading = false;
    }
  }

  async removeCurrentImage(): Promise<void> {
    this.currentImageUrl = null;
    this.eventForm.patchValue({ imageUrl: null });
  }
} 