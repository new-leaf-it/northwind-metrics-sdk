import {Base} from "./base";
import {Metrics} from "./metrics";
import {applyMixins} from "./utils";
import {OrderMetrics} from "./metrics/types";

class NorthwindMetrics extends Base{}
interface NorthwindMetrics extends Metrics {}

applyMixins(NorthwindMetrics, [Metrics]);

export default NorthwindMetrics;
