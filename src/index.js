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
var base_1 = require("./base");
var metrics_1 = require("./metrics");
var utils_1 = require("./utils");
var NorthwindMetrics = /** @class */ (function (_super) {
    __extends(NorthwindMetrics, _super);
    function NorthwindMetrics() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return NorthwindMetrics;
}(base_1.Base));
(0, utils_1.applyMixins)(NorthwindMetrics, [metrics_1.Metrics]);
exports.default = NorthwindMetrics;
