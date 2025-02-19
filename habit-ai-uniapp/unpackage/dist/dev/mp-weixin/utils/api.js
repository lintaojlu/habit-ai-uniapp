"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "http://123.56.229.52:8000";
function request(options) {
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: baseURL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
        "Authorization": common_vendor.index.getStorageSync("token") ? `Bearer ${common_vendor.index.getStorageSync("token")}` : "",
        ...options.header
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}
exports.request = request;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
