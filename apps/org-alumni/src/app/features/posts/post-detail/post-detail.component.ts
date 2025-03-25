import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService, PostWithAuthor, Comment, CommentWithAuthor } from '../../../core/services/post.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-post-detail',
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
            Back to Posts
          </button>
          <h1 class="text-2xl font-semibold text-gray-900">Post Details</h1>
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

        <!-- Post details -->
        <div *ngIf="!loading && !error && post" class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">{{ post.title }}</h2>
                <p class="mt-1 text-sm text-gray-500">
                  Posted by {{ post.author.displayName }} on {{ post.createdAt | date:'medium' }}
                </p>
              </div>
              <div *ngIf="canEdit()" class="flex space-x-2">
                <a 
                  [routerLink]="['/posts', post.id, 'edit']" 
                  class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Edit
                </a>
                <button 
                  (click)="deletePost()" 
                  class="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
            
            <div class="mt-6">
              <p class="text-gray-700 whitespace-pre-line">{{ post.content }}</p>
            </div>
            
            <div *ngIf="post.imageUrl" class="mt-6">
              <img [src]="post.imageUrl" alt="Post image" class="max-h-96 w-auto rounded-md">
            </div>
            
            <div class="mt-6 flex items-center space-x-4">
              <button 
                (click)="toggleLike()" 
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
            </div>
          </div>
          
          <!-- Comments section -->
          <div class="px-4 py-5 sm:px-6 border-t border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Comments ({{ comments.length }})</h3>
            
            <!-- Comment form -->
            <div *ngIf="currentUserId" class="mt-4">
              <form [formGroup]="commentForm" (ngSubmit)="submitComment()">
                <div>
                  <label for="comment" class="sr-only">Comment</label>
                  <textarea 
                    id="comment" 
                    formControlName="content" 
                    rows="3" 
                    class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Add a comment..."
                  ></textarea>
                </div>
                <div class="mt-2 flex justify-end">
                  <button 
                    type="submit" 
                    [disabled]="commentForm.invalid || isSubmittingComment" 
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    [ngClass]="{'opacity-50 cursor-not-allowed': commentForm.invalid || isSubmittingComment}"
                  >
                    {{ isSubmittingComment ? 'Posting...' : 'Post Comment' }}
                  </button>
                </div>
              </form>
            </div>
            
            <div *ngIf="!currentUserId" class="mt-4 text-center py-4 border border-gray-200 rounded-md">
              <p class="text-sm text-gray-500">
                Please <a routerLink="/login" class="text-indigo-600 hover:text-indigo-500">sign in</a> to leave a comment.
              </p>
            </div>
            
            <!-- Comments list -->
            <div class="mt-6 space-y-6">
              <div *ngIf="comments.length === 0" class="text-center py-4">
                <p class="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
              </div>
              
              <div *ngFor="let comment of comments" class="flex space-x-3">
                <div class="flex-shrink-0">
                  <img 
                    [src]="comment.author.photoURL || 'assets/images/default-avatar.png'" 
                    alt="User avatar" 
                    class="h-10 w-10 rounded-full"
                  >
                </div>
                <div class="flex-1 bg-gray-50 rounded-lg px-4 py-2 sm:px-6 sm:py-4">
                  <div class="flex justify-between items-center">
                    <h4 class="text-sm font-medium text-gray-900">{{ comment.author.displayName }}</h4>
                    <p class="text-xs text-gray-500">{{ comment.createdAt | date:'medium' }}</p>
                  </div>
                  <div class="mt-1 text-sm text-gray-700">
                    <p>{{ comment.content }}</p>
                  </div>
                  <div *ngIf="canDeleteComment(comment)" class="mt-2 text-right">
                    <button 
                      (click)="deleteComment(comment.id!)" 
                      class="text-xs text-red-600 hover:text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PostDetailComponent implements OnInit {
  post: PostWithAuthor | null = null;
  comments: CommentWithAuthor[] = [];
  loading: boolean = true;
  error: string | null = null;
  commentForm: FormGroup;
  isSubmittingComment: boolean = false;
  currentUserId: string | null = null;
  isAdmin: boolean = false;
  
  constructor(
    private postService: PostService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.currentUserId = user?.uid || null;
      this.isAdmin = user?.isAdmin || false;
    });
    
    this.loadPost();
  }

  loadPost(): void {
    this.loading = true;
    this.error = null;
    
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Post ID not found';
      this.loading = false;
      return;
    }
    
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.post = post;
        if (!post) {
          this.error = 'Post not found';
          this.loading = false;
          return;
        }
        
        this.loadComments(id);
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.error = 'Failed to load post. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadComments(postId: string): void {
    this.postService.getCommentsByPostId(postId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
      }
    });
  }

  toggleLike(): void {
    if (!this.post || !this.post.id || !this.currentUserId) return;
    
    if (this.post.isLikedByCurrentUser) {
      this.postService.toggleLike(this.post.id, this.currentUserId)
        .then(() => {
          if (this.post) {
            this.post.isLikedByCurrentUser = false;
            this.post.likeCount = Math.max(0, this.post.likeCount - 1);
          }
        })
        .catch(error => {
          console.error('Error unliking post:', error);
        });
    } else {
      this.postService.toggleLike(this.post.id, this.currentUserId)
        .then(() => {
          if (this.post) {
            this.post.isLikedByCurrentUser = true;
            this.post.likeCount += 1;
          }
        })
        .catch(error => {
          console.error('Error liking post:', error);
        });
    }
  }

  deletePost(): void {
    if (!this.post) return;
    
    this.postService.deletePost(this.post.id!)
      .then(() => {
        this.router.navigate(['/posts']);
      })
      .catch(error => {
        console.error('Error deleting post:', error);
        this.error = 'Failed to delete post. Please try again later.';
      });
  }

  submitComment(): void {
    if (!this.currentUserId || !this.post) return;
    
    this.isSubmittingComment = true;
    const commentData = {
      postId: this.post.id!,
      authorId: this.currentUserId,
      content: this.commentForm.value.content
    };
    
    this.postService.addComment(commentData)
      .then(() => {
        this.commentForm.reset();
        this.isSubmittingComment = false;
        this.loadComments(this.post!.id!);
      })
      .catch(error => {
        console.error('Error submitting comment:', error);
        this.error = 'Failed to submit comment. Please try again later.';
        this.isSubmittingComment = false;
      });
  }

  canDeleteComment(comment: CommentWithAuthor): boolean {
    if (!this.currentUserId) return false;
    return this.isAdmin || comment.author.uid === this.currentUserId;
  }

  deleteComment(commentId: string): void {
    if (!this.currentUserId || !this.post?.id) return;
    
    this.postService.deleteComment(commentId)
      .then(() => {
        this.loadComments(this.post!.id!);
      })
      .catch(error => {
        console.error('Error deleting comment:', error);
        this.error = 'Failed to delete comment. Please try again later.';
      });
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }

  canEdit(): boolean {
    if (!this.post || !this.currentUserId) return false;
    return this.isAdmin || this.post.author.uid === this.currentUserId;
  }
} 