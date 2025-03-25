import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PostService, PostWithAuthor } from '../../../core/services/post.service';
import { UserService } from '../../../core/services/user.service';
import { Observable, map } from 'rxjs';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold text-gray-900">Alumni Posts</h1>
          <a 
            routerLink="/posts/create" 
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Create Post
          </a>
        </div>
        
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              (ngModelChange)="filterPosts()"
              placeholder="Search posts by title or content..." 
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
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

        <!-- No posts message -->
        <div *ngIf="!loading && filteredPosts.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No posts found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ searchQuery ? 'Try adjusting your search query.' : 'Be the first to share something with the community!' }}
          </p>
          <div class="mt-6">
            <a 
              routerLink="/posts/create" 
              class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              Create Post
            </a>
          </div>
        </div>

        <!-- Post list -->
        <div *ngIf="!loading && filteredPosts.length > 0" class="space-y-6">
          <div *ngFor="let post of filteredPosts" class="bg-white shadow overflow-hidden sm:rounded-lg">
            <div class="px-4 py-5 sm:px-6">
              <div class="flex justify-between items-start">
                <div>
                  <a [routerLink]="['/posts', post.id]" class="text-xl font-medium text-indigo-600 hover:text-indigo-500">
                    {{ post.title }}
                  </a>
                  <p class="mt-1 text-sm text-gray-500">
                    Posted by {{ post.author.displayName }} on {{ post.createdAt | date:'medium' }}
                  </p>
                </div>
                <div *ngIf="canEdit(post)" class="flex space-x-2">
                  <a 
                    [routerLink]="['/posts', post.id, 'edit']" 
                    class="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50"
                  >
                    Edit
                  </a>
                </div>
              </div>
              
              <div class="mt-4">
                <p *ngIf="post.content.length > 300" class="text-gray-700">
                  {{ post.content.substring(0, 300) }}...
                  <a [routerLink]="['/posts', post.id]" class="text-indigo-600 hover:text-indigo-500">
                    Read more
                  </a>
                </p>
                <p *ngIf="post.content.length <= 300" class="text-gray-700">
                  {{ post.content }}
                </p>
              </div>
              
              <div *ngIf="post.imageUrl" class="mt-4">
                <img [src]="post.imageUrl" alt="Post image" class="h-48 w-full object-cover rounded-md">
              </div>
              
              <div class="mt-4 flex items-center space-x-4">
                <button 
                  (click)="toggleLike(post)" 
                  class="flex items-center text-sm text-gray-500 hover:text-gray-700"
                  [class.text-blue-600]="post.isLikedByCurrentUser"
                >
                  <svg 
                    [class.text-blue-600]="post.isLikedByCurrentUser"
                    class="h-5 w-5 mr-1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {{ post.likeCount }} {{ post.likeCount === 1 ? 'Like' : 'Likes' }}
                </button>
                
                <a 
                  [routerLink]="['/posts', post.id]" 
                  class="flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <svg class="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" />
                  </svg>
                  {{ post.commentCount }} {{ post.commentCount === 1 ? 'Comment' : 'Comments' }}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PostListComponent implements OnInit {
  posts: PostWithAuthor[] = [];
  filteredPosts: PostWithAuthor[] = [];
  loading: boolean = true;
  searchQuery: string = '';
  currentUserId: string | null = null;
  isAdmin: boolean = false;
  
  constructor(
    private postService: PostService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    
    this.userService.currentUser$.subscribe(user => {
      this.currentUserId = user?.uid || null;
      this.isAdmin = user?.isAdmin || false;
    });
  }

  loadPosts(): void {
    this.loading = true;
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.filterPosts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading posts:', error);
        this.loading = false;
      }
    });
  }

  filterPosts(): void {
    if (!this.searchQuery.trim()) {
      this.filteredPosts = this.posts;
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredPosts = this.posts.filter(post => 
      post.title.toLowerCase().includes(query) || 
      post.content.toLowerCase().includes(query)
    );
  }

  toggleLike(post: PostWithAuthor): void {
    if (!this.currentUserId || !post.id) return;
    
    this.postService.toggleLike(post.id, this.currentUserId)
      .then(() => {
        post.isLikedByCurrentUser = !post.isLikedByCurrentUser;
        post.likeCount = post.isLikedByCurrentUser 
          ? post.likeCount + 1 
          : Math.max(0, post.likeCount - 1);
      })
      .catch(error => {
        console.error('Error toggling like:', error);
      });
  }

  canEdit(post: PostWithAuthor): boolean {
    if (!this.currentUserId) return false;
    return this.isAdmin || post.author.uid === this.currentUserId;
  }
} 