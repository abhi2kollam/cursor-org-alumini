import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-job-create',
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
          <h1 class="text-2xl font-semibold text-gray-900">Post New Job</h1>
        </div>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
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
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
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
                      rows="3" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter job description"
                    ></textarea>
                  </div>
                  <p *ngIf="jobForm.get('description')?.invalid && jobForm.get('description')?.touched" class="mt-2 text-sm text-red-600">
                    Description is required
                  </p>
                </div>

                <div class="sm:col-span-6">
                  <label for="requirements" class="block text-sm font-medium text-gray-700">
                    Requirements *
                  </label>
                  <div class="mt-1">
                    <textarea 
                      id="requirements" 
                      formControlName="requirements" 
                      rows="3" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter job requirements"
                    ></textarea>
                  </div>
                  <p *ngIf="jobForm.get('requirements')?.invalid && jobForm.get('requirements')?.touched" class="mt-2 text-sm text-red-600">
                    Requirements are required
                  </p>
                </div>

                <div class="sm:col-span-6">
                  <label for="salary" class="block text-sm font-medium text-gray-700">
                    Salary (optional)
                  </label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="salary" 
                      formControlName="salary" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                </div>

                <div class="sm:col-span-6">
                  <label for="contactEmail" class="block text-sm font-medium text-gray-700">
                    Contact Email (optional)
                  </label>
                  <div class="mt-1">
                    <input 
                      type="email" 
                      id="contactEmail" 
                      formControlName="contactEmail" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                </div>

                <div class="sm:col-span-6">
                  <label for="applicationUrl" class="block text-sm font-medium text-gray-700">
                    Application Link (optional)
                  </label>
                  <div class="mt-1">
                    <input 
                      type="url" 
                      id="applicationUrl" 
                      formControlName="applicationUrl" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div class="px-4 py-4 sm:px-6 flex justify-end space-x-3">
              <button 
                type="submit" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class JobCreateComponent implements OnInit {
  jobForm: FormGroup;
  error: string | null = null;

  constructor(
    private jobService: JobService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.jobForm = this.fb.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: ['', Validators.required],
      description: ['', Validators.required],
      requirements: ['', Validators.required],
      salary: [''],
      contactEmail: [''],
      applicationUrl: ['']
    });
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  onSubmit(): void {
    if (this.jobForm.invalid) {
      this.error = 'Please fill in all required fields';
      return;
    }

    const jobData = this.jobForm.value;
    this.jobService.createJob(jobData).then(() => {
      this.router.navigate(['/jobs']);
    }).catch(error => {
      console.error('Error adding job:', error);
      this.error = 'Failed to add job. Please try again later.';
    });
  }

  goBack(): void {
    this.router.navigate(['/jobs']);
  }
} 