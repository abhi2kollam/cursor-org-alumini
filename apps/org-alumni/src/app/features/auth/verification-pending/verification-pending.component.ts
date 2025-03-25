import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-verification-pending',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8">
        <div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verification Pending
          </h2>
          <div class="mt-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-24 w-24 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="mt-6 text-center text-lg text-gray-600">
            Your account is pending verification by an administrator.
          </p>
          <p class="mt-2 text-center text-md text-gray-500">
            Once your alumni status is verified, you will be able to access the portal.
          </p>
          <p class="mt-6 text-center text-sm text-gray-500">
            Please check back later or contact the administrator if you believe this is an error.
          </p>
          <div class="mt-8 flex justify-center">
            <a routerLink="/auth/login" class="text-indigo-600 hover:text-indigo-500 font-medium">
              Return to login
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class VerificationPendingComponent {} 