import { Injectable, signal, computed } from '@angular/core';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { environment } from '../../../environments/environment';

export interface WsNotification {
  id: number;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  // Reactive Angular Signals — consumed by NavbarComponent
  readonly wsNotifications = signal<WsNotification[]>([]);
  readonly unreadCount = signal<number>(0);
  readonly connected = signal<boolean>(false);

  private client: Client | null = null;
  private subscription: StompSubscription | null = null;

  connect(token: string): void {
    if (this.client?.active) return; // already connected

    const apiBase = environment.apiUrl; // e.g. '/api' or 'http://localhost:8080/api'
    let wsUrl: string;
    if (apiBase.startsWith('http')) {
      wsUrl = apiBase.replace(/^http/, 'ws').replace(/\/api$/, '/ws');
    } else {
      // Relative URL (production Docker): /api → ws://[same host]/ws
      const loc = window.location;
      const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${proto}//${loc.host}/ws`;
    }

    this.client = new Client({
      // Use native WebSocket factory — no SockJS required
      webSocketFactory: () => new WebSocket(wsUrl),
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      onConnect: () => {
        this.connected.set(true);
        this.subscription = this.client!.subscribe('/user/queue/notifications', (msg: IMessage) => {
          try {
            const notif: WsNotification = JSON.parse(msg.body);
            this.wsNotifications.update((n) => [notif, ...n]);
            this.unreadCount.update((c) => c + 1);
          } catch (e) {
            console.warn('[WS] Failed to parse notification:', e);
          }
        });
      },
      onDisconnect: () => {
        this.connected.set(false);
      },
      onStompError: (frame) => {
        console.warn('[WS] STOMP error:', frame.headers['message']);
        this.connected.set(false);
      },
    });

    this.client.activate();
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.client?.deactivate();
    this.client = null;
    this.connected.set(false);
    this.wsNotifications.set([]);
    this.unreadCount.set(0);
  }

  clearUnread(): void {
    this.unreadCount.set(0);
  }
}
