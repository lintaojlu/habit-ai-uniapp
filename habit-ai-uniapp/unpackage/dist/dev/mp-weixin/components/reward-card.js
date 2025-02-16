"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  name: "RewardCard",
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: "太棒了！"
    },
    message: {
      type: String,
      default: ""
    },
    stats: {
      type: Object,
      default: null
    },
    habitInfo: {
      type: Object,
      default: null
    },
    streakInfo: {
      type: Object,
      default: null
    },
    targetTimestamp: {
      type: Number,
      default: () => (/* @__PURE__ */ new Date()).getTime()
    },
    retroactiveInfo: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: "calendar",
      validator: (value) => ["calendar", "week", "month"].includes(value)
    }
  },
  data() {
    return {
      isClosingUp: false,
      isClosingDown: false,
      noteContent: "",
      isDragging: false,
      startY: 0,
      currentY: 0,
      motivationalMessages: {
        daily: [
          "继续保持，你已经在进步了！",
          "每一个坚持的日子都在塑造更好的自己"
          /* ... */
        ],
        streak: [
          "太厉害了！你的坚持让人敬佩"
          /* ... */
        ],
        retroactive: [
          "补打卡也是一种负责任的表现"
          /* ... */
        ],
        week: [
          "本周又完成一次，继续加油！"
          /* ... */
        ]
      }
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
    randomMessage() {
      var _a;
      let type = "daily";
      if (this.title.includes("补打卡")) {
        type = "retroactive";
      } else if (((_a = this.streakInfo) == null ? void 0 : _a.count) > 0) {
        type = "streak";
      } else if (this.mode === "week") {
        type = "week";
      }
      const messages = this.motivationalMessages[type];
      return messages[Math.floor(Math.random() * messages.length)];
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
  watch: {
    show(newVal) {
      if (newVal) {
        this.isClosingUp = false;
        this.isClosingDown = false;
      }
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
        const actualTimestamp = this.retroactiveInfo ? this.retroactiveInfo.retroTimestamp : this.targetTimestamp;
        const now = /* @__PURE__ */ new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        const targetDate = new Date(actualTimestamp);
        if (targetDate < weekStart || targetDate > weekEnd) {
          common_vendor.index.showToast({
            title: "该笔记将记录到对应周次",
            icon: "none"
          });
        }
        if (this.noteContent.trim()) {
          this.$emit("save-note", {
            timestamp: actualTimestamp,
            content: this.noteContent.trim(),
            retroactiveInfo: this.retroactiveInfo
          });
        }
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
        this.$emit("update:show", false);
        this.isClosingUp = false;
        this.isClosingDown = false;
        this.noteContent = "";
      }, 500);
    },
    handleContainerClick() {
    },
    formatDate(timestamp, format = "full") {
      const date = new Date(timestamp);
      if (format === "date") {
        const year = date.getFullYear();
        const month2 = date.getMonth() + 1;
        const day2 = date.getDate();
        return `${year}.${month2}.${day2}`;
      }
      if (format === "yearMonth") {
        const year = date.getFullYear();
        const month2 = date.getMonth() + 1;
        return `${year}年${month2}月`;
      }
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month}月${day}日`;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $props.show
  }, $props.show ? common_vendor.e({
    b: common_vendor.f(12, (n, k0, i0) => {
      return {
        a: n,
        b: n * 0.15 + "s"
      };
    }),
    c: common_vendor.f(8, (n, k0, i0) => {
      return {
        a: n,
        b: n * 0.2 + "s"
      };
    }),
    d: common_vendor.t($options.formattedDate),
    e: $props.retroactiveInfo
  }, $props.retroactiveInfo ? {
    f: common_vendor.t($options.formatDate($props.retroactiveInfo.retroTimestamp, "date"))
  } : {}, {
    g: common_vendor.t($props.title),
    h: common_vendor.t($props.message || $options.randomMessage),
    i: $props.stats || $props.streakInfo || $props.habitInfo
  }, $props.stats || $props.streakInfo || $props.habitInfo ? common_vendor.e({
    j: $props.mode === "week" && $props.habitInfo
  }, $props.mode === "week" && $props.habitInfo ? {
    k: common_vendor.t($props.stats ? $props.stats.count : 0),
    l: common_vendor.t($props.habitInfo.name.slice(0, 8))
  } : {}, {
    m: $props.mode === "calendar" && $props.habitInfo
  }, $props.mode === "calendar" && $props.habitInfo ? {
    n: common_vendor.t($options.formatDate($props.targetTimestamp, "yearMonth")),
    o: common_vendor.t(($props.stats ? $props.stats.count : 0) + 1),
    p: common_vendor.t($props.habitInfo.name.slice(0, 8))
  } : {}, {
    q: $props.mode === "month" && $props.habitInfo
  }, $props.mode === "month" && $props.habitInfo ? {
    r: common_vendor.t($props.stats ? $props.stats.count : 0),
    s: common_vendor.t($props.habitInfo.name.slice(0, 8))
  } : {}, {
    t: $props.streakInfo
  }, $props.streakInfo ? {
    v: common_vendor.t($props.streakInfo.count)
  } : {}) : {}, {
    w: $data.noteContent,
    x: common_vendor.o(($event) => $data.noteContent = $event.detail.value),
    y: common_vendor.n($props.show && "slide-in"),
    z: common_vendor.n($data.isClosingUp && "slide-out-up"),
    A: common_vendor.n($data.isClosingDown && "slide-out-down"),
    B: common_vendor.n($data.isDragging && "dragging"),
    C: common_vendor.s($options.dragStyle),
    D: common_vendor.o(() => {
    }),
    E: common_vendor.o((...args) => $options.handleContainerClick && $options.handleContainerClick(...args)),
    F: common_vendor.o((...args) => $options.handleTouchStart && $options.handleTouchStart(...args)),
    G: common_vendor.o((...args) => $options.handleTouchMove && $options.handleTouchMove(...args)),
    H: common_vendor.o((...args) => $options.handleTouchEnd && $options.handleTouchEnd(...args))
  }) : {});
}
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/reward-card.js.map
