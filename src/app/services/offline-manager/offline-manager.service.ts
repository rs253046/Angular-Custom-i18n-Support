import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface OfflineRequest {
  method: string,
  url: string,
  body: any
}

interface StoreEntry {
  data: OfflineRequest,
  time: number
}

interface StoreRequestData {
  key: string,
  value: StoreEntry
}

@Injectable()
export class OfflineManagerService {
  private storagePrefix: string = 'offline';
  private storageExpiry: number = 3600 //mins
  public onOnline: EventEmitter<boolean> = new EventEmitter<boolean>();
  public onOffline: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private _http: HttpClient) {
    this.registerOnlineEvent();
    this.registerOfflineEvent();
    this.syncStorage();
  }

  registerOnlineEvent(): void {
    window.addEventListener('online', () => {
      this.syncStorage();
      this.syncOnlineApplicationState();
      this.onOnline.emit(true);
    });
  }

  registerOfflineEvent(): void {
    window.addEventListener('offline', () => {
      this.syncStorage();
      this.syncOfflineApplicationState();
      this.onOffline.emit(true);
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  isOffline(): boolean {
    return !navigator.onLine;
  }

  storeOfflineRequest(key: string, data: OfflineRequest): void {
    const entry: StoreEntry = { time: new Date().getTime(), data };
    localStorage.setItem(this.getStorageKey(key), JSON.stringify(entry));
  }

  getstoreOfflineRequest(key: string): string {
    return localStorage.getItem(this.getStorageKey(key));
  }

  getAllOfflineStoreRequests(): StoreRequestData[] {
    return this.getOfflineStorageKeys().map((storageKey: string) => {
      return { key: storageKey, value: JSON.parse(localStorage.getItem(storageKey)) };
    });
  }

  syncOfflineApplicationState(): void { }

  syncOnlineApplicationState(): void {
    const offlineRequests: StoreRequestData[] = this.getAllOfflineStoreRequests();
    offlineRequests.forEach((storeRequestData: StoreRequestData) =>
      this.syncNetwork(storeRequestData));
  }

  syncNetwork(storeRequestData: StoreRequestData): void {
    const { value, key } = storeRequestData;
    const { method, url, body } = value.data;
    localStorage.removeItem(key)
    this._http.request(method, url, { body })
      .subscribe(() => { }, () => { });
  }

  syncStorage(): void {
    this.getOfflineStorageKeys().forEach((storageKey: string) => {
      const store = localStorage.getItem(storageKey);
      const entry = store && JSON.parse(store);
      if (!!entry) {
        const now: number = new Date().getTime();
        const minutes: number = this.storageExpiry * 60 * 1000;
        if (now - minutes > entry.time) {
          localStorage.removeItem(storageKey);
        }
      }
    })
  }

  getOfflineStorageKeys(): string[] {
    return Object.keys(localStorage).filter((key: string) => key.includes(this.storagePrefix));
  }

  getStorageKey(key: string): string {
    return `${this.storagePrefix}:${key}`;
  }
}

