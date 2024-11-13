"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metrics = void 0;
var base_1 = require("../base");
var types_1 = require("./types");
var Metrics = /** @class */ (function (_super) {
    __extends(Metrics, _super);
    function Metrics() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Returns an average of all the most recent number of orders as indicated by orderCount.
     * It also returns the name of the customer who had the largest order in the range and the name
     * of the customer with the smallest order in the range.
     * @param orderCount How many of most recent orders you would like to search
     * @return OrderMetrics
     */
    Metrics.prototype.getOrderMetrics = function (orderCount) {
        var metrics = new types_1.OrderMetrics();
        return this.getRecentOrders(orderCount).then(function (orders) {
            var largestOrderAmount = 0;
            var smallestOrderAmount = 0;
            var numberOfOrders = 0;
            var totalOrderAmount = 0;
            metrics.averageOrderAmount = 0;
            metrics.customerNameWithLargestOrder = '';
            metrics.customerNameWithSmallestOrder = '';
            orders.forEach(function (order) {
                // I could use Order_Subtotals to get the subtotal for each order, but would rather not for performance reasons.
                // But, how are they handling rounding when discounts are applied?
                // OrderID 11027 is giving me 877.7249999999999, rounded is 877.72
                // But, Order_Subtotals shows 877.73 https://services.odata.org/V4/Northwind/Northwind.svc/Order_Subtotals?$filter=OrderID%20eq%2011027
                // Calculator on Mac shows 877.725 from (4.5×30×0.75)+(49.3×21×0.75)
                // Northwind does round down in obvious situations ie OrderID: 10891; math says 368.933, Order_Subtotals gives 368.93
                var subtotal = order.Order_Details.reduce(function (accumulator, details) { return accumulator +
                    (details.UnitPrice * details.Quantity) * (1 - details.Discount); }, 0);
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
    };
    /**
     * Returns the highest numerical postal code from the customers of the most recent orders using a range size
     * specified by orderCount. Non-numeric postal codes are ignored.
     * @param orderCount How many of most recent orders you would like to search
     * @return string|null Postal code or null if no numeric postal codes are found.
     */
    Metrics.prototype.getHighestPostalCode = function (orderCount) {
        var highestPostalCode = null;
        return this.getRecentOrders(orderCount).then(function (orders) {
            orders.forEach(function (order) {
                var postalCode = parseInt(order.ShipPostalCode); // check "isNumeric"
                if (postalCode.toString() == order.ShipPostalCode && (highestPostalCode == null || postalCode > highestPostalCode)) {
                    highestPostalCode = order.ShipPostalCode;
                }
            });
            return highestPostalCode;
        });
    };
    /**
     * Returns an array of CustomersByCountry entities sorted in alphabetical order with a limit
     * defined by countryCount. Each CustomersByCountry entity has the number of customers that are in
     * that country and the name of the country.
     * @param countryCount Number of countries to return. The maximum is defined by how many countries are represented in the database.
     * @return CustomersByCountry
     */
    Metrics.prototype.getCustomersByCountry = function (countryCount) {
        var countriesIndex = new Map();
        // provide a callback that merges customers by country
        var callback = function (pagedResults) {
            var limitReached = (pagedResults.length == 0);
            pagedResults.forEach(function (searchResult) {
                var countryIndexItem = null;
                if (countriesIndex.has(searchResult.Country)) {
                    countryIndexItem = countriesIndex.get(searchResult.Country);
                }
                else if (countriesIndex.size < countryCount) {
                    countryIndexItem = new types_1.CustomersByCountry();
                    countryIndexItem.countryName = searchResult.Country;
                    countryIndexItem.customerCount = 0;
                }
                if (countryIndexItem != null) {
                    countryIndexItem.customerCount += 1;
                    countriesIndex.set(searchResult.Country, countryIndexItem);
                }
                limitReached = (countryIndexItem == null); // if we didn't add the last Country in this page, we are done paging
            });
            return [limitReached, Array.from(countriesIndex.values())];
        };
        // ordering by country alphabetically means we don't have to page through every customer
        // selecting only the Country attribute limits bandwidth needed for the API
        return this.searchResults("/Customers?$select=Country&$orderby=Country asc", callback);
    };
    /**
     * Get 'Order' objects from the northwind database adding Order_Details to get pricing info
     * @param orderCount
     */
    Metrics.prototype.getRecentOrders = function (orderCount) {
        return this.getArray("/Orders?$orderby=OrderDate desc&$expand=Order_Details", orderCount);
    };
    return Metrics;
}(base_1.Base));
exports.Metrics = Metrics;
