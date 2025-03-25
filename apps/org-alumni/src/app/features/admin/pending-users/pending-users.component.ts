import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, User } from '../../../core/services/user.service';

@Component({
  selector: 'app-pending-users',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 class="text-2xl font-semibold text-gray-900">Pending Verifications</h1>
      </div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div class="py-4">
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
                          Registration Date
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr *ngFor="let user of pendingUsers">
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
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {{ user.createdAt | date:'mediumDate' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button 
                            (click)="approveUser(user)" 
                            class="text-green-600 hover:text-green-900 mr-4"
                          >
                            Approve
                          </button>
                          <button 
                            (click)="rejectUser(user)" 
                            class="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                      
                      <tr *ngIf="pendingUsers.length === 0">
                        <td colspan="5" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                          No pending verifications
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
export class PendingUsersComponent implements OnInit {
  pendingUsers: User[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.loadPendingUsers();
  }

  loadPendingUsers(): void {
    this.userService.getPendingUsers().subscribe(users => {
      this.pendingUsers = users;
    });
  }

  approveUser(user: User): void {
    if (!user.id) return;
    
    this.userService.verifyUser(user.id)
      .then(() => {
        this.pendingUsers = this.pendingUsers.filter(u => u.id !== user.id);
        console.log(`User approved: ${user.displayName}`);
      })
      .catch(error => {
        console.error('Error approving user:', error);
      });
  }

  rejectUser(user: User): void {
    if (!user.id) return;
    
    if (confirm(`Are you sure you want to reject ${user.displayName}?`)) {
      this.userService.deleteUser(user.id)
        .then(() => {
          this.pendingUsers = this.pendingUsers.filter(u => u.id !== user.id);
          console.log(`User rejected: ${user.displayName}`);
        })
        .catch(error => {
          console.error('Error rejecting user:', error);
        });
    }
  }
} 