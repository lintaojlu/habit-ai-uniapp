"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_storage = require("./utils/storage.js");
const utils_api = require("./utils/api.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/register/register.js";
  "./pages/index/index.js";
  "./pages/add-habit/add-habit.js";
  "./pages/overview/overview.js";
  "./pages/settings/settings.js";
  "./pages/guide/guide.js";
}
const _sfc_main = {
  onLaunch() {
    common_vendor.index.__f__("log", "at App.vue:7", "App Launch");
    this.autoLogin();
  },
  onShow() {
    common_vendor.index.__f__("log", "at App.vue:13", "App Show");
  },
  onHide() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Hide");
  },
  methods: {
    async autoLogin() {
      try {
        const telephone = common_vendor.index.getStorageSync("telephone");
        const password = common_vendor.index.getStorageSync("password");
        if (telephone && password) {
          const loginRes = await utils_api.apiService.login({
            telephone,
            password
          });
          if (loginRes.status === "success") {
            common_vendor.index.setStorageSync("token", loginRes.token);
            const userInfo = await utils_api.apiService.getUserInfo();
            if (userInfo.status === "success") {
              common_vendor.index.setStorageSync("userInfo", userInfo.data);
            }
            const habitList = await utils_api.apiService.getHabitList();
            if (habitList.status === "success") {
              const processedHabits = habitList.data.map((habit) => ({
                ...habit,
                icon: habit.icon || "✨",
                color: habit.color || "$theme-color",
                completed: Array.isArray(habit.completed) ? habit.completed.map((dateStr) => {
                  const date = dateStr.includes("T") ? new Date(dateStr) : new Date(dateStr.replace(/(\d{4})-(\d{2})-(\d{2})/, "$1/$2/$3"));
                  return date.toISOString();
                }) : []
              }));
              common_vendor.index.setStorageSync("habits", processedHabits);
            }
            const response = await utils_api.apiService.getAICharacterList();
            if (response.status === "success") {
              common_vendor.index.setStorageSync("aiCharacters", response.data);
            }
            common_vendor.index.__f__("log", "at App.vue:66", "Auto login successful");
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          } else {
            this.clearLoginData();
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at App.vue:75", "Auto login failed:", error);
        this.clearLoginData();
      }
    },
    clearLoginData() {
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("loginExpireTime");
      common_vendor.index.removeStorageSync("userInfo");
      common_vendor.index.removeStorageSync("habits");
      common_vendor.index.removeStorageSync("aiCharacters");
    },
    async checkAndRestoreData() {
      const habits = common_vendor.index.getStorageSync("habits");
      if (!habits || habits.length === 0) {
        const backupInfo = utils_storage.checkBackupAvailable();
        if (backupInfo.available) {
          common_vendor.index.showModal({
            title: "发现数据备份",
            content: "检测到您有可用的数据备份，是否恢复？",
            success: (res) => {
              if (res.confirm) {
                const result = utils_storage.restoreFromBackup();
                if (result.success) {
                  common_vendor.index.showToast({
                    title: "数据恢复成功",
                    icon: "success"
                  });
                } else {
                  common_vendor.index.showToast({
                    title: "数据恢复失败",
                    icon: "none"
                  });
                }
              }
            }
          });
        }
      }
    }
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
