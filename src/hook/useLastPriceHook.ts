import { useEffect, useRef, useState } from "react";
import { lastPriceType } from "../type/orderType";

export function useLastPrice(symbol: string) {
  const [lastPrice, setLastPrice] = useState<lastPriceType>({ compare: "up", price: 0 });
  const socketRef = useRef<WebSocket | null>(null);
  const prevPriceRef = useRef<number>(0);  // 用來追蹤上一個價格

  useEffect(() => {
    const ws = new WebSocket("wss://ws.btse.com/ws/futures");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to BTSE WebSocket");
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: [`tradeHistoryApi:${symbol}`],
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.topic === `tradeHistoryApi`) {
        updateLastPrice(data.data[0]);
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


  const updateLastPrice = (data: any) => {
    // 檢查價格變動，更新 side
    const newSide = data.price > prevPriceRef.current ? "up" : (data.price < prevPriceRef.current ? "down" : "equal");

    // 更新上一個價格的 reference
    prevPriceRef.current = data.price;
    // 這裡強制觸發狀態更新
    setLastPrice((prev) => {
      if (prev.price !== data.price || prev.compare !== newSide) {
        return { compare: newSide, price: data.price };
      }
      return prev;  // 如果沒有變更，則不更新狀態，避免不必要的渲染
    });
  }

  return { lastPrice };
}
