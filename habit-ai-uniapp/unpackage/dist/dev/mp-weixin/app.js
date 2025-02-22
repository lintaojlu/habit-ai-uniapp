"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_storage = require("./utils/storage.js");
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
    common_vendor.index.__f__("log", "at App.vue:6", "App Launch");
  },
  onShow() {
    common_vendor.index.__f__("log", "at App.vue:11", "App Show");
  },
  onHide() {
    common_vendor.index.__f__("log", "at App.vue:14", "App Hide");
  },
  methods: {
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
