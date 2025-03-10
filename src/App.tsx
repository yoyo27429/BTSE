import "./App.css";
import { useOrderBook } from "./hook/useOrderBookHook";
import { Order } from "./type/orderType";

function App() {
  const { orderBook } = useOrderBook("BTCPFC_0"); // 訂閱 BTC 永續合約

  // 單筆訂單列元件
  const OrderRow = ({
    order,
    type,
  }: // maxTotal,
  {
    order: Order;
    type: "ask" | "bid";
    // maxTotal: number;
  }) => {
    const bgColor = type === "ask" ? "bg-red-500/30" : "bg-green-500/30";
    const textColor = type === "ask" ? "text-red-500" : "text-green-500";
    // const barWidth = `${(order.price / maxTotal) * 100}%`;

    return (
      <div className="relative flex justify-between px-2 py-1 text-sm">
        <div
          className={`absolute right-0 top-0 h-full ${bgColor}`}
          // style={{ width: barWidth }}
        ></div>
        <span className={`${textColor} w-1/3`}>{order.price.toFixed(1)}</span>
        <span className="w-1/3 text-right text-[#F0F4F8]">
          {order.size.toFixed(4)}
        </span>
        <span className="w-1/3 text-right text-[#F0F4F8]">{0}</span>
      </div>
    );
  };

  return (
    <div className="p-4 m-auto w-[400px] h-[1000px] bg-[#131B29]">
      <p className="text-base font-bold text-left text-[#F0F4F8]">OrderBook</p>

      <div className="flex flex-col gap-4">
        {/* 賣單（Asks） - 反向排列 */}
        <div className="flex flex-col-reverse">
          {orderBook.asks.slice(0, 8).map((order, index) => (
            <OrderRow
              key={index}
              order={order}
              type="ask"
              // maxTotal={orderBook.asks[0].total}
            />
          ))}
        </div>
        <div className="flex px-2 py-1 text-sm  text-center justify-center font-bold">
          <span className={`text-green-500`}>199,620</span>
         
        </div>
        {/* 買單（Bids） */}
        <div className="flex flex-col">
          {orderBook.bids.slice(0, 8).map((order, index) => (
            <OrderRow
              key={index}
              order={order}
              type="bid"
              // maxTotal={orderBook.bids[bids.length - 1].total}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
