"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Base = void 0;
var Base = /** @class */ (function () {
    // Requirement 1: The SDK should accept the URL to the endpoint in its constructor
    function Base(baseUrl) {
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
     * Internal function to "GET" an array of results from the Northwind database
     * @param endpoint e.g. /Customers
     * @param limit number of results requested, -1 for "all"
     */
    Base.prototype.getArray = function (endpoint, limit) {
        var results = [];
        var url = new URL(this.baseUrl + endpoint);
        var callback = function (pagedResults) {
            results.push.apply(results, pagedResults);
            var limitReached = (limit == 0 || results.length >= limit);
            return [limitReached, results];
        };
        if (limit > 0) {
            url.searchParams.set('$top', limit.toString());
        }
        return this.buildArray(url, callback);
    };
    /**
     * @param endpoint e.g. /Customers
     * @param callback callable method that takes a page of results and returns all pages so far. Done this way
     *      so that getCustomersByCountry can stop when its limit is reached which depends (not on num customers, but) on
     *      num countries.
     */
    Base.prototype.searchResults = function (endpoint, callback) {
        var url = new URL(this.baseUrl + endpoint);
        return this.buildArray(url, callback);
    };
    /**
     * Recursive function that can page through results from the server until "limit" or all results are found.
     */
    Base.prototype.buildArray = function (url, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var values, _a, limitReached, results;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.request(url)];
                    case 1:
                        values = _b.sent();
                        _a = callback(values.value), limitReached = _a[0], results = _a[1];
                        // page through the results
                        if (!limitReached && typeof values['odata.nextLink'] !== 'undefined') {
                            // this version of the API (<4) shows the nextLink as: "../../northwind/northwind.svc/Customers?$top=180&$skiptoken='ERNSH'"
                            (new URL(values['odata.nextLink'], this.baseUrl).searchParams).forEach(function (value, key) {
                                url.searchParams.set(key, value);
                            });
                            return [2 /*return*/, this.buildArray(url, callback)];
                        }
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * Send a request to the API tagged with SDK name and version
     * @param url e.g. /Customers
     * @param options (not required, not used; retained for future use)
     * @protected
     */
    Base.prototype.request = function (url, options) {
        return __awaiter(this, void 0, void 0, function () {
            var sdkVersion, headers, config, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sdkVersion = '1.0.0';
                        headers = {
                            'Content-Type': 'application/json',
                            'accept': 'application/json'
                        };
                        config = __assign(__assign({}, options), { headers: headers });
                        url.searchParams.set('sdk_family', 'typescript');
                        url.searchParams.set('sdk_version', sdkVersion);
                        return [4 /*yield*/, fetch(url.toString(), config)];
                    case 1:
                        response = _a.sent();
                        if (response.ok) {
                            return [2 /*return*/, response.json()];
                        }
                        // TODO: determine how we want to do error handling for this SDK
                        throw new Error(response.statusText);
                }
            });
        });
    };
    return Base;
}());
exports.Base = Base;
