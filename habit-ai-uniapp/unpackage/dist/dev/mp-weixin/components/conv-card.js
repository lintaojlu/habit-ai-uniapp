"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "ConvCard",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    emoji: {
      type: String,
      default: "🤖"
    },
    content: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      isClosingDown: false,
      isDragging: false,
      startY: 0,
      currentY: 0
    };
  },
  computed: {
    formattedDate() {
      const now = /* @__PURE__ */ new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const weekDay = weekDays[now.getDay()];
      return `${year}年${month}月${date}日 ${weekDay}`;
    },
    dragStyle() {
      if (!this.isDragging)
        return {};
      const translateY = Math.max(0, this.currentY - this.startY);
      return {
        transform: `translateY(${translateY}px)`,
        transition: "none"
      };
    }
  },
  methods: {
    handleTouchStart(e) {
      this.startY = e.touches[0].clientY;
      this.isDragging = true;
      e.stopPropagation();
    },
    handleTouchMove(e) {
      if (!this.isDragging)
        return;
      this.currentY = e.touches[0].clientY;
      e.preventDefault();
      e.stopPropagation();
    },
    handleTouchEnd(e) {
      if (!this.isDragging)
        return;
      const dragDistance = this.currentY - this.startY;
      if (dragDistance > 100) {
        this.closeCard();
      }
      this.isDragging = false;
      this.startY = 0;
      this.currentY = 0;
      e.stopPropagation();
    },
    closeCard() {
      this.isClosingDown = true;
      setTimeout(() => {
        this.$emit("updateShow", false);
        this.isClosingDown = false;
      }, 500);
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.show
  }, $props.show ? {
    b: common_vendor.t($options.formattedDate),
    c: common_vendor.t($props.emoji),
    d: common_vendor.t($props.content),
    e: common_vendor.n($props.show && "slide-in"),
    f: common_vendor.n($data.isClosingDown && "slide-out-down"),
    g: common_vendor.n($data.isDragging && "dragging"),
    h: common_vendor.s($options.dragStyle),
    i: common_vendor.o(() => {
    }),
    j: common_vendor.o((...args) => _ctx.handleContainerClick && _ctx.handleContainerClick(...args)),
    k: common_vendor.o((...args) => $options.handleTouchStart && $options.handleTouchStart(...args)),
    l: common_vendor.o((...args) => $options.handleTouchMove && $options.handleTouchMove(...args)),
    m: common_vendor.o((...args) => $options.handleTouchEnd && $options.handleTouchEnd(...args))
  } : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/conv-card.js.map
