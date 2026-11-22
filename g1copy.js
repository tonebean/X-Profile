/**
 * g1-ultra · QX 响应改写（本地版，已移除诊断上报）
 *
 * 原脚本会把命中页面的 SKU / 价格片段 POST 到 webhook.site。
 * 本版本删除了全部上报代码和诊断提取逻辑，只保留本地日志与 SKU 改写。
 * 改写规则与原版完全一致。
 */
"use strict";

/* ============ 1. 字符串替换（换号后改这里） ============ */
var REPLACE = [
  ["g1.ios.20tb.m.v2", "g1.ios.20tb.m"],
  ["g1.ios.30tb.ai.pro.m", "g1.ai.ultra.3months_ip_90p.acq"]
];

/* ============ 2. 正则替换（改价格用） ============ */
var REGEX = [
  // ["\"price_amount_micros\":[0-9]+", "\"price_amount_micros\":1450000000"]
];

/* ============ 3. 主逻辑 ============ */
var body = $response && $response.body;
var url = ($request && $request.url) || "?";

if (!body || typeof body !== "string") {
  console.log("[g1] 无 body " + url);
  $done({});
} else {
  console.log("[g1] 命中 " + url + "  body=" + body.length + "B");

  var hits = 0, i;

  for (i = 0; i < REPLACE.length; i++) {
    var from = REPLACE[i][0], to = REPLACE[i][1];
    if (body.indexOf(from) !== -1) {
      var n = body.split(from).length - 1;
      body = body.split(from).join(to);
      hits += n;
      console.log("[g1] " + from + " -> " + to + " x" + n);
    }
  }

  for (i = 0; i < REGEX.length; i++) {
    var rx = new RegExp(REGEX[i][0], "g");
    var m = body.match(rx);
    if (m) {
      body = body.replace(rx, REGEX[i][1]);
      hits += m.length;
      console.log("[g1] /" + REGEX[i][0] + "/ x" + m.length);
    }
  }

  console.log(hits ? "[g1] 共替换 " + hits + " 处" : "[g1] 未命中任何规则");

  $done(hits ? { body: body } : {});
}
