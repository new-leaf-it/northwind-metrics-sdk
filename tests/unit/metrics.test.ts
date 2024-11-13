import NorthwindMetrics from "../..";

const client = new NorthwindMetrics('https://services.odata.org/northwind/northwind.svc');

test('Get Highest Postal Code', async () =>  {
    let postal1 = await client.getHighestPostalCode(100);
    expect(postal1).not.toBeNull();
    expect(postal1).toBe('99508'); // this test database is static, so we can include some static tests
    expect(postal1).toHaveLength(5);

    let postal2 = await client.getHighestPostalCode(1);
    expect(postal2).not.toBeNull();
    expect(postal2).not.toBe(postal1);

    let postal3 = await client.getHighestPostalCode(0);
    expect(postal3).toBeNull();
});

test('Get Order Metrics', async () => {
    let orderMetrics1 = await client.getOrderMetrics(1500);
    expect(orderMetrics1).not.toBeNull();
    expect(orderMetrics1.averageOrderAmount).toBeGreaterThan(1000);
    expect(orderMetrics1.customerNameWithLargestOrder).not.toBe(orderMetrics1.customerNameWithSmallestOrder);
    expect(orderMetrics1.customerNameWithLargestOrder).not.toBeNull();
    expect(orderMetrics1.customerNameWithSmallestOrder).not.toBeNull();

    let orderMetrics2 = await client.getOrderMetrics(1000);
    expect(orderMetrics2.averageOrderAmount).toBe(orderMetrics1.averageOrderAmount); // there are not 1000 orders in the DB, so this should be the same as 1500 orders

    let orderMetrics3 = await client.getOrderMetrics(10);
    expect(orderMetrics3.averageOrderAmount).toBeLessThan(orderMetrics1.averageOrderAmount);
    expect(orderMetrics3.averageOrderAmount).toBeGreaterThan(1);
});


test('Get Customers By Country', async () => {
    let customersByCountry1 = await client.getCustomersByCountry(50);
    expect(customersByCountry1.length).toBeGreaterThan(20); // there are 21 countries represented in the northwind database

    let customersByCountry2 = await client.getCustomersByCountry(10);
    expect(customersByCountry2.length).toBe(10);

    expect(customersByCountry2[0].countryName).toEqual(customersByCountry1[0].countryName);
    expect(customersByCountry2[0].customerCount).toEqual(customersByCountry1[0].customerCount);

    expect(customersByCountry2[9].countryName).toEqual(customersByCountry1[9].countryName);
    expect(customersByCountry2[9].customerCount).toEqual(customersByCountry1[9].customerCount);

    expect(customersByCountry2[0].countryName.length).toBeGreaterThan(0);
    expect(customersByCountry2[9].countryName.length).toBeGreaterThan(0);
    expect(customersByCountry2[0].customerCount).toBeGreaterThan(0);
    expect(customersByCountry2[9].customerCount).toBeGreaterThan(0);
});




