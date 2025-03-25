import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService, JobWithPoster } from '../../../core/services/job.service';
import { UserService } from '../../../core/services/user.service';
import { Observable, map, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-job-detail',
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
            Back to Jobs
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Job Details</h1>
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

        <!-- Job details -->
        <div *ngIf="!loading && !error && job" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 class="text-lg leading-6 font-medium text-gray-900">
                {{ job.title }}
              </h3>
              <p class="mt-1 max-w-2xl text-sm text-gray-500">
                {{ job.company }} • {{ job.location }}
              </p>
            </div>
            <div *ngIf="canEdit$ | async" class="flex space-x-2">
              <a 
                [routerLink]="['/jobs', job.id, 'edit']" 
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Edit
              </a>
              <button 
                (click)="toggleJobStatus()" 
                class="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white"
                [ngClass]="job.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
              >
                {{ job.isActive ? 'Mark as Filled' : 'Reactivate Job' }}
              </button>
              <button 
                (click)="deleteJob()" 
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
                  Description
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                  {{ job.description }}
                </dd>
              </div>
              
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Requirements
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <ul class="list-disc pl-5 space-y-1">
                    <li *ngFor="let requirement of job.requirements">{{ requirement }}</li>
                  </ul>
                </dd>
              </div>
              
              <div *ngIf="job.salary" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Salary
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ job.salary }}
                </dd>
              </div>
              
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Posted by
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ job.poster.displayName }} on {{ job.postedAt | date:'longDate' }}
                </dd>
              </div>
              
              <div *ngIf="job.contactEmail" class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Contact Email
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a [href]="'mailto:' + job.contactEmail" class="text-indigo-600 hover:text-indigo-500">
                    {{ job.contactEmail }}
                  </a>
                </dd>
              </div>
              
              <div *ngIf="job.applicationUrl" class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Application Link
                </dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <a [href]="job.applicationUrl" target="_blank" class="text-indigo-600 hover:text-indigo-500">
                    {{ job.applicationUrl }}
                  </a>
                </dd>
              </div>
              
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">
                  Status
                </dt>
                <dd class="mt-1 text-sm sm:mt-0 sm:col-span-2">
                  <span 
                    [ngClass]="job.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'" 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ job.isActive ? 'Active' : 'Filled' }}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
          
          <div class="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end space-x-3">
            <button 
              *ngIf="!job.hasApplied && job.isActive"
              (click)="applyForJob()" 
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Apply for this job
            </button>
            <button 
              *ngIf="job.hasApplied"
              disabled
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 cursor-default"
            >
              Applied
            </button>
            <button 
              (click)="scrollToReferForm()" 
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Refer a Friend
            </button>
          </div>
        </div>

        <!-- Referral form -->
        <div *ngIf="!loading && !error && job" id="refer" class="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              Refer a Friend
            </h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">
              Know someone who would be perfect for this role? Refer them here.
            </p>
          </div>
          
          <div class="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form [formGroup]="referralForm" (ngSubmit)="submitReferral()">
              <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div class="sm:col-span-3">
                  <label for="referredName" class="block text-sm font-medium text-gray-700">
                    Friend's Name *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="referredName" 
                      formControlName="referredName" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="referralForm.get('referredName')?.invalid && referralForm.get('referredName')?.touched" class="mt-2 text-sm text-red-600">
                    Name is required
                  </p>
                </div>

                <div class="sm:col-span-3">
                  <label for="referredEmail" class="block text-sm font-medium text-gray-700">
                    Friend's Email *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="email" 
                      id="referredEmail" 
                      formControlName="referredEmail" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="referralForm.get('referredEmail')?.invalid && referralForm.get('referredEmail')?.touched" class="mt-2 text-sm text-red-600">
                    Valid email is required
                  </p>
                </div>

                <div class="sm:col-span-3">
                  <label for="referredPhone" class="block text-sm font-medium text-gray-700">
                    Friend's Phone (optional)
                  </label>
                  <div class="mt-1">
                    <input 
                      type="tel" 
                      id="referredPhone" 
                      formControlName="referredPhone" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                </div>

                <div class="sm:col-span-6">
                  <label for="notes" class="block text-sm font-medium text-gray-700">
                    Notes (optional)
                  </label>
                  <div class="mt-1">
                    <textarea 
                      id="notes" 
                      formControlName="notes" 
                      rows="3" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Why do you think they would be a good fit?"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div class="mt-6 flex justify-end">
                <button 
                  type="submit" 
                  [disabled]="referralForm.invalid || isSubmittingReferral" 
                  class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  [ngClass]="{'opacity-50 cursor-not-allowed': referralForm.invalid || isSubmittingReferral}"
                >
                  {{ isSubmittingReferral ? 'Submitting...' : 'Submit Referral' }}
                </button>
              </div>
            </form>
          </div>
          
          <!-- Referral success message -->
          <div *ngIf="referralSuccess" class="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div class="rounded-md bg-green-50 p-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
                  <p class="text-sm font-medium text-green-800">
                    Referral submitted successfully!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JobDetailComponent implements OnInit {
  job: JobWithPoster | null = null;
  loading: boolean = true;
  error: string | null = null;
  canEdit$: Observable<boolean>;
  referralForm: FormGroup;
  isSubmittingReferral: boolean = false;
  referralSuccess: boolean = false;
  
  @ViewChild('referForm') referFormElement!: ElementRef;

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.referralForm = this.fb.group({
      referredName: ['', Validators.required],
      referredEmail: ['', [Validators.required, Validators.email]],
      referredPhone: [''],
      notes: ['']
    });
    
    this.canEdit$ = this.userService.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of(false);
        
        return this.route.paramMap.pipe(
          switchMap(params => {
            const jobId = params.get('id');
            if (!jobId) return of(false);
            
            return this.jobService.getJobById(jobId).pipe(
              map(job => {
                if (!job) return false;
                return user.isAdmin || job.poster.uid === user.uid;
              })
            );
          })
        );
      })
    );
  }

  ngOnInit(): void {
    this.loadJob();
    
    // Check if the URL has a fragment for the referral form
    this.route.fragment.subscribe(fragment => {
      if (fragment === 'refer') {
        setTimeout(() => this.scrollToReferForm(), 500);
      }
    });
  }

  loadJob(): void {
    this.loading = true;
    this.error = null;
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Job ID not found';
      this.loading = false;
      return;
    }
    
    this.jobService.getJobById(id).subscribe({
      next: (job) => {
        this.job = job;
        if (!job) {
          this.error = 'Job not found';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading job:', err);
        this.error = 'Failed to load job. Please try again later.';
        this.loading = false;
      }
    });
  }

  applyForJob(): void {
    if (!this.job || !this.job.id) return;
    
    this.userService.currentUser$.subscribe(user => {
      if (!user) {
        // Handle not logged in case
        return;
      }
      
      this.jobService.applyForJob(this.job!.id!, user.uid)
        .then(() => {
          // Update local state
          if (this.job) {
            this.job.hasApplied = true;
            this.job.applicantCount += 1;
          }
        })
        .catch(error => {
          console.error('Error applying for job:', error);
        });
    }).unsubscribe();
  }

  toggleJobStatus(): void {
    if (!this.job || !this.job.id) return;
    
    const newStatus = !this.job.isActive;
    this.jobService.toggleJobStatus(this.job.id, newStatus)
      .then(() => {
        if (this.job) {
          this.job.isActive = newStatus;
        }
      })
      .catch(error => {
        console.error('Error toggling job status:', error);
      });
  }

  deleteJob(): void {
    if (!this.job || !this.job.id) return;
    
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      this.jobService.deleteJob(this.job.id)
        .then(() => {
          this.router.navigate(['/jobs']);
        })
        .catch(error => {
          console.error('Error deleting job:', error);
          this.error = 'Failed to delete job. Please try again later.';
        });
    }
  }

  scrollToReferForm(): void {
    const element = document.getElementById('refer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  submitReferral(): void {
    if (this.referralForm.invalid || !this.job || !this.job.id) return;
    
    this.isSubmittingReferral = true;
    this.referralSuccess = false;
    
    this.userService.currentUser$.subscribe(user => {
      if (!user) {
        // Handle not logged in case
        this.isSubmittingReferral = false;
        return;
      }
      
      const referralData = {
        referredName: this.referralForm.value.referredName,
        referredEmail: this.referralForm.value.referredEmail,
        referredPhone: this.referralForm.value.referredPhone,
        notes: this.referralForm.value.notes
      };
      
      this.jobService.addReferral(this.job!.id!, user.uid, referralData)
        .then(() => {
          this.isSubmittingReferral = false;
          this.referralSuccess = true;
          this.referralForm.reset();
          
          // Update local state
          if (this.job) {
            this.job.referralCount += 1;
          }
        })
        .catch(error => {
          console.error('Error submitting referral:', error);
          this.isSubmittingReferral = false;
        });
    }).unsubscribe();
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }
} 