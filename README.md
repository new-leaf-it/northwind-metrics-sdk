# Northwind Metrics SDK

An asynchronous typescript library for accessing fun, useless metrics from OData.org's Northwind test database.

## Getting Started

From your project's home directory, run:

`npm install @andy-cline/northwind-metrics-sdk`

Typescript Version 5.6.3
Node Version 20.18.0


## Usage

```
// get the largest numerical postal code from the latest 100 orders
import NorthwindMetrics from "@andy-cline/northwind-metrics-sdk";
const client = new NorthwindMetrics('https://services.odata.org/northwind/northwind.svc');
client.getHighestPostalCode(100).then(value => {
    console.log(value);
});
```

## Methods

#### Get Order Metrics

Signature: <ins>getOrderMetrics(orderCount: number): Promise\<OrderMetrics></ins>

Returns: An average order amount of all the most recent number of orders as indicated by orderCount.
It also returns the name of the customer who had the largest order in the range and the name
of the customer with the smallest order in the range.

#### Get Highest Postal Code

Signature: <ins>getHighestPostalCode(orderCount: number): Promise\<string></ins>

Returns: The highest numerical postal code from the customers of the most recent orders using a range size
specified by orderCount. Non-numeric postal codes are ignored.

#### Get Customers By Country

Signature: <ins>getCustomersByCountry(countryCount: number):
Promise<CustomersByCountry[]></ins>

Returns: An array of CustomersByCountry entities sorted in alphabetical order with a limit
defined by countryCount. Each CustomersByCountry entity has the number of customers that are in
that country and the name of the country.