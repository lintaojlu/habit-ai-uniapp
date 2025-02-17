"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    goToRegister() {
      common_vendor.index.navigateTo({
        url: "/pages/register/register"
      });
    },
    handleSubmit() {
      if (!this.email || !this.password) {
        common_vendor.index.showToast({
          title: "请填写完整信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      setTimeout(() => {
        common_vendor.index.hideLoading();
        common_vendor.index.setStorageSync("userInfo", {
          email: this.email,
          nickName: "用户" + Math.floor(Math.random() * 1e3)
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
    a: common_assets._imports_0,
    b: $data.email,
    c: common_vendor.o(($event) => $data.email = $event.detail.value),
    d: $data.password,
    e: common_vendor.o(($event) => $data.password = $event.detail.value),
    f: common_vendor.o((...args) => $options.handleSubmit && $options.handleSubmit(...args)),
    g: common_vendor.o((...args) => $options.goToRegister && $options.goToRegister(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
