"use strict";
const common_vendor = require("../common/vendor.js");
const baseURL = "http://123.56.229.52:8000";
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
        common_vendor.index.__f__("log", "at utils/api.js:20", `[API Request] ${options.url} - ${options.method}`, options.data);
        if (res.statusCode === 401) {
          common_vendor.index.__f__("log", "at utils/api.js:23", `[API Response] ${options.url} - 401 Unauthorized`);
          common_vendor.index.redirectTo({ url: "/pages/login/login" });
          reject(new Error("登录失败，请重新登录"));
          return;
        }
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          common_vendor.index.__f__("error", "at utils/api.js:32", `[API Response] ${options.url} - Failed:`, res);
          reject(res.data || { message: "请求失败" });
        }
      },
      fail: (err) => {
        common_vendor.index.__f__("log", "at utils/api.js:37", `[API Request] ${options.url} - ${options.method}`, options.data);
        common_vendor.index.__f__("error", "at utils/api.js:38", `[API Response] ${options.url} - Error:`, err);
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
  getMemoryList(params = {}) {
    const queryString = Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&");
    return request({
      url: `/habit-ai/memory/list${queryString ? "?" + queryString : ""}`,
      method: "GET"
    });
  },
  getLastMessage() {
    return request({
      url: `/habit-ai/message/last`,
      method: "GET"
    });
  },
  sendConversation(content, sessionId = "") {
    return request({
      url: "/habit-ai/ai/conversation",
      method: "POST",
      data: {
        content,
        session_id: sessionId
      }
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
