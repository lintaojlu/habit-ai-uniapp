"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "http://123.56.229.52:9001";
function request(options) {
  return new Promise((resolve, reject) => {
    const token = common_vendor.index.getStorageSync("token");
    common_vendor.index.request({
      url: baseURL + options.url,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
        ...options.header
      },
      success: (res) => {
        common_vendor.index.__f__("log", "at utils/api.js:21", `[API Request] ${options.url} - ${options.method}`, options.data);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          common_vendor.index.__f__("error", "at utils/api.js:26", `[API Response] ${options.url} - Failed:`, res);
          reject(res.data || { message: "请求失败" });
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("log", "at utils/api.js:31", `[API Request] ${options.url} - ${options.method}`, options.data);
        common_vendor.index.__f__("error", "at utils/api.js:32", `[API Response] ${options.url} - Error:`, err);
        reject(err || { message: "网络错误" });
      }
    });
  });
}
const apiService = {
  register(userData) {
    return request({
      url: "/habit-ai/user/register",
      method: "POST",
      data: userData
    });
  },
  login(loginData) {
    return request({
      url: "/habit-ai/user/login",
      method: "POST",
      data: loginData
    });
  },
  getUserInfo() {
    return request({
      url: "/habit-ai/user/info",
      method: "GET"
    });
  },
  updateUserInfo(userData) {
    return request({
      url: "/habit-ai/user/update",
      method: "PUT",
      data: userData
    });
  },
  createHabit(habitData) {
    return request({
      url: "/habit-ai/habit/create",
      method: "POST",
      data: habitData
    });
  },
  getHabitInfo(habitId) {
    return request({
      url: `/habit-ai/habit/info?habit_id=${habitId}`,
      method: "GET"
    });
  },
  updateHabit(habit_id, habitData) {
    return request({
      url: "/habit-ai/habit/update",
      method: "PUT",
      data: { habit_id, ...habitData }
    });
  },
  deleteHabit(habitId) {
    return request({
      url: "/habit-ai/habit/delete",
      method: "DELETE",
      data: { habit_id: habitId }
    });
  },
  recordHabit(habitId) {
    return request({
      url: "/habit-ai/habit/checkin",
      method: "POST",
      data: { habit_id: habitId }
    });
  },
  getHabitStreak(habitId) {
    return request({
      url: `/habit-ai/habit/streak?habit_id=${habitId}`,
      method: "GET"
    });
  },
  getHabitList() {
    return request({
      url: "/habit-ai/habit/list",
      method: "GET"
    });
  },
  getAICharacterList() {
    return request({
      url: "/habit-ai/character/list",
      method: "GET"
    });
  },
  getLastMessage() {
    return request({
      url: `/habit-ai/message/last`,
      method: "GET"
    });
  },
  getNewMessage() {
    return request({
      url: "/habit-ai/message/new",
      method: "GET"
    });
  },
  feedback(params) {
    return request({
      url: "/habit-ai/feedback",
      method: "POST",
      data: params
    });
  }
};
exports.apiService = apiService;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/api.js.map
