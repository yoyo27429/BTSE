import { useEffect, useRef, useState } from "react";
import { Order, OrderBook } from "../type/orderType";


export function useOrderBook(symbol: string) {
    const [orderBook, setOrderBook] = useState<OrderBook>({ asks: [], bids: [], seqNum: 0 });
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("wss://ws.btse.com/ws/oss/futures");
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("🔗 Connected to BTSE WebSocket");
            ws.send(
                JSON.stringify({
                    op: "subscribe",
                    args: [`update:${symbol}`],
                })
            );
        };

        ws.onmessage = (event) => {
            //   console.log("🔗 Message received:", event.data);
            const data = JSON.parse(event.data);
            if (data.topic === `update:${symbol}`) {
                updateOrderBook(data.data);
            }
        };

        ws.onerror = (error) => {
            console.error("❌ WebSocket Error:", error);
        };

        ws.onclose = () => {
            console.log("🔴 WebSocket Disconnected");
        };

        return () => {
            ws.close();
        };
    }, [symbol]);

    const updateOrderBook = (data: any) => {
        setOrderBook((prev) => {
            if (data.seqNum <= prev.seqNum) return prev; // 忽略過時數據

            return {
                asks: transformOrderData(data.asks),
                bids: transformOrderData(data.bids),
                seqNum: data.seqNum,
            };
        });
    };

    const transformOrderData = (orders: [string, string][]): Order[] => {
        return orders.map(([price, size]) => ({
            price: parseFloat(price),
            size: parseFloat(size),
        }));
    };

    return { orderBook };
}
