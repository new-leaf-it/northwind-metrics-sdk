import {Base} from "../base";
import {OrderMetrics, CustomersByCountry, Order, Customer} from "./types";

export class Metrics extends Base {
    /**
     * Returns an average order amount of all the most recent number of orders as indicated by orderCount.
     * It also returns the name of the customer who had the largest order in the range and the name
     * of the customer with the smallest order in the range.
     * @param orderCount How many of most recent orders you would like to search
     * @return OrderMetrics
     */
    public getOrderMetrics(orderCount: number): Promise<OrderMetrics> {
        const metrics = new OrderMetrics();

        return this.getRecentOrders(orderCount).then((orders) => {
            let largestOrderAmount = 0;
            let smallestOrderAmount = 0;
            let numberOfOrders = 0;
            let totalOrderAmount = 0;

            metrics.averageOrderAmount = 0;
            metrics.customerNameWithLargestOrder = '';
            metrics.customerNameWithSmallestOrder = '';

            orders.forEach((order) => {
                // I could use Order_Subtotals to get the subtotal for each order, but would rather not for performance reasons.
                // But, how are they handling rounding when discounts are applied?
                // OrderID 11027 is giving me 877.7249999999999, rounded 2 places is 877.72
                // But, Order_Subtotals shows 877.73 https://services.odata.org/V4/Northwind/Northwind.svc/Order_Subtotals?$filter=OrderID%20eq%2011027
                // Calculator on Mac shows 877.725 from (4.5×30×0.75)+(49.3×21×0.75)
                // Northwind does round down in obvious situations ie OrderID: 10891; math says 368.933, Order_Subtotals gives 368.93
                let subtotal = order.Order_Details.reduce((accumulator, details) => accumulator +
                    (details.UnitPrice * details.Quantity) * (1 - details.Discount)
                , 0);

                // let's cancel out some floating point arithmetic precision issues
                subtotal = parseFloat((Math.floor(subtotal * 10000) / 10000).toFixed(2));

                if (subtotal > largestOrderAmount) {
                    largestOrderAmount = subtotal;
                    metrics.customerNameWithLargestOrder = order.ShipName;
                }
                if (smallestOrderAmount == 0 || subtotal < smallestOrderAmount) {
                    smallestOrderAmount = subtotal;
                    metrics.customerNameWithSmallestOrder = order.ShipName;
                }
                totalOrderAmount += subtotal;
                numberOfOrders += 1;
            });

            if (numberOfOrders > 0) {
                metrics.averageOrderAmount = +((totalOrderAmount / numberOfOrders).toFixed(2)); // round and convert to number
            }

            return metrics;
        });
    }

    /**
     * Returns the highest numerical postal code from the customers of the most recent orders using a range size
     * specified by orderCount. Non-numeric postal codes are ignored.
     * @param orderCount How many of most recent orders you would like to search
     * @return string|null Postal code or null if no numeric postal codes are found.
     */
    public getHighestPostalCode(orderCount: number): Promise<string|null> {
        let highestPostalCode = null;

        return this.getRecentOrders(orderCount).then((orders) => {
            orders.forEach((order) => {
                let postalCode = parseInt(order.ShipPostalCode); // check "isNumeric"
                if (postalCode.toString() == order.ShipPostalCode && (highestPostalCode == null || postalCode > highestPostalCode)) {
                    highestPostalCode = order.ShipPostalCode;
                }
            });

            return highestPostalCode;
        });
    }

    /**
     * Returns an array of CustomersByCountry entities sorted in alphabetical order with a limit
     * defined by countryCount. Each CustomersByCountry entity has the number of customers that are in
     * that country and the name of the country.
     * @param countryCount Number of countries to return. The maximum is defined by how many countries are represented in the database.
     * @return CustomersByCountry
     */
    public getCustomersByCountry(countryCount: number): Promise<CustomersByCountry[]> {
        const countriesIndex = new Map<string, CustomersByCountry>();

        // provide a callback that merges customers by country
        let callback = function(pagedResults: Customer[]): [boolean, any[]] {
            let limitReached = (pagedResults.length == 0);
            pagedResults.forEach((searchResult) => {
                let countryIndexItem = null;
                if (countriesIndex.has(searchResult.Country)) {
                    countryIndexItem = countriesIndex.get(searchResult.Country);
                }
                else if (countriesIndex.size < countryCount) {
                    countryIndexItem = new CustomersByCountry();
                    countryIndexItem.countryName = searchResult.Country;
                    countryIndexItem.customerCount = 0;
                }

                if (countryIndexItem != null) {
                    countryIndexItem.customerCount += 1;
                    countriesIndex.set(searchResult.Country, countryIndexItem);
                }

                // We can't stop paging as soon as we hit countryCount in the scenario where we are still adding to
                // customerCount for the last country at the end of a page. We must be able to get to the next page
                // to see if there are more of the current country customers on it.
                limitReached = (countryIndexItem == null); // if we didn't add the last Country in this page, we are done paging
            });

            return [limitReached, Array.from(countriesIndex.values())];
        }

        // Ordering by country alphabetically through the API call means we don't have to page through all results.
        // Selecting only the Country attribute limits bandwidth needed for the API
        return this.searchOData("/Customers?$select=Country&$orderby=Country asc", callback);
    }

    /**
     * Get 'Order' objects from the northwind database adding Order_Details to get pricing info
     * @param orderCount
     */
    private getRecentOrders(orderCount: number): Promise<Order[]> {
        return this.queryOData("/Orders?$orderby=OrderDate desc&$expand=Order_Details", orderCount);
    }
}