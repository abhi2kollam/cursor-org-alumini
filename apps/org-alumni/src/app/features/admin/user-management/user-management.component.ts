import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService, User } from '../../../core/services/user.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">User Management</h1>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="py-4">
          <div class="flex justify-between mb-4">
            <div class="w-1/3">
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (input)="filterUsers()"
                placeholder="Search users..." 
                class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
              >
            </div>
            <div>
              <button 
                type="button" 
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Export Users
              </button>
            </div>
          </div>
          
          <div class="flex flex-col">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee ID
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let user of filteredUsers">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-gray-900">
                            {{ user.displayName }}
                          </div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-500">{{ user.email }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-gray-500">{{ user.employeeId }}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span 
                            [ngClass]="user.isBlocked 
                              ? 'bg-red-100 text-red-800' 
                              : (user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')" 
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          >
                            {{ user.isBlocked ? 'Blocked' : (user.isVerified ? 'Active' : 'Pending') }}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ user.createdAt | date:'mediumDate' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            *ngIf="user.isVerified"
                            (click)="toggleBlockUser(user)" 
                            class="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            {{ user.isBlocked ? 'Unblock' : 'Block' }}
                          </button>
                          <button 
                            *ngIf="!user.isVerified"
                            (click)="verifyUser(user)" 
                            class="text-green-600 hover:text-green-900 mr-4"
                          >
                            Verify
                          </button>
                          <button 
                            (click)="deleteUser(user)" 
                            class="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                      
                      <tr *ngIf="filteredUsers.length === 0">
                        <td colspan="6" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          No users found
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
      this.filterUsers();
    });
  }

  filterUsers(): void {
    if (!this.searchQuery) {
      this.filteredUsers = this.users;
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.displayName.toLowerCase().includes(query) || 
      user.email.toLowerCase().includes(query) ||
      (user.employeeId?.toLowerCase().includes(query) || false)
    );
  }

  toggleBlockUser(user: User): void {
    if (!user.id) return;
    
    const newStatus = !user.isBlocked;
    this.userService.toggleBlockUser(user.id, newStatus)
      .then(() => {
        user.isBlocked = newStatus;
        console.log(`User ${newStatus ? 'blocked' : 'unblocked'}: ${user.displayName}`);
      })
      .catch(error => {
        console.error('Error toggling user block status:', error);
      });
  }

  verifyUser(user: User): void {
    if (!user.id) return;
    
    this.userService.verifyUser(user.id)
      .then(() => {
        user.isVerified = true;
        console.log(`User verified: ${user.displayName}`);
      })
      .catch(error => {
        console.error('Error verifying user:', error);
      });
  }

  deleteUser(user: User): void {
    if (!user.id) return;
    
    if (confirm(`Are you sure you want to delete ${user.displayName}?`)) {
      this.userService.deleteUser(user.id)
        .then(() => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.filterUsers();
          console.log(`User deleted: ${user.displayName}`);
        })
        .catch(error => {
          console.error('Error deleting user:', error);
        });
    }
  }
} 