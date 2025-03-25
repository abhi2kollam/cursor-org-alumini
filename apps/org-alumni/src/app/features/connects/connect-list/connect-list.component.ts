import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ConnectService } from '../../../core/services/connect.service';
import { User } from '../../../core/services/user.service';

@Component({
  selector: 'app-connect-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Alumni Network</h1>
        <p class="mt-1 text-sm text-gray-600">Connect with fellow alumni from the organization</p>
      </div>
      
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-6">
        <!-- Search and filter -->
        <div class="flex flex-col md:flex-row justify-between mb-6">
          <div class="w-full md:w-1/3 mb-4 md:mb-0">
            <label for="search" class="sr-only">Search</label>
            <div class="relative rounded-md shadow-sm">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                name="search"
                id="search"
                [(ngModel)]="searchQuery"
                (input)="searchAlumni()"
                class="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search by name or email"
              />
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div *ngIf="loading" class="flex justify-center py-12">
          <svg class="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>

        <!-- Alumni grid -->
        <div *ngIf="!loading" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div *ngFor="let alumni of filteredAlumni" class="bg-white overflow-hidden shadow rounded-lg">
            <div class="p-5">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-12 w-12">
                  <img 
                    *ngIf="alumni.photoURL" 
                    [src]="alumni.photoURL" 
                    alt="{{ alumni.displayName }}" 
                    class="h-12 w-12 rounded-full"
                  >
                  <div 
                    *ngIf="!alumni.photoURL" 
                    class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center"
                  >
                    <span class="text-xl font-medium text-indigo-800">
                      {{ getInitials(alumni.displayName) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">
                    {{ alumni.displayName }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ alumni.email }}
                  </p>
                </div>
              </div>
              
              <div class="mt-4 border-t border-gray-200 pt-4">
                <div class="flex justify-between">
                  <a 
                    [routerLink]="['/connects', alumni.id]" 
                    class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View Profile
                  </a>
                  
                  <div class="flex space-x-2">
                    <a 
                      *ngIf="alumni.linkedinUrl" 
                      [href]="alumni.linkedinUrl" 
                      target="_blank" 
                      class="text-gray-400 hover:text-blue-500"
                      title="LinkedIn"
                    >
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                    
                    <a 
                      *ngIf="alumni.twitterUrl" 
                      [href]="alumni.twitterUrl" 
                      target="_blank" 
                      class="text-gray-400 hover:text-blue-400"
                      title="Twitter"
                    >
                      <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div *ngIf="!loading && filteredAlumni.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No alumni found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchQuery ? 'Try a different search term' : 'There are no alumni in the system yet' }}
          </p>
        </div>
      </div>
    </div>
  `
})
export class ConnectListComponent implements OnInit {
  alumni: User[] = [];
  filteredAlumni: User[] = [];
  searchQuery: string = '';
  loading: boolean = true;

  constructor(private connectService: ConnectService) {}

  ngOnInit(): void {
    this.loadAlumni();
  }

  loadAlumni(): void {
    this.loading = true;
    this.connectService.getAllAlumni().subscribe({
      next: (alumni) => {
        this.alumni = alumni;
        this.filteredAlumni = alumni;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading alumni:', error);
        this.loading = false;
      }
    });
  }

  searchAlumni(): void {
    if (!this.searchQuery.trim()) {
      this.filteredAlumni = this.alumni;
      return;
    }

    this.loading = true;
    this.connectService.searchAlumni(this.searchQuery).subscribe({
      next: (results) => {
        this.filteredAlumni = results;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching alumni:', error);
        this.loading = false;
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '';
    
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
} 