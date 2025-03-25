import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  DocumentReference,
  DocumentData,
  WithFieldValue
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  constructor(private firestore: Firestore) {}

  // Get a collection with optional query constraints
  getCollection<T>(path: string, queryFn?: any): Observable<T[]> {
    const collectionRef = collection(this.firestore, path);
    const queryRef = queryFn ? query(collectionRef, ...queryFn) : collectionRef;
    return collectionData(queryRef, { idField: 'id' }) as Observable<T[]>;
  }

  // Get a document by ID
  getDocument<T>(path: string, id: string): Observable<T> {
    const documentRef = doc(this.firestore, `${path}/${id}`);
    return docData(documentRef, { idField: 'id' }) as Observable<T>;
  }

  // Add a new document to a collection
  addDocument<T extends WithFieldValue<DocumentData>>(path: string, data: T): Promise<DocumentReference<DocumentData>> {
    const collectionRef = collection(this.firestore, path);
    return addDoc(collectionRef, data);
  }

  // Update a document
  updateDocument<T>(path: string, id: string, data: Partial<T>): Promise<void> {
    const documentRef = doc(this.firestore, `${path}/${id}`);
    return updateDoc(documentRef, data as DocumentData);
  }

  // Delete a document
  deleteDocument(path: string, id: string): Promise<void> {
    const documentRef = doc(this.firestore, `${path}/${id}`);
    return deleteDoc(documentRef);
  }

  // Query helpers
  whereEqual(field: string, value: any) {
    return where(field, '==', value);
  }

  orderByField(field: string, direction: 'asc' | 'desc' = 'desc') {
    return orderBy(field, direction);
  }

  limitTo(count: number) {
    return limit(count);
  }
} 