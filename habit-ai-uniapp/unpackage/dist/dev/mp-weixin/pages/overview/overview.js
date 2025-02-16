"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = common_vendor.defineComponent({
  data() {
    const today = /* @__PURE__ */ new Date();
    return {
      weekDays: ["日", "一", "二", "三", "四", "五", "六"],
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1,
      selectedDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
      allHabits: []
    };
  },
  computed: {
    calendarDays() {
      const days = [];
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, 1);
      const lastDayOfMonth = new Date(this.currentYear, this.currentMonth, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const firstDayWeekday = firstDayOfMonth.getDay();
      const prevMonthLastDay = new Date(this.currentYear, this.currentMonth - 1, 0).getDate();
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const prevMonthDay = prevMonthLastDay - i;
        const prevDate = new Date(this.currentYear, this.currentMonth - 2, prevMonthDay);
        days.push({
          dayNumber: prevMonthDay,
          dateStr: this.formatDateStr(prevDate),
          habits: [],
          isCurrentMonth: false
        });
      }
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(this.currentYear, this.currentMonth - 1, i);
        const dateStr = this.formatDateStr(currentDate);
        const habits = this.allHabits.filter(
          (habit) => habit.completed.some((t) => {
            const d = new Date(t);
            return d.getFullYear() === currentDate.getFullYear() && d.getMonth() === currentDate.getMonth() && d.getDate() === currentDate.getDate();
          })
        );
        days.push({
          dayNumber: i,
          dateStr,
          habits,
          isToday: this.isToday(currentDate),
          isCurrentMonth: true
        });
      }
      const totalDaysNeeded = 42;
      const remainingDays = totalDaysNeeded - days.length;
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(this.currentYear, this.currentMonth, i);
        days.push({
          dayNumber: i,
          dateStr: this.formatDateStr(nextDate),
          habits: [],
          isCurrentMonth: false
        });
      }
      return days;
    },
    dailyRecords() {
      if (!this.selectedDate)
        return [];
      return this.allHabits.filter(
        (habit) => habit.completed.some((t) => {
          const d = new Date(t);
          return this.isSameDate(d, new Date(this.selectedDate));
        })
      ).flatMap((habit) => {
        const notes = (habit.notes || []).filter((note) => {
          const noteDate = note.retroactiveInfo ? new Date(note.retroactiveInfo.retroTimestamp) : new Date(note.timestamp);
          return this.isSameDate(noteDate, new Date(this.selectedDate));
        });
        if (notes.length > 0) {
          return notes.map((note) => ({
            ...note,
            habit
          }));
        }
        const lastCheckTime = habit.completed.find(
          (t) => this.isSameDate(new Date(t), new Date(this.selectedDate))
        );
        return [{
          habit,
          timestamp: lastCheckTime,
          content: null
        }];
      }).sort((a, b) => b.timestamp - a.timestamp);
    }
  },
  methods: {
    initData() {
      this.allHabits = common_vendor.index.getStorageSync("habits") || [];
    },
    selectDate(day) {
      if (day.dayNumber) {
        const date = new Date(this.currentYear, this.currentMonth - 1, day.dayNumber);
        this.selectedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
      }
    },
    changeMonth(delta) {
      let newMonth = this.currentMonth + delta;
      let newYear = this.currentYear;
      if (newMonth > 12) {
        newMonth = 1;
        newYear++;
      } else if (newMonth < 1) {
        newMonth = 12;
        newYear--;
      }
      this.currentMonth = newMonth;
      this.currentYear = newYear;
      this.selectedDate = null;
    },
    formatSelectedDate(dateStr) {
      const date = new Date(dateStr);
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    },
    formatDate(timestamp) {
      const date = new Date(timestamp);
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    },
    isToday(date) {
      const today = /* @__PURE__ */ new Date();
      return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
    },
    getCategoryColor(category) {
      const colors = {
        sports: "#FF6B6B",
        health: "#4ECDC4",
        work: "#45B7D1",
        study: "#96CEB4"
      };
      return colors[category] || "#808080";
    },
    formatDateStr(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    },
    isSameDate(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
    }
  },
  onShow() {
    this.initData();
    const today = /* @__PURE__ */ new Date();
    this.selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t(_ctx.currentYear),
    b: common_vendor.t(_ctx.currentMonth),
    c: common_vendor.o(($event) => _ctx.changeMonth(-1)),
    d: common_vendor.o(($event) => _ctx.changeMonth(1)),
    e: common_vendor.f(_ctx.weekDays, (day, index, i0) => {
      return {
        a: common_vendor.t(day),
        b: "weekday-" + index
      };
    }),
    f: common_vendor.f(_ctx.calendarDays, (day, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(day.dayNumber),
        b: day.habits.length > 0
      }, day.habits.length > 0 ? {
        c: common_vendor.t(day.habits.length)
      } : {}, {
        d: "day-" + index,
        e: day.isToday ? 1 : "",
        f: _ctx.selectedDate === day.dateStr ? 1 : "",
        g: !day.isCurrentMonth ? 1 : "",
        h: common_vendor.o(($event) => day.isCurrentMonth && _ctx.selectDate(day), "day-" + index)
      });
    }),
    g: _ctx.selectedDate
  }, _ctx.selectedDate ? common_vendor.e({
    h: common_vendor.t(_ctx.formatSelectedDate(_ctx.selectedDate)),
    i: _ctx.dailyRecords.length > 0
  }, _ctx.dailyRecords.length > 0 ? {
    j: common_vendor.f(_ctx.dailyRecords.filter((r) => !r.content), (record, index, i0) => {
      return {
        a: common_vendor.t(record.habit.title),
        b: "tag-" + index,
        c: _ctx.getCategoryColor(record.habit.category) + "20",
        d: _ctx.getCategoryColor(record.habit.category)
      };
    }),
    k: common_vendor.f(_ctx.dailyRecords.filter((r) => r.content), (record, index, i0) => {
      return {
        a: common_vendor.t(record.habit.title),
        b: _ctx.getCategoryColor(record.habit.category),
        c: common_vendor.t(_ctx.formatDate(record.timestamp)),
        d: common_vendor.t(record.content),
        e: "note-" + index
      };
    })
  } : {}) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/overview/overview.js.map
