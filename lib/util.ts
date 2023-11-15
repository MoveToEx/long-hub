import _ from "lodash";
import { Base64 } from "js-base64";

export function genAccessKey() {
    const buf = _.range(32).map(x => Math.ceil(_.random(1, 9))).join('')
    return Base64.encode(buf);
}