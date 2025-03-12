import {useEffect, useState} from "react";
import "./App.css";
import {useLastPrice} from "./hook/useLastPriceHook";
import {useOrderBook} from "./hook/useOrderBookHook";
import {Quotes} from "./type/orderType";
function App() {
  const {orderBook} = useOrderBook("BTCPFC_0"); // 訂閱 BTC 永續合約
  const {lastPrice} = useLastPrice("BTCPFC");
  const [showAnime, setShowAnime] = useState<boolean>(false);

  useEffect(() => {
    setTimeout(() => {
      setShowAnime(true); // 顯示動畫
    }
      , 1000);
  }, [])
  const formatNumber = (num: number, fixnum: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: fixnum,
      maximumFractionDigits: fixnum,
    });
  };

  // 單筆訂單列元件
  const OrderRow = ({
    order,
    type,
  }: {
    order: Quotes;
    type: "ask" | "bid";
  }) => {
    const maxTotal =
      type === "ask" ? orderBook.asks[7].total : orderBook.bids[7].total;

    return (
      <div
        className={`relative flex justify-between py-0.5 text-sm font-bold gap-2 ${type === "ask"
          ? "hover:bg-quote-bid-hover"
          : "hover:bg-quote-ask-hover"
          } ${order.isNew == true
            ? type === "ask"
              ? "animate-bg-amine-red"
              : "animate-bg-amine-green"
            : ""
          }`}
      >
        <span
          className={`${type === "ask" ? "text-[#FF5B5A]" : "text-[#00b15d]"
            } w-1/3 text-left  ml-4`}
        >
          {formatNumber(order.price, 1)}
        </span>
        <span
          className={`w-1/3 text-right text-[#F0F4F8] ${order.sizeChange !== null
            ? order.sizeChange === "increase"
              ? "animate-bg-amine-red"
              : "animate-bg-amine-green"
            // "bg-animate-green"
            : ""
            }`}
        >
          {formatNumber(order.size, 0)}
        </span>
        <div className="w-1/3 relative m-0 p-0  text-right">
          <span className="text-right text-[#F0F4F8] z-10 mr-4">
            {formatNumber(order.total, 0)}
          </span>
          <div
            className={`absolute right-0 top-0 h-full ${type === "ask" ? "bg-accumulative-red" : "bg-accumulative-green"
              }`}
            style={{width: `${(order.total / maxTotal) * 100}%`}}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="py-4 m-auto w-[400px] h-[1000px] bg-[#131B29]">
      <p className="text-base font-bold text-left text-[#F0F4F8] mx-4 mb-4">OrderBook</p>
      <div className={`flex text-[#8698aa] gap-2 mx-4 ${showAnime ? "animate-bg-amine-red" : ""}`}>
        <div className="w-1/3 text-left">Price(USD)</div>
        <div className="w-1/3 text-right">Size</div>
        <div className="w-1/3 text-right">Total</div>
      </div>
      <div className="flex flex-col gap-4 ">
        {/* 賣單（Asks） - 反向排列 */}
        <div className="flex flex-col-reverse ">
          {orderBook.asks.map((order, index) => {
            return <OrderRow key={index} order={order} type="ask" />;
          })}
        </div>
        {/* last price */}
        <div
          className={`flex gap-2 px-2 py-1 text-sm  text-center justify-center font-bold items-center ${lastPrice.compare === "equal"
            ? "bg-lastprice-equal text-[#F0F4F8]"
            : lastPrice.compare === "up"
              ? "bg-lastprice-up text-[#00b15d]"
              : "bg-lastprice-down text-[#FF5B5A]"
            }`}
        >
          <span className="text-2xl">{formatNumber(lastPrice.price, 1)}</span>
          {lastPrice.compare !== "equal" && (
            <svg
              className={`w-4 h-4 ${lastPrice.compare === "up"
                ? "fill-[#00b15d] transform scale-y-[-1]"
                : "fill-[#FF5B5A]"
                }`}
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              role="presentation"
              fill="none"
              fill-rule="nonzero"
              stroke="currentColor"
              stroke-width="4"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          )}
        </div>
        {/* 買單（Bids） */}
        <div className="flex flex-col">
          {orderBook.bids.map((order, index) => (
            <OrderRow key={index} order={order} type="bid" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
