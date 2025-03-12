import {useEffect, useRef, useState} from "react";
import {Order, OrderBook, Quotes} from "../type/orderType";


export function useOrderBook(symbol: string) {
    const [orderBook, setOrderBook] = useState<OrderBook>({asks: [], bids: [], seqNum: 0});

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket("wss://ws.btse.com/ws/oss/futures");
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("Connected to BTSE WebSocket");
            ws.send(
                JSON.stringify({
                    op: "subscribe",
                    args: [`update:${symbol}`],
                })
            );
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.topic === `update:${symbol}`) {
                updateOrderBook(data.data);
            }
        };

        ws.onerror = (error) => {
            console.error("WebSocket Error:", error);
        };

        ws.onclose = () => {
            console.log("WebSocket Disconnected");
        };

        return () => {
            ws.close();
        };
    }, [symbol]);

    const updateOrderBook = (data: any) => {
        setOrderBook((prev) => {

            // 📌 Snapshot: 設定初始 50 層訂單
            if (data.type === "snapshot") {
                const asks = transformOrderData(data.asks).filter(order => order.size > 0).sort((a, b) => a.price - b.price); // 賣單排序
                const bids = transformOrderData(data.bids).filter(order => order.size > 0).sort((a, b) => b.price - a.price); // 買單排序

                const askWithTotal = calculateTotal(asks);
                const bidWithTotal = calculateTotal(bids);

                return {
                    asks: askWithTotal.slice(0, 8),  // 只回傳前 8 層賣單
                    bids: bidWithTotal.slice(0, 8),  // 只回傳前 8 層買單
                    seqNum: data.seqNum,
                };
            }

            // 📌 Delta: 更新訂單簿
            if (data.type === "delta") {
                // 📌 如果數據不同步，重新訂閱
                if (data.prevSeqNum !== prev.seqNum) {
                    resubscribe();
                    return prev;
                }

                // 更新訂單簿，過濾掉 size = 0 的訂單，並且排序
                const updatedAsks = updateOrders(prev.asks, data.asks).filter(order => order.size > 0).sort((a, b) => a.price - b.price);
                const updatedBids = updateOrders(prev.bids, data.bids).filter(order => order.size > 0).sort((a, b) => b.price - a.price);

                // 計算累積的數量
                const askWithTotal = calculateTotal(updatedAsks.slice(0, 8)); // 只回傳前 8 層買單
                const bidWithTotal = calculateTotal(updatedBids.slice(0, 8)); // 只回傳前 8 層賣單

                return {
                    asks: askWithTotal,
                    bids: bidWithTotal,
                    seqNum: data.seqNum,
                };
            }

            return prev;
        });
    };

    /** 處理訂單更新的函數 */
    const updateOrders = (prevOrders: Order[], updates: [string, string][]) => {
        const orderMap = new Map(prevOrders.map((o) => [o.price, o]));

        updates.forEach(([price, size]) => {
            const parsedPrice = parseFloat(price);
            const parsedSize = parseFloat(size);

            if (parsedSize === 0) {
                // 如果 size 為 0，刪除該價格
                orderMap.delete(parsedPrice);
            } else {
                const prevOrder = orderMap.get(parsedPrice);

                orderMap.set(parsedPrice, {
                    price: parsedPrice,
                    size: parsedSize,
                    isNew: !prevOrder, // **第一次出現設為 true**
                    sizeChange: prevOrder
                        ? parsedSize > prevOrder.size
                            ? "increase"
                            : parsedSize < prevOrder.size
                                ? "decrease"
                                : null
                        : null, // **如果是新價格, 沒有 sizeChange**
                });
            }
        });

        // 按價格排序 (買單降序, 賣單升序)
        return Array.from(orderMap.values()).sort((a, b) => a.price - b.price);
    }

    // 計算 total
    const calculateTotal = (orders: Order[]): Quotes[] => {
        let total = 0;
        return orders.map(order => {
            total += order.size;
            return {
                ...order,
                total: total,
            };
        });
    };


    /** 重新訂閱 */
    const resubscribe = () => {
        socketRef.current?.send(JSON.stringify({op: "unsubscribe", args: [`update:${symbol}`]}));
        socketRef.current?.send(JSON.stringify({op: "subscribe", args: [`update:${symbol}`]}));
    };

    // 重組資料
    const transformOrderData = (orders: [string, string][]): Order[] => {
        return orders.map(([price, size]) => ({
            price: parseFloat(price),
            size: parseFloat(size),
            isNew: false,
            sizeChange: null
        }));
    };

    return {orderBook};
}
