export class OrderMetrics {
    averageOrderAmount: number;
    customerNameWithLargestOrder: string;
    customerNameWithSmallestOrder: string;
}

export class CustomersByCountry {
    countryName: string;
    customerCount: number;
}

export declare type OrderDetail = {
    OrderID: string;
    ProductID: string;
    UnitPrice: number;
    Quantity: number;
    Discount: number;
}

export declare type Order = {
    OrderID: string;
    ShipCountry: string;
    ShipName: string;
    ShipPostalCode: string;
    Order_Details: OrderDetail[];
}

export declare type Customer = {
    Country: string;
}

export declare type ODataArrayResponse = {
    value: [];
}
