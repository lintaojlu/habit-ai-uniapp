"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = {
  data() {
    return {
      telephone: "",
      password: ""
    };
  },
  methods: {
    goToRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    },
    async handleSubmit() {
      if (!this.telephone || !this.password) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      try {
        const res = await utils_api.apiService.login({
          telephone: this.telephone,
          password: this.password
        });
        if (res.status === "success") {
          common_vendor.index.setStorageSync("token", res.token);
          const userInfo = await utils_api.apiService.getUserInfo();
          if (userInfo.status === "success") {
            common_vendor.index.setStorageSync("userInfo", userInfo.data);
            common_vendor.index.__f__("log", "at pages/login/login.vue:73", "get userInfo from server", userInfo.data);
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
            this.habits = processedHabits;
            common_vendor.index.setStorageSync("habits", processedHabits);
            common_vendor.index.__f__("log", "at pages/login/login.vue:98", "get habits from server", processedHabits);
          }
          const response = await utils_api.apiService.getAICharacterList();
          if (response.status === "success") {
            common_vendor.index.setStorageSync("aiCharacters", response.data);
            common_vendor.index.__f__("log", "at pages/login/login.vue:105", "get aiCharacters from server", response.data);
          }
          common_vendor.index.setStorageSync("telephone", this.telephone);
          common_vendor.index.setStorageSync("password", this.password);
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success"
          });
          common_vendor.index.reLaunch({
            url: "/pages/index/index"
          });
        } else {
          throw new Error(res.message || "登录失败");
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "登录失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.telephone,
    b: common_vendor.o(($event) => $data.telephone = $event.detail.value),
    c: $data.password,
    d: common_vendor.o(($event) => $data.password = $event.detail.value),
    e: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args)),
    f: common_vendor.o((...args) => $options.goToRegister && $options.goToRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
