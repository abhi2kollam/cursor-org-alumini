import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { UserService } from '../../../core/services/user.service';
import { Storage, ref, uploadBytesResumable, getDownloadURL } from '@angular/fire/storage';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-post-create',
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
          <h1 class="text-2xl font-semibold text-gray-900">Create New Post</h1>
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

        <!-- Post form -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
            <div class="px-4 py-5 sm:p-6">
              <div class="grid grid-cols-1 gap-6">
                <div>
                  <label for="title" class="block text-sm font-medium text-gray-700">
                    Title *
                  </label>
                  <div class="mt-1">
                    <input 
                      type="text" 
                      id="title" 
                      formControlName="title" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    >
                  </div>
                  <p *ngIf="postForm.get('title')?.invalid && postForm.get('title')?.touched" class="mt-2 text-sm text-red-600">
                    Title is required and must be between 3 and 100 characters
                  </p>
                </div>

                <div>
                  <label for="content" class="block text-sm font-medium text-gray-700">
                    Content *
                  </label>
                  <div class="mt-1">
                    <textarea 
                      id="content" 
                      formControlName="content" 
                      rows="8" 
                      class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    ></textarea>
                  </div>
                  <p *ngIf="postForm.get('content')?.invalid && postForm.get('content')?.touched" class="mt-2 text-sm text-red-600">
                    Content is required and must be between 10 and 5000 characters
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">
                    Image (optional)
                  </label>
                  <div class="mt-1 flex items-center">
                    <div *ngIf="imagePreview" class="mr-4">
                      <img [src]="imagePreview" alt="Preview" class="h-32 w-auto object-cover rounded-md">
                    </div>
                    <label 
                      for="image-upload" 
                      class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                    >
                      <span>{{ imageFile ? 'Change image' : 'Upload an image' }}</span>
                      <input 
                        id="image-upload" 
                        name="image-upload" 
                        type="file" 
                        class="sr-only" 
                        accept="image/*"
                        (change)="onFileSelected($event)"
                      >
                    </label>
                    <button 
                      *ngIf="imageFile" 
                      type="button" 
                      (click)="removeImage()" 
                      class="ml-3 text-sm text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  <p *ngIf="imageError" class="mt-2 text-sm text-red-600">
                    {{ imageError }}
                  </p>
                </div>

                <!-- Upload progress -->
                <div *ngIf="uploadProgress > 0 && uploadProgress < 100" class="relative pt-1">
                  <div class="flex mb-2 items-center justify-between">
                    <div>
                      <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                        Uploading image
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-xs font-semibold inline-block text-indigo-600">
                        {{ uploadProgress }}%
                      </span>
                    </div>
                  </div>
                  <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                    <div 
                      [style.width.%]="uploadProgress" 
                      class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button 
                type="submit" 
                [disabled]="postForm.invalid || isSubmitting || uploadInProgress" 
                class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                [ngClass]="{'opacity-50 cursor-not-allowed': postForm.invalid || isSubmitting || uploadInProgress}"
              >
                {{ isSubmitting ? 'Creating...' : 'Create Post' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class PostCreateComponent implements OnInit {
  postForm: FormGroup;
  error: string | null = null;
  isSubmitting: boolean = false;
  imageFile: File | null = null;
  imagePreview: string | null = null;
  imageError: string | null = null;
  uploadProgress: number = 0;
  uploadInProgress: boolean = false;

  constructor(
    private postService: PostService,
    private userService: UserService,
    private router: Router,
    private fb: FormBuilder,
    private storage: Storage
  ) {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]]
    });
  }

  ngOnInit(): void {
    // Check if user is logged in
    this.userService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login'], { queryParams: { returnUrl: '/posts/create' } });
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.imageError = null;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
      this.imageError = 'Only JPEG, PNG, and GIF images are allowed.';
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.imageError = 'Image size must be less than 5MB.';
      return;
    }

    this.imageFile = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.imageFile = null;
    this.imagePreview = null;
    this.imageError = null;
    this.uploadProgress = 0;
  }

  async uploadImage(): Promise<string | null> {
    if (!this.imageFile) return null;

    this.uploadInProgress = true;

    try {
      const filePath = `posts/${Date.now()}_${this.imageFile.name}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, this.imageFile);

      return new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
            this.uploadProgress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          },
          (error) => {
            console.error('Upload failed:', error);
            this.imageError = 'Failed to upload image. Please try again.';
            this.uploadInProgress = false;
            reject(error);
          },
          async () => {
            // Upload completed successfully
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            this.uploadInProgress = false;
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error in uploadImage:', error);
      this.imageError = 'Failed to upload image. Please try again.';
      this.uploadInProgress = false;
      return null;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.postForm.invalid) return;

    this.isSubmitting = true;
    this.error = null;

    try {
      // First upload image if there is one
      let imageUrl: string | null = null;
      if (this.imageFile) {
        imageUrl = await this.uploadImage();
        if (!imageUrl && this.imageError) {
          this.isSubmitting = false;
          return;
        }
      }

      // Get current user
      const user = await firstValueFrom(this.userService.currentUser$);
      if (!user) {
        this.error = 'You must be logged in to create a post.';
        this.isSubmitting = false;
        return;
      }

      const postData = {
        title: this.postForm.value.title,
        content: this.postForm.value.content,
        authorId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
        likeCount: 0,
        commentCount: 0,
        imageUrl: imageUrl ?? ''
      };

      const postId = await this.postService.createPost(postData);
      this.isSubmitting = false;
      this.router.navigate(['/posts', postId]);
    } catch (error) {
      console.error('Error creating post:', error);
      this.error = 'Failed to create post. Please try again later.';
      this.isSubmitting = false;
    }
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }
} 