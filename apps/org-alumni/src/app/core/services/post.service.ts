import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { UserService, User } from './user.service';

export interface Post {
  id?: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
  updatedAt?: Date;
  likes: string[]; // Array of user IDs who liked the post
  imageUrl?: string;
}

export interface PostWithAuthor extends Post {
  author: User;
  commentCount: number;
  likeCount: number;
  isLikedByCurrentUser: boolean;
}

export interface Comment {
  id?: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: Date;
}

export interface CommentWithAuthor extends Comment {
  author: User;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly postCollectionPath = 'posts';
  private readonly commentCollectionPath = 'comments';

  constructor(
    private firestoreService: FirestoreService,
    private userService: UserService
  ) {}

  // Posts methods
  getAllPosts(): Observable<PostWithAuthor[]> {
    return combineLatest([
      this.firestoreService.getCollection<Post>(
        this.postCollectionPath, 
        [this.firestoreService.orderByField('createdAt')]
      ),
      this.userService.currentUser$,
      this.getAllComments()
    ]).pipe(
      switchMap(([posts, currentUser, allComments]) => {
        if (posts.length === 0) return of([]);
        
        const authorIds = [...new Set(posts.map(post => post.authorId))];
        
        return combineLatest(
          authorIds.map(id => this.userService.getUserByUid(id))
        ).pipe(
          map(authors => {
            const authorMap = new Map<string, User>();
            authors.forEach(author => {
              if (author) authorMap.set(author.uid, author);
            });
            
            return posts.map(post => {
              const author = authorMap.get(post.authorId);
              const postComments = allComments.filter(comment => comment.postId === post.id);
              
              return {
                ...post,
                author: author!,
                commentCount: postComments.length,
                likeCount: post.likes.length,
                isLikedByCurrentUser: currentUser ? post.likes.includes(currentUser.uid) : false
              };
            });
          })
        );
      })
    );
  }

  getPostById(id: string): Observable<PostWithAuthor | null> {
    return this.firestoreService.getDocument<Post>(this.postCollectionPath, id).pipe(
      switchMap(post => {
        if (!post) return of(null);
        
        return combineLatest([
          this.userService.getUserByUid(post.authorId),
          this.getCommentsByPostId(id),
          this.userService.currentUser$
        ]).pipe(
          map(([author, comments, currentUser]) => {
            if (!author) return null;
            
            return {
              ...post,
              author,
              commentCount: comments.length,
              likeCount: post.likes.length,
              isLikedByCurrentUser: currentUser ? post.likes.includes(currentUser.uid) : false
            };
          })
        );
      })
    );
  }

  createPost(data: Omit<Post, 'id' | 'createdAt' | 'likes'>): Promise<any> {
    const newPost: Omit<Post, 'id'> = {
      ...data,
      createdAt: new Date(),
      likes: []
    };
    
    return this.firestoreService.addDocument(this.postCollectionPath, newPost);
  }

  updatePost(id: string, data: Partial<Post>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    return this.firestoreService.updateDocument<Post>(this.postCollectionPath, id, updateData);
  }

  deletePost(id: string): Promise<void> {
    return this.firestoreService.deleteDocument(this.postCollectionPath, id);
  }

  async toggleLike(postId: string, userId: string): Promise<void> {
    const post = await this.firestoreService.getDocument<Post>(this.postCollectionPath, postId).pipe(
      map(post => post)
    ).toPromise();
    
    if (!post) throw new Error('Post not found');
    
    const likes = [...post.likes];
    const index = likes.indexOf(userId);
    
    if (index > -1) {
      likes.splice(index, 1); // Unlike
    } else {
      likes.push(userId); // Like
    }
    
    return this.firestoreService.updateDocument<Post>(this.postCollectionPath, postId, { likes });
  }

  // Comments methods
  getAllComments(): Observable<Comment[]> {
    return this.firestoreService.getCollection<Comment>(
      this.commentCollectionPath,
      [this.firestoreService.orderByField('createdAt')]
    );
  }

  getCommentsByPostId(postId: string): Observable<CommentWithAuthor[]> {
    return this.firestoreService.getCollection<Comment>(
      this.commentCollectionPath,
      [
        this.firestoreService.whereEqual('postId', postId),
        this.firestoreService.orderByField('createdAt')
      ]
    ).pipe(
      switchMap(comments => {
        if (comments.length === 0) return of([]);
        
        const authorIds = [...new Set(comments.map(comment => comment.authorId))];
        
        return combineLatest(
          authorIds.map(id => this.userService.getUserByUid(id))
        ).pipe(
          map(authors => {
            const authorMap = new Map<string, User>();
            authors.forEach(author => {
              if (author) authorMap.set(author.uid, author);
            });
            
            return comments.map(comment => {
              const author = authorMap.get(comment.authorId);
              return {
                ...comment,
                author: author!
              };
            });
          })
        );
      })
    );
  }

  addComment(data: Omit<Comment, 'id' | 'createdAt'>): Promise<any> {
    const newComment: Omit<Comment, 'id'> = {
      ...data,
      createdAt: new Date()
    };
    
    return this.firestoreService.addDocument(this.commentCollectionPath, newComment);
  }

  updateComment(id: string, content: string): Promise<void> {
    return this.firestoreService.updateDocument<Comment>(this.commentCollectionPath, id, { content });
  }

  deleteComment(id: string): Promise<void> {
    return this.firestoreService.deleteDocument(this.commentCollectionPath, id);
  }
} 