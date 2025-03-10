export type Order = {
    price: number;
    size: number;
};
export type OrderBook = {
    asks: Order[];
    bids: Order[];
    seqNum: number;
};