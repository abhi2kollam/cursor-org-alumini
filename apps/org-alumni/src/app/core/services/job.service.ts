import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Observable, combineLatest, map, of, switchMap } from 'rxjs';
import { UserService, User } from './user.service';

export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  salary?: string;
  applicationUrl?: string;
  contactEmail?: string;
  postedBy: string; // User ID
  postedAt: Date;
  updatedAt?: Date;
  isActive: boolean;
  applicants: string[]; // Array of user IDs
  referrals: {
    userId: string;
    referredName: string;
    referredEmail: string;
    referredPhone?: string;
    notes?: string;
    date: Date;
  }[];
}

export interface JobWithPoster extends Job {
  poster: User;
  applicantCount: number;
  referralCount: number;
  hasApplied: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private readonly collectionPath = 'jobs';

  constructor(
    private firestoreService: FirestoreService,
    private userService: UserService
  ) {}

  getAllJobs(): Observable<JobWithPoster[]> {
    return combineLatest([
      this.firestoreService.getCollection<Job>(
        this.collectionPath, 
        [
          this.firestoreService.whereEqual('isActive', true),
          this.firestoreService.orderByField('postedAt')
        ]
      ),
      this.userService.currentUser$
    ]).pipe(
      switchMap(([jobs, currentUser]) => {
        if (jobs.length === 0) return of([]);
        
        const posterIds = [...new Set(jobs.map(job => job.postedBy))];
        
        return combineLatest(
          posterIds.map(id => this.userService.getUserByUid(id))
        ).pipe(
          map(posters => {
            const posterMap = new Map<string, User>();
            posters.forEach(poster => {
              if (poster) posterMap.set(poster.uid, poster);
            });
            
            return jobs.map(job => {
              const poster = posterMap.get(job.postedBy);
              
              return {
                ...job,
                poster: poster!,
                applicantCount: job.applicants.length,
                referralCount: job.referrals.length,
                hasApplied: currentUser ? job.applicants.includes(currentUser.uid) : false
              };
            });
          })
        );
      })
    );
  }

  getJobById(id: string): Observable<JobWithPoster | null> {
    return this.firestoreService.getDocument<Job>(this.collectionPath, id).pipe(
      switchMap(job => {
        if (!job) return of(null);
        
        return combineLatest([
          this.userService.getUserByUid(job.postedBy),
          this.userService.currentUser$
        ]).pipe(
          map(([poster, currentUser]) => {
            if (!poster) return null;
            
            return {
              ...job,
              poster,
              applicantCount: job.applicants.length,
              referralCount: job.referrals.length,
              hasApplied: currentUser ? job.applicants.includes(currentUser.uid) : false
            };
          })
        );
      })
    );
  }

  createJob(data: Omit<Job, 'id' | 'postedAt' | 'applicants' | 'referrals' | 'isActive'>): Promise<any> {
    const newJob: Omit<Job, 'id'> = {
      ...data,
      postedAt: new Date(),
      isActive: true,
      applicants: [],
      referrals: []
    };
    
    return this.firestoreService.addDocument(this.collectionPath, newJob);
  }

  updateJob(id: string, data: Partial<Job>): Promise<void> {
    const updateData = {
      ...data,
      updatedAt: new Date()
    };
    
    return this.firestoreService.updateDocument<Job>(this.collectionPath, id, updateData);
  }

  deleteJob(id: string): Promise<void> {
    return this.firestoreService.deleteDocument(this.collectionPath, id);
  }

  async applyForJob(jobId: string, userId: string): Promise<void> {
    const job = await this.firestoreService.getDocument<Job>(this.collectionPath, jobId).pipe(
      map(job => job)
    ).toPromise();
    
    if (!job) throw new Error('Job not found');
    
    const applicants = [...job.applicants];
    if (!applicants.includes(userId)) {
      applicants.push(userId);
    }
    
    return this.firestoreService.updateDocument<Job>(this.collectionPath, jobId, { applicants });
  }

  async addReferral(
    jobId: string, 
    userId: string, 
    referralData: { 
      referredName: string; 
      referredEmail: string; 
      referredPhone?: string; 
      notes?: string; 
    }
  ): Promise<void> {
    const job = await this.firestoreService.getDocument<Job>(this.collectionPath, jobId).pipe(
      map(job => job)
    ).toPromise();
    
    if (!job) throw new Error('Job not found');
    
    const referrals = [...job.referrals];
    referrals.push({
      userId,
      ...referralData,
      date: new Date()
    });
    
    return this.firestoreService.updateDocument<Job>(this.collectionPath, jobId, { referrals });
  }

  toggleJobStatus(id: string, isActive: boolean): Promise<void> {
    return this.firestoreService.updateDocument<Job>(this.collectionPath, id, { isActive });
  }
} 