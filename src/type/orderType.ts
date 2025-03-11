export type Order = {
    price: number;
    size: number;
    isNew: boolean;
    sizeChange: "increase" | "decrease" | null;
};

export type Quotes = Order & {
    total: number
}

export type OrderBook = {
    asks: Quotes[];
    bids: Quotes[];
    seqNum: number;
};

export type lastPriceType = {
    compare: 'up' | 'down' | 'equal';
    price: number;

}