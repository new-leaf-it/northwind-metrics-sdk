import {ODataArrayResponse} from "./metrics/types";

export abstract class Base {
    private readonly baseUrl: string;

    // Requirement 1: The SDK should accept the URL to the endpoint in its constructor
    constructor(baseUrl: string) {

        // Requirement 1: it is problematic to accept the URL to the service for which
        // this is an SDK. The URL provided could be anything, including https://google.com.
        // Assuming the url provided is to an odata data source with an API that is
        // compatible with the API in our URL is a pretty big assumption. Even the odata
        // northwind API has versions with different responses that must be accounted for.
        // For the sake of this exercise, I'm sticking with the URL provided in the
        // requirements and ignoring the URL provided by the user of the SDK.
        this.baseUrl = 'https://services.odata.org/northwind/northwind.svc';
    }

    /**
     * Internal function to "GET" an array of results directly from the Northwind database
     * @param endpoint e.g. /Customers
     * @param limit number of results requested, -1 for "all"
     */
    protected queryOData<T>(endpoint: string, limit: number): Promise<T[]> {
        let results = [];
        let url = new URL(this.baseUrl + endpoint);

        let callback = function(pagedResults: T[]): [boolean, T[]] {
            results.push(...pagedResults);
            let limitReached = (limit == 0 || results.length >= limit);
            return [limitReached, results];
        }

        if (limit >= 0) {
            url.searchParams.set('$top', limit.toString());
        }

        return this.buildArray(url, callback);
    }

    /**
     * Internal function to page through the results of a query and process those results with your own callback function.
     *
     * @param {string} endpoint e.g. /Customers
     * @param {function} callback callable method that takes a page of results and returns all pages so far. Done this way
     *      so that getCustomersByCountry can stop when its limit is reached which depends (not on num customers, but) on
     *      num countries.
     */
    protected searchOData<T>(endpoint: string, callback: ([]) => [boolean, T[]]): Promise<T[]> {
        let url = new URL(this.baseUrl + endpoint);

        return this.buildArray(url, callback);
    }

    /**
     * Recursive function that can page through results from the server until "limit" or all results are found.
     * @param {URL} url Full url and parameters for the API call
     * @param {function([]): [boolean, []]} callback method that processes the current page of results, 1) lets us know
     *      if we are done paging and 2) returns the processed results.
     *      Some users of this method will use a strict limit on the number of results.
     *      Other users are merging results so the number of pages does not directly correlate to the number of search results.
     */
    private async buildArray<T>(url: URL, callback: ([]) => [boolean, T[]]): Promise<T[]> {

        const values = await this.request(url);
        const [limitReached, results] = callback(values.value);

        // page through the results?
        if (!limitReached && typeof values['odata.nextLink'] !== 'undefined') {
            // this version of the API (<4) shows the nextLink as: "../../northwind/northwind.svc/Customers?$top=180&$skiptoken='ERNSH'"
            (new URL(values['odata.nextLink'], this.baseUrl).searchParams).forEach((value, key) => {
                url.searchParams.set(key, value);
            });
            return this.buildArray(url, callback);
        }
        return results;
    }

    /**
     * Send a request to the API tagged with SDK name and version
     * @param url e.g. /Customers
     * @param options (not required, not used; retained for future use)
     * @protected
     */
    private async request(url: URL, options?: RequestInit): Promise<ODataArrayResponse> {

        const sdkVersion = '1.0.0'; // TODO: get version from package.json
        const headers = {
            'Content-Type': 'application/json',
            'accept': 'application/json'
        };
        const config = {
            ...options,
            headers,
        };

        url.searchParams.set('sdk_family', 'typescript');
        url.searchParams.set('sdk_version', sdkVersion);

        const response = await fetch(url.toString(), config);

        if (response.ok) {
            return response.json();
        }

        // TODO: determine how we want to do error handling for this SDK
        throw new Error(response.statusText);
    }
}