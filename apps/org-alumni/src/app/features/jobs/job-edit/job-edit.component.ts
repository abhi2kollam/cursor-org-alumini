import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { UserService } from '../../../core/services/user.service';
import { switchMap, of } from 'rxjs';

@Component({
  selector: 'app-job-edit',
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
            Back to Job Details
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Edit Job</h1>
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

        <!-- Job form -->
        <div *ngIf="!loading && jobForm" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <form [formGroup]="jobForm" (ngSubmit)="onSubmit()">
            <div class="px-4 py-5 sm:p-6">
              <div class="grid grid-cols-1 gap-6 sm:grid-cols-6">
                <div class="sm:col-span-4">
                  <label for="title" class="block text-sm font-medium text-gray-700">
                    Job Title *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="title" 
                      formControlName="title" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="jobForm.get('title')?.invalid && jobForm.get('title')?.touched" class="mt-2 text-sm text-red-600">
                    Title is required
                  </p>
                </div>

                <div class="sm:col-span-3">
                  <label for="company" class="block text-sm font-medium text-gray-700">
                    Company *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="company" 
                      formControlName="company" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="jobForm.get('company')?.invalid && jobForm.get('company')?.touched" class="mt-2 text-sm text-red-600">
                    Company is required
                  </p>
                </div>

                <div class="sm:col-span-3">
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
                  <p *ngIf="jobForm.get('location')?.invalid && jobForm.get('location')?.touched" class="mt-2 text-sm text-red-600">
                    Location is required
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
                  <p *ngIf="jobForm.get('description')?.invalid && jobForm.get('description')?.touched" class="mt-2 text-sm text-red-600">
                    Description is required
                  </p>
                </div>

                <div class="sm:col-span-6">
                  <label class="block text-sm font-medium text-gray-700">
                    Requirements *
                  </label>
                  <div formArrayName="requirements">
                    <div *ngFor="let req of requirementsArray.controls; let i = index" class="mt-2 flex items-center">
                      <input 
                        [formControlName]="i" 
                        class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      >
                      <button 
                        type="button" 
                        (click)="removeRequirement(i)" 
                        class="ml-2 inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <button 
                      type="button" 
                      (click)="addRequirement()" 
                      class="mt-2 inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg class="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                      Add Requirement
                    </button>
                  </div>
                  <p *ngIf="requirementsArray.invalid && requirementsArray.touched" class="mt-2 text-sm text-red-600">
                    At least one requirement is needed
                  </p>
                </div>

                <div class="sm:col-span-3">
                  <label for="salary" class="block text-sm font-medium text-gray-700">
                    Salary (optional)
                  </label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="salary" 
                      formControlName="salary" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="e.g. $50,000 - $70,000"
                    >
                  </div>
                </div>

                <div class="sm:col-span-3">
                  <label for="contactEmail" class="block text-sm font-medium text-gray-700">
                    Contact Email *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="email" 
                      id="contactEmail" 
                      formControlName="contactEmail" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="jobForm.get('contactEmail')?.invalid && jobForm.get('contactEmail')?.touched" class="mt-2 text-sm text-red-600">
                    Valid email is required
                  </p>
                </div>

                <div class="sm:col-span-6">
                  <label for="applicationUrl" class="block text-sm font-medium text-gray-700">
                    Application URL (optional)
                  </label>
                  <div class="mt-1">
                    <input 
                      type="url" 
                      id="applicationUrl" 
                      formControlName="applicationUrl" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="https://example.com/apply"
                    >
                  </div>
                  <p *ngIf="jobForm.get('applicationUrl')?.invalid && jobForm.get('applicationUrl')?.touched" class="mt-2 text-sm text-red-600">
                    Please enter a valid URL
                  </p>
                </div>

                <div class="sm:col-span-6">
                  <div class="flex items-start">
                    <div class="flex items-center h-5">
                      <input 
                        id="isActive" 
                        type="checkbox" 
                        formControlName="isActive" 
                        class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                      >
                    </div>
                    <div class="ml-3 text-sm">
                      <label for="isActive" class="font-medium text-gray-700">Active</label>
                      <p class="text-gray-500">Uncheck this if the position has been filled</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button 
                type="submit" 
                [disabled]="jobForm.invalid || isSubmitting" 
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                [ngClass]="{'opacity-50 cursor-not-allowed': jobForm.invalid || isSubmitting}"
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
export class JobEditComponent implements OnInit {
  jobId: string | null = null;
  jobForm!: FormGroup;
  loading: boolean = true;
  error: string | null = null;
  isSubmitting: boolean = false;
  
  constructor(
    private jobService: JobService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadJob();
  }

  initForm(): void {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      requirements: this.fb.array([], Validators.minLength(1)),
      salary: [''],
      contactEmail: ['', [Validators.required, Validators.email]],
      applicationUrl: ['', Validators.pattern('https?://.+')],
      isActive: [true]
    });
  }

  loadJob(): void {
    this.loading = true;
    this.error = null;
    
    this.jobId = this.route.snapshot.paramMap.get('id');
    if (!this.jobId) {
      this.error = 'Job ID not found';
      this.loading = false;
      return;
    }
    
    // Check if user has permission to edit this job
    this.userService.currentUser$.pipe(
      switchMap(user => {
        if (!user) {
          this.router.navigate(['/jobs']);
          return of(null);
        }
        
        return this.jobService.getJobById(this.jobId!).pipe(
          switchMap(job => {
            if (!job) {
              this.error = 'Job not found';
              this.loading = false;
              return of(null);
            }
            
            if (!user.isAdmin && job.poster.uid !== user.uid) {
              this.error = 'You do not have permission to edit this job';
              this.loading = false;
              return of(null);
            }
            
            // Populate form with job data
            this.jobForm.patchValue({
              title: job.title,
              company: job.company,
              location: job.location,
              description: job.description,
              salary: job.salary || '',
              contactEmail: job.contactEmail,
              applicationUrl: job.applicationUrl || '',
              isActive: job.isActive
            });
            
            // Add requirements to form array
            const requirementsArray = this.jobForm.get('requirements') as FormArray;
            requirementsArray.clear();
            
            if (job.requirements && job.requirements.length > 0) {
              job.requirements.forEach(req => {
                requirementsArray.push(this.fb.control(req, Validators.required));
              });
            } else {
              this.addRequirement(); // Add at least one empty requirement field
            }
            
            this.loading = false;
            return of(job);
          })
        );
      })
    ).subscribe({
      error: (err) => {
        console.error('Error loading job:', err);
        this.error = 'Failed to load job. Please try again later.';
        this.loading = false;
      }
    });
  }

  get requirementsArray(): FormArray {
    return this.jobForm.get('requirements') as FormArray;
  }

  addRequirement(): void {
    this.requirementsArray.push(this.fb.control('', Validators.required));
  }

  removeRequirement(index: number): void {
    if (this.requirementsArray.length > 1) {
      this.requirementsArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.jobForm.invalid || !this.jobId) return;
    
    this.isSubmitting = true;
    this.error = null;
    
    const jobData = {
      ...this.jobForm.value,
      updatedAt: new Date()
    };
    
    this.jobService.updateJob(this.jobId, jobData)
      .then(() => {
        this.isSubmitting = false;
        this.router.navigate(['/jobs', this.jobId]);
      })
      .catch(error => {
        console.error('Error updating job:', error);
        this.error = 'Failed to update job. Please try again later.';
        this.isSubmitting = false;
      });
  }

  goBack(): void {
    if (this.jobId) {
      this.router.navigate(['/jobs', this.jobId]);
    } else {
      this.router.navigate(['/jobs']);
    }
  }
} 