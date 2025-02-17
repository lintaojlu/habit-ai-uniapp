"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  data() {
    return {
      userInfo: {
        avatarUrl: "",
        nickName: ""
      },
      phone: "",
      password: "",
      betaCode: ""
    };
  },
  methods: {
    goBack() {
      common_vendor.index.navigateBack();
    },
    getUserProfile() {
      common_vendor.index.getUserProfile({
        desc: "用于完善用户资料",
        success: (res) => {
          this.userInfo = res.userInfo;
          common_vendor.index.showToast({
            title: "授权成功",
            icon: "success"
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/register/register.vue:81", "获取用户信息失败：", err);
          common_vendor.index.showToast({
            title: "获取信息失败",
            icon: "none"
          });
        }
      });
    },
    handleRegister() {
      if (!this.userInfo.nickName) {
        common_vendor.index.showToast({
          title: "请先授权获取用户信息",
          icon: "none"
        });
        return;
      }
      if (!this.phone || !/^1\d{10}$/.test(this.phone)) {
        common_vendor.index.showToast({
          title: "请输入正确的手机号",
          icon: "none"
        });
        return;
      }
      if (!this.password || this.password.length < 6) {
        common_vendor.index.showToast({
          title: "密码不能少于6位",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "注册中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.setStorageSync("userInfo", {
          ...this.userInfo,
          phone: this.phone
        });
        common_vendor.index.reLaunch({
          url: "/pages/index/index"
        });
      }, 1500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.o((...args) => $options.goBack && $options.goBack(...args)),
    b: $data.userInfo.avatarUrl || "/static/default-avatar.png",
    c: common_vendor.o((...args) => $options.getUserProfile && $options.getUserProfile(...args)),
    d: $data.phone,
    e: common_vendor.o(($event) => $data.phone = $event.detail.value),
    f: $data.password,
    g: common_vendor.o(($event) => $data.password = $event.detail.value),
    h: $data.betaCode,
    i: common_vendor.o(($event) => $data.betaCode = $event.detail.value),
    j: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/register/register.js.map
