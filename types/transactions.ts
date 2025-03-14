export interface UseWebSocketProps {
    url: string;
    onMessage?: (data: any) => void; 
    reconnectInterval?: number; 
    maxReconnectAttempts?: number; 
}

export interface Merchant {
    id: string;
    name: string;
    transactionCount: number;
    transactionVolume: number;
    city: string;
    address?: string;
    phone?: string;
    email?: string;
  }

interface Transaction {
    id: string;
    amount: number;
    merchantId: string;
    merchantName: string;
    status: "completed" | "pending" | "failed" | "refunded";
    timestamp: string;
    userId: string;
    currency: string;
    location: string;  
}


