"use strict";
const common_vendor = require("../../common/vendor.js");
const RewardCard = () => "../../components/reward-card.js";
const _sfc_main = common_vendor.defineComponent({
  components: {
    RewardCard
  },
  data() {
    return {
      weekDays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      habits: [],
      currentYear: 0,
      currentMonth: 0,
      yearWeek: 0,
      monthWeek: 0,
      showRewardCard: false,
      rewardTitle: "",
      rewardMessage: "",
      rewardStats: null,
      currentHabit: null,
      isNoInteraction: false,
      touchStartX: 0,
      touchStartTime: 0,
      translateX: 0,
      isOrderMode: false,
      flippedCards: {},
      expandedCards: {},
      hours: 0,
      minutes: 0,
      seconds: 0,
      timer: null
    };
  },
  computed: {
    getTodayCompletedCount() {
      const today = /* @__PURE__ */ new Date();
      const todayTimestamp = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).getTime();
      return this.habits.filter(
        (habit) => habit.completed.includes(todayTimestamp)
      ).length;
    }
  },
  methods: {
    addHabit() {
      common_vendor.index.navigateTo({
        url: "/pages/add-habit/add-habit"
      });
    },
    loadHabits() {
      const habits = common_vendor.index.getStorageSync("habits") || [];
      this.habits = habits.map((habit) => ({
        ...habit,
        icon: habit.icon || this.getCategoryIcon(habit.category),
        color: habit.color || "$theme-color"
      }));
    },
    // 周视图相关方法
    isCompletedForDay(habit, dayIndex) {
      const timestamp = this.getDayTimestamp(dayIndex);
      return habit.completed.includes(timestamp);
    },
    isWeekToday(dayIndex) {
      const today = /* @__PURE__ */ new Date();
      const targetDate = this.getDayDate(dayIndex);
      return today.getDate() === targetDate;
    },
    isFutureDay(dayIndex) {
      const today = /* @__PURE__ */ new Date();
      const targetDate = this.getDateFromDayIndex(dayIndex);
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      return targetDateOnly > todayDate;
    },
    getDayDate(dayIndex) {
      const date = this.getDateFromDayIndex(dayIndex);
      return date.getDate();
    },
    getDateFromDayIndex(dayIndex) {
      const today = /* @__PURE__ */ new Date();
      const monday = /* @__PURE__ */ new Date();
      monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));
      const targetDate = new Date(monday);
      targetDate.setDate(monday.getDate() + dayIndex);
      return targetDate;
    },
    getDayTimestamp(dayIndex) {
      const date = this.getDateFromDayIndex(dayIndex);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    },
    toggleHabitComplete(habit, dayIndex) {
      const timestamp = this.getDayTimestamp(dayIndex);
      const today = /* @__PURE__ */ new Date();
      const targetDate = this.getDateFromDayIndex(dayIndex);
      if (targetDate > today) {
        common_vendor.index.showToast({
          title: "未来还未来哦~",
          icon: "none",
          duration: 1e3
        });
        return;
      }
      if (targetDate.getDate() !== today.getDate() || targetDate.getMonth() !== today.getMonth() || targetDate.getFullYear() !== today.getFullYear()) {
        common_vendor.index.showToast({
          title: "请点击习惯卡，在日历中进行补打卡",
          icon: "none",
          duration: 1e3
        });
        return;
      }
      const habits = common_vendor.index.getStorageSync("habits") || [];
      const habitIndex = habits.findIndex((h) => h.id === habit.id);
      if (habitIndex === -1)
        return;
      const completedIndex = habits[habitIndex].completed.indexOf(timestamp);
      if (completedIndex === -1) {
        habits[habitIndex].completed.push(timestamp);
        const weekStart = this.getDateFromDayIndex(0);
        const weekEnd = this.getDateFromDayIndex(6);
        weekStart.setHours(0, 0, 0, 0);
        weekEnd.setHours(23, 59, 59, 999);
        const weekCompletedCount = habits[habitIndex].completed.filter((time) => {
          const date = new Date(time);
          return date >= weekStart && date <= weekEnd;
        }).length;
        this.showRewardCard = true;
        this.rewardTitle = "打卡成功！";
        this.rewardMessage = "";
        this.currentHabit = {
          id: habit.id,
          name: habit.title,
          icon: habit.icon,
          color: habit.color
        };
        this.rewardStats = {
          count: weekCompletedCount,
          label: "本周已完成"
        };
      } else {
        habits[habitIndex].completed.splice(completedIndex, 1);
      }
      common_vendor.index.setStorageSync("habits", habits);
      this.loadHabits();
      common_vendor.index.vibrateShort();
    },
    // 检查本周是否全部完成
    checkWeekCompletion(habit) {
      return Array(7).fill().every((_, index) => this.isCompletedForDay(habit, index));
    },
    // 通用方法
    updateHabitCompletion(habit, timestamp) {
      const habits = common_vendor.index.getStorageSync("habits") || [];
      const habitIndex = habits.findIndex((h) => h.id === habit.id);
      if (habitIndex === -1)
        return;
      const completedIndex = habits[habitIndex].completed.indexOf(timestamp);
      if (completedIndex === -1) {
        habits[habitIndex].completed.push(timestamp);
      } else {
        habits[habitIndex].completed.splice(completedIndex, 1);
      }
      common_vendor.index.setStorageSync("habits", habits);
      this.loadHabits();
      common_vendor.index.vibrateShort();
    },
    goToStats(habit) {
      common_vendor.index.navigateTo({
        url: `/pages/habit-stats/habit-stats?id=${habit.id}&title=${encodeURIComponent(habit.title)}`
      });
    },
    getCategoryIcon(category) {
      const icons = {
        workout: "🏃",
        diet: "🥗",
        water: "💧",
        sleep: "😴",
        meditation: "🧘",
        running: "⚽",
        reading: "📚",
        coding: "💻",
        course: "📝",
        cleaning: "🧹",
        cooking: "🍳",
        finance: "💰",
        plants: "🌱",
        music: "🎸",
        art: "🎨",
        craft: "🎭",
        photo: "📸",
        singing: "🎤",
        game: "🎮",
        time: "⏰",
        planning: "📊",
        mood: "🌈",
        social: "👥",
        notes: "📝",
        writing: "✍️",
        custom: "✨",
        other: "🎯"
      };
      return icons[category] || "🎯";
    },
    getCategoryColor(category) {
      const colors = {
        // 健康组
        workout: "#FF6B6B",
        diet: "#95E1D3",
        water: "#87CEEB",
        sleep: "#6C5B7B",
        meditation: "#9B89B3",
        running: "#FF6B6B",
        // 学习组
        reading: "#FFD93D",
        coding: "#6C5B7B",
        course: "#96CEB4",
        // 生活组
        cleaning: "#A8E6CF",
        cooking: "#F8B195",
        finance: "#2A363B",
        plants: "#4ECDC4",
        // 兴趣组
        music: "#FF8C94",
        art: "#F67280",
        craft: "#C06C84",
        photo: "#355C7D",
        singing: "#FF8C94",
        game: "#3F72AF",
        // 成长组
        time: "#45B7D1",
        planning: "#96CEB4",
        mood: "#9B89B3",
        social: "#F8B195"
      };
      return colors[category] || "$theme-color";
    },
    showActionSheet(habit) {
      const actions = [
        {
          name: "编辑习惯",
          action: () => this.editHabit(habit)
        },
        {
          name: "调整顺序",
          action: () => this.toggleOrderMode()
        },
        {
          name: "删除习惯",
          action: () => this.deleteHabit(habit)
        }
      ];
      const systemInfo = common_vendor.index.getSystemInfoSync();
      common_vendor.index.showActionSheet({
        itemList: actions.map((item) => item.name),
        itemColor: systemInfo.platform === "ios" ? "#007AFF" : "#2d8cf0",
        success: (res) => {
          var _a;
          if (systemInfo.platform === "ios") {
            setTimeout(() => {
              var _a2;
              (_a2 = actions[res.tapIndex]) == null ? void 0 : _a2.action();
            }, 100);
          } else {
            (_a = actions[res.tapIndex]) == null ? void 0 : _a.action();
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("log", "at pages/index/index.vue:475", "ActionSheet 关闭", err);
        }
      });
    },
    editHabit(habit) {
      common_vendor.index.navigateTo({
        url: `/pages/add-habit/add-habit?id=${habit.id}`
      });
    },
    deleteHabit(habit) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个习惯吗？此操作不可恢复。",
        confirmColor: "#FF3B30",
        success: (res) => {
          if (res.confirm) {
            const habits = common_vendor.index.getStorageSync("habits") || [];
            const updatedHabits = habits.filter((h) => h.id !== habit.id);
            common_vendor.index.setStorageSync("habits", updatedHabits);
            this.loadHabits();
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    },
    updateDateInfo() {
      const now = /* @__PURE__ */ new Date();
      this.currentYear = now.getFullYear();
      this.currentMonth = now.getMonth() + 1;
      const calcYearWeek = (date) => {
        const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        target.setUTCDate(target.getUTCDate() + 3 - (target.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
        return Math.ceil(((target - yearStart) / 864e5 + 1) / 7);
      };
      const calcMonthWeek = (date) => {
        const d = new Date(date.getTime());
        d.setHours(0, 0, 0, 0);
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
        const firstThursday = new Date(firstDay);
        firstThursday.setDate(firstDay.getDate() + (11 - firstDay.getDay()) % 7 - 3);
        const diff = d - firstThursday;
        return Math.floor(diff / 6048e5) + 1;
      };
      this.yearWeek = calcYearWeek(now);
      this.monthWeek = calcMonthWeek(now);
    },
    onShareAppMessage() {
      return {
        title: "习惯追踪器",
        path: "/pages/index/index"
      };
    },
    onShareTimeline() {
      return {
        title: "习惯追踪器"
      };
    },
    handleSaveNote({ timestamp, content }) {
      const noteTimestamp = Date.now();
      const habits = common_vendor.index.getStorageSync("habits") || [];
      const habitIndex = habits.findIndex((h) => h.id === this.currentHabit.id);
      habits[habitIndex].notes.push({
        timestamp: noteTimestamp,
        content
      });
      common_vendor.index.setStorageSync("habits", habits);
      this.loadHabits();
    },
    showFutureToast() {
      common_vendor.index.showToast({
        title: "未来还未来哦~",
        icon: "none",
        duration: 1e3
      });
    },
    handleDayClick(habit, dayIndex) {
      if (this.isFutureDay(dayIndex)) {
        common_vendor.index.showToast({
          title: "未来还未来哦~",
          icon: "none",
          duration: 1e3
        });
        return;
      }
      this.toggleHabitComplete(habit, dayIndex);
    },
    handleCardLongPress(habit) {
      this.flippedCards[habit.id] = true;
    },
    handleCardTouchEnd(habit) {
      this.flippedCards[habit.id] = false;
    },
    handleTouchStart(event) {
      if (this.isOrderMode)
        return;
      this.touchStartX = event.touches[0].clientX;
      this.touchStartTime = Date.now();
      this.translateX = 0;
    },
    handleTouchEnd(event) {
      if (this.isOrderMode)
        return;
      const touchEndX = event.changedTouches[0].clientX;
      const deltaX = touchEndX - this.touchStartX;
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - this.touchStartTime;
      const minSwipeDistance = 100;
      const maxSwipeTime = 300;
      const swipeVelocity = Math.abs(deltaX) / touchDuration;
      if (Math.abs(deltaX) > minSwipeDistance && touchDuration < maxSwipeTime && swipeVelocity > 0.3) {
        if (deltaX < 0 && this.viewMode === "week") {
          this.switchView("month");
        } else if (deltaX > 0 && this.viewMode === "month") {
          this.switchView("week");
        }
      }
      this.translateX = 0;
    },
    switchView(mode) {
      if (mode === this.viewMode)
        return;
      try {
        const { windowWidth } = common_vendor.index.getWindowInfo();
        const direction = mode === "month" ? -1 : 1;
        this.translateX = direction * windowWidth * 0.3;
        setTimeout(() => {
          this.viewMode = mode;
          this.translateX = 0;
        }, 50);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:627", "获取窗口信息失败:", error);
        this.viewMode = mode;
        this.translateX = 0;
      }
    },
    getDaysInMonth() {
      const date = new Date(this.currentYear, this.currentMonth - 1, 1);
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    },
    isCompletedForMonthDay(habit, day) {
      const timestamp = new Date(this.currentYear, this.currentMonth - 1, day).getTime();
      return habit.completed.includes(timestamp);
    },
    isMonthToday(day) {
      const today = /* @__PURE__ */ new Date();
      return today.getDate() === day && today.getMonth() === this.currentMonth - 1 && today.getFullYear() === this.currentYear;
    },
    isFutureMonthDay(day) {
      const today = /* @__PURE__ */ new Date();
      const targetDate = new Date(this.currentYear, this.currentMonth - 1, day);
      return targetDate > today;
    },
    handleMonthDayClick(habit, day) {
      const timestamp = new Date(this.currentYear, this.currentMonth - 1, day).getTime();
      const today = /* @__PURE__ */ new Date();
      const targetDate = new Date(this.currentYear, this.currentMonth - 1, day);
      if (targetDate > today) {
        common_vendor.index.showToast({
          title: "未来还未来哦~",
          icon: "none",
          duration: 1e3
        });
        return;
      }
      if (targetDate.getDate() !== today.getDate() || targetDate.getMonth() !== today.getMonth() || targetDate.getFullYear() !== today.getFullYear()) {
        common_vendor.index.showToast({
          title: "请点击习惯卡，在日历中进行补打卡",
          icon: "none",
          duration: 1e3
        });
        return;
      }
      const habits = common_vendor.index.getStorageSync("habits") || [];
      const habitIndex = habits.findIndex((h) => h.id === habit.id);
      if (habitIndex === -1)
        return;
      const completedIndex = habits[habitIndex].completed.indexOf(timestamp);
      if (completedIndex === -1) {
        habits[habitIndex].completed.push(timestamp);
        const monthStart = new Date(this.currentYear, this.currentMonth - 1, 1);
        const monthEnd = new Date(this.currentYear, this.currentMonth, 0);
        const monthCompletedCount = habits[habitIndex].completed.filter((time) => {
          const date = new Date(time);
          return date >= monthStart && date <= monthEnd;
        }).length;
        this.showRewardCard = true;
        this.rewardTitle = "打卡成功！";
        this.rewardMessage = "";
        this.currentHabit = {
          id: habit.id,
          name: habit.title,
          icon: habit.icon,
          color: habit.color
        };
        this.rewardStats = {
          count: monthCompletedCount
        };
      } else {
        habits[habitIndex].completed.splice(completedIndex, 1);
      }
      common_vendor.index.setStorageSync("habits", habits);
      this.loadHabits();
      common_vendor.index.vibrateShort();
    },
    getMonthCompletionCount(habit) {
      const monthStart = new Date(this.currentYear, this.currentMonth - 1, 1);
      const monthEnd = new Date(this.currentYear, this.currentMonth, 0);
      return habit.completed.filter((timestamp) => {
        const date = new Date(timestamp);
        return date >= monthStart && date <= monthEnd;
      }).length;
    },
    getMonthCompletionRate(habit) {
      const daysInMonth = this.getDaysInMonth();
      const completedDays = this.getMonthCompletionCount(habit);
      const today = /* @__PURE__ */ new Date();
      let availableDays;
      if (today.getMonth() === this.currentMonth - 1 && today.getFullYear() === this.currentYear) {
        availableDays = today.getDate();
      } else {
        availableDays = daysInMonth;
      }
      return Math.round(completedDays / availableDays * 100);
    },
    formatNumber(num) {
      return num < 10 ? `0${num}` : num;
    },
    updateTime() {
      const now = /* @__PURE__ */ new Date();
      this.hours = now.getHours();
      this.minutes = now.getMinutes();
      this.seconds = now.getSeconds();
    },
    startClock() {
      this.updateTime();
      this.timer = setInterval(() => {
        this.updateTime();
      }, 1e3);
    },
    stopClock() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    toggleOrderMode() {
      this.isOrderMode = !this.isOrderMode;
      if (this.isOrderMode) {
        common_vendor.index.showToast({
          title: "进入排序模式",
          icon: "none",
          duration: 1500
        });
      }
    },
    moveHabitUp(index) {
      if (index > 0) {
        this.$set(this.habits[index], "animating", "moving-up");
        this.$set(this.habits[index - 1], "animating", "moving-down");
        setTimeout(() => {
          const habits = [...this.habits];
          const temp = habits[index];
          habits[index] = habits[index - 1];
          habits[index - 1] = temp;
          habits[index].animating = "";
          habits[index - 1].animating = "";
          this.habits = habits;
          common_vendor.index.setStorageSync("habits", habits);
        }, 300);
      }
    },
    moveHabitDown(index) {
      if (index < this.habits.length - 1) {
        this.$set(this.habits[index], "animating", "moving-down");
        this.$set(this.habits[index + 1], "animating", "moving-up");
        setTimeout(() => {
          const habits = [...this.habits];
          const temp = habits[index];
          habits[index] = habits[index + 1];
          habits[index + 1] = temp;
          habits[index].animating = "";
          habits[index + 1].animating = "";
          this.habits = habits;
          common_vendor.index.setStorageSync("habits", habits);
        }, 300);
      }
    },
    completeOrder() {
      this.isOrderMode = false;
      common_vendor.index.showToast({
        title: "排序已保存",
        icon: "success",
        duration: 1500
      });
    },
    formatCreateTime(timestamp) {
      if (!timestamp)
        return "未知时间";
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const isToday = date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.getFullYear() === yesterday.getFullYear() && date.getMonth() === yesterday.getMonth() && date.getDate() === yesterday.getDate();
      const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.floor(diffTime / (1e3 * 60 * 60 * 24));
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      let daysDesc;
      if (isToday) {
        daysDesc = "今天创建";
      } else if (isYesterday) {
        daysDesc = "昨天创建";
      } else {
        daysDesc = `已创建${diffDays}天`;
      }
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes} · ${daysDesc}`;
    },
    toggleCardExpand(habitId) {
      this.$set(this.expandedCards, habitId, !this.expandedCards[habitId]);
    },
    getWeekNotes(habit) {
      if (!habit.notes)
        return [];
      const now = /* @__PURE__ */ new Date();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const weekStart = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
      const weekEnd = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999);
      return habit.notes.filter((note) => {
        const noteDate = new Date(note.retroactiveInfo ? note.retroactiveInfo.retroTimestamp : note.timestamp);
        return noteDate >= weekStart && noteDate <= weekEnd;
      }).sort((a, b) => {
        const aTime = a.retroactiveInfo ? a.retroactiveInfo.retroTimestamp : a.timestamp;
        const bTime = b.retroactiveInfo ? b.retroactiveInfo.retroTimestamp : b.timestamp;
        return bTime - aTime;
      });
    },
    formatNoteTime(timestamp) {
      const date = new Date(timestamp);
      const now = /* @__PURE__ */ new Date();
      const weekDays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const timeStr = `${hours}:${minutes}`;
      const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
      const weekDay = weekDays[date.getDay()];
      const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
      return {
        date: `${dateStr} ${weekDay}`,
        time: timeStr,
        relative: isToday ? "今天" : isYesterday ? "昨天" : dateStr
      };
    },
    showBackupOptions() {
      const systemInfo = common_vendor.index.getSystemInfoSync();
      common_vendor.index.showActionSheet({
        itemList: ["导出数据", "导入数据"],
        itemColor: (systemInfo == null ? void 0 : systemInfo.platform) === "ios" ? "#007AFF" : "#2d8cf0",
        success: (res) => {
          if ((systemInfo == null ? void 0 : systemInfo.platform) === "ios") {
            setTimeout(() => {
              this.handleBackupAction(res.tapIndex);
            }, 100);
          } else {
            this.handleBackupAction(res.tapIndex);
          }
        }
      });
    },
    handleBackupAction(tapIndex) {
      if (tapIndex === 0) {
        this.handleExport();
      } else if (tapIndex === 1) {
        this.handleImport();
      }
    },
    async handleExport() {
      common_vendor.index.showModal({
        title: "导出说明",
        content: "由于微信小程序的限制，导出数据将通过分享功能实现。导出后您可以选择将文件保存到手机进行备份。",
        confirmText: "继续导出",
        cancelText: "取消",
        success: (res) => {
          if (res.confirm) {
            this.performExport();
          }
        }
      });
    },
    async performExport() {
      try {
        const habits = common_vendor.index.getStorageSync("habits") || [];
        const exportData = {
          version: "1.0",
          exportTime: (/* @__PURE__ */ new Date()).toISOString(),
          data: habits
        };
        const jsonStr = JSON.stringify(exportData, null, 2);
        const fileName = `habits_backup_${this.formatExportDate(/* @__PURE__ */ new Date())}.json`;
        try {
          const userPath = common_vendor.wx$1.env.USER_DATA_PATH;
          const filePath = `${userPath}/${fileName}`;
          const fs = common_vendor.wx$1.getFileSystemManager();
          fs.writeFileSync(filePath, jsonStr, "utf8");
          common_vendor.wx$1.shareFileMessage({
            filePath,
            success: () => {
              common_vendor.index.showToast({
                title: "数据已导出，请确保从你分享的对话中选择该数据文件保存到手机",
                icon: "none",
                duration: 3e3
              });
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/index/index.vue:974", "Share file error:", err);
              common_vendor.index.showToast({
                title: "导出失败",
                icon: "none"
              });
            }
          });
        } catch (err) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:982", "File operation error:", err);
          common_vendor.index.showToast({
            title: "导出失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:989", "Export error:", error);
        common_vendor.index.showToast({
          title: "导出失败",
          icon: "none"
        });
      }
    },
    formatExportDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}${month}${day}_${hours}${minutes}${seconds}`;
    },
    async performImport(importData) {
      try {
        common_vendor.index.showActionSheet({
          itemList: ["合并数据", "完全覆盖"],
          success: (res) => {
            if (res.tapIndex === 0) {
              common_vendor.index.showModal({
                title: "确认合并",
                content: "合并将保留现有数据，并添加新数据。确定继续吗？",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.mergeImportData(importData.data);
                  }
                }
              });
            } else {
              common_vendor.index.showModal({
                title: "确认覆盖",
                content: "此操作将完全覆盖现有数据，确定继续吗？",
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.overwriteImportData(importData.data);
                  }
                }
              });
            }
          }
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1036", "Import error:", error);
        common_vendor.index.showToast({
          title: "导入失败",
          icon: "none"
        });
      }
    },
    mergeImportData(importedHabits) {
      try {
        const currentHabits = common_vendor.index.getStorageSync("habits") || [];
        const habitMap = new Map(currentHabits.map((habit) => [habit.id, habit]));
        importedHabits.forEach((importedHabit) => {
          const existingHabit = habitMap.get(importedHabit.id);
          if (existingHabit) {
            const completedSet = /* @__PURE__ */ new Set([...existingHabit.completed, ...importedHabit.completed]);
            existingHabit.completed = Array.from(completedSet);
            const notesMap = /* @__PURE__ */ new Map();
            existingHabit.notes.forEach((note) => {
              notesMap.set(note.timestamp, note);
            });
            importedHabit.notes.forEach((note) => {
              notesMap.set(note.timestamp, note);
            });
            existingHabit.notes = Array.from(notesMap.values()).sort((a, b) => b.timestamp - a.timestamp);
            existingHabit.title = importedHabit.title;
            existingHabit.icon = importedHabit.icon;
            existingHabit.color = importedHabit.color;
            existingHabit.flag = importedHabit.flag;
          } else {
            habitMap.set(importedHabit.id, importedHabit);
          }
        });
        const mergedHabits = Array.from(habitMap.values());
        common_vendor.index.setStorageSync("habits", mergedHabits);
        this.loadHabits();
        common_vendor.index.showToast({
          title: "数据已合并",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1082", "Merge error:", error);
        common_vendor.index.showToast({
          title: "合并失败",
          icon: "none"
        });
      }
    },
    overwriteImportData(importedHabits) {
      try {
        common_vendor.index.setStorageSync("habits", importedHabits);
        this.loadHabits();
        common_vendor.index.showToast({
          title: "导入成功",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1099", "Overwrite error:", error);
        common_vendor.index.showToast({
          title: "导入失败",
          icon: "none"
        });
      }
    },
    async handleImport() {
      common_vendor.index.showModal({
        title: "导入说明",
        content: "请确保：\n1. 选择的是.json格式的备份文件\n2. 文件是从本应用导出的有效文件\n3. 聊天记录中存在该文件",
        confirmText: "开始导入",
        success: (res) => {
          if (res.confirm) {
            this.chooseAndReadFile();
          }
        }
      });
    },
    chooseAndReadFile() {
      common_vendor.wx$1.chooseMessageFile({
        count: 1,
        type: "all",
        // 修改为 'all' 而不是 'file'
        success: (res) => {
          const tempFilePath = res.tempFiles[0].path;
          if (!tempFilePath.toLowerCase().endsWith(".json")) {
            common_vendor.index.showToast({
              title: "请选择JSON格式文件",
              icon: "none",
              duration: 2e3
            });
            return;
          }
          const fs = common_vendor.wx$1.getFileSystemManager();
          fs.readFile({
            filePath: tempFilePath,
            encoding: "utf8",
            success: (readRes) => {
              try {
                const importData = JSON.parse(readRes.data);
                if (!this.validateImportData(importData)) {
                  common_vendor.index.showToast({
                    title: "导入文件格式错误",
                    icon: "none"
                  });
                  return;
                }
                this.performImport(importData);
              } catch (parseError) {
                common_vendor.index.__f__("error", "at pages/index/index.vue:1151", "Parse error:", parseError);
                common_vendor.index.showToast({
                  title: "文件格式错误",
                  icon: "none"
                });
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/index/index.vue:1159", "Read file error:", err);
              common_vendor.index.showToast({
                title: "读取文件失败",
                icon: "none"
              });
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:1168", "Choose file error:", err);
          const systemInfo = common_vendor.index.getSystemInfoSync();
          const isIOS = systemInfo.platform === "ios";
          if (isIOS) {
            common_vendor.index.showModal({
              title: "选择文件失败",
              content: '请确保:\n1. 选择正确的JSON文件\n2. 如果看不到文件，请重新发送到聊天\n3. 或先保存到"文件"应用再选择',
              showCancel: false
            });
          } else {
            common_vendor.index.showToast({
              title: "选择文件失败",
              icon: "none",
              duration: 2e3
            });
          }
        }
      });
    }
  },
  onShow() {
    this.loadHabits();
    this.updateDateInfo();
    this.startClock();
    const hasShownReminder = common_vendor.index.getStorageSync("has_shown_data_loss_reminder");
    if (!hasShownReminder) {
      common_vendor.index.showModal({
        title: "数据安全提醒",
        content: '请注意：在微信设置中选择"清理小程序缓存"会导致所有数据被删除。建议定期使用导出功能备份您的数据，以防数据丢失。',
        confirmText: "我知道了",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.setStorageSync("has_shown_data_loss_reminder", true);
          }
        }
      });
    }
  },
  onHide() {
    this.stopClock();
  },
  onUnload() {
    this.stopClock();
  }
});
if (!Array) {
  const _component_reward_card = common_vendor.resolveComponent("reward-card");
  _component_reward_card();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.showRewardCard
  }, _ctx.showRewardCard ? {
    b: common_vendor.o(_ctx.handleSaveNote),
    c: common_vendor.o(($event) => _ctx.showRewardCard = $event),
    d: common_vendor.p({
      title: _ctx.rewardTitle,
      message: _ctx.rewardMessage,
      stats: _ctx.rewardStats,
      ["habit-info"]: _ctx.currentHabit,
      mode: _ctx.viewMode,
      show: _ctx.showRewardCard
    })
  } : {}, {
    e: common_vendor.t(_ctx.currentYear),
    f: common_vendor.t(_ctx.yearWeek),
    g: common_vendor.t(_ctx.currentMonth),
    h: common_vendor.t(_ctx.monthWeek),
    i: common_vendor.t(_ctx.formatNumber(_ctx.hours)),
    j: common_vendor.t(_ctx.formatNumber(_ctx.minutes)),
    k: common_vendor.t(_ctx.formatNumber(_ctx.seconds)),
    l: `${_ctx.getTodayCompletedCount / _ctx.habits.length * 100}%`,
    m: _ctx.isOrderMode
  }, _ctx.isOrderMode ? {
    n: common_vendor.o((...args) => _ctx.completeOrder && _ctx.completeOrder(...args))
  } : {}, {
    o: _ctx.habits.length === 0
  }, _ctx.habits.length === 0 ? {} : {}, {
    p: common_vendor.f(_ctx.habits, (habit, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(habit.icon),
        b: habit.color,
        c: common_vendor.t(habit.title),
        d: common_vendor.o(($event) => _ctx.showActionSheet(habit), habit.id)
      }, _ctx.isOrderMode ? {
        e: index === 0 ? 1 : "",
        f: common_vendor.o(($event) => _ctx.moveHabitUp(index), habit.id),
        g: index === _ctx.habits.length - 1 ? 1 : "",
        h: common_vendor.o(($event) => _ctx.moveHabitDown(index), habit.id)
      } : {}, {
        i: common_vendor.f(7, (day, i, i1) => {
          return {
            a: common_vendor.t(_ctx.weekDays[i]),
            b: common_vendor.t(_ctx.getDayDate(i)),
            c: _ctx.isCompletedForDay(habit, i) ? 1 : "",
            d: _ctx.isWeekToday(i) ? 1 : "",
            e: _ctx.isFutureDay(i) ? 1 : "",
            f: common_vendor.o(($event) => _ctx.handleDayClick(habit, i), i),
            g: i
          };
        }),
        j: common_vendor.t(_ctx.expandedCards[habit.id] ? "收起心得" : "查看心得"),
        k: common_vendor.t(_ctx.expandedCards[habit.id] ? "↑" : "↓"),
        l: common_vendor.o(($event) => _ctx.toggleCardExpand(habit.id), habit.id),
        m: _ctx.getWeekNotes(habit).length === 0
      }, _ctx.getWeekNotes(habit).length === 0 ? {} : {
        n: common_vendor.f(_ctx.getWeekNotes(habit), (note, index2, i1) => {
          return {
            a: common_vendor.t(_ctx.formatNoteTime(note.timestamp).date),
            b: common_vendor.t(_ctx.formatNoteTime(note.timestamp).time),
            c: common_vendor.t(_ctx.formatNoteTime(note.timestamp).relative),
            d: common_vendor.t(note.content),
            e: index2
          };
        })
      }, {
        o: _ctx.expandedCards[habit.id],
        p: habit.flag
      }, habit.flag ? {
        q: common_vendor.t(habit.flag)
      } : {}, {
        r: common_vendor.t(_ctx.formatCreateTime(habit.createTime)),
        s: habit.id,
        t: _ctx.flippedCards[habit.id] ? 1 : "",
        v: habit.animating,
        w: habit.animating ? 1 : "",
        x: common_vendor.o(($event) => !_ctx.isOrderMode && _ctx.handleCardLongPress(habit), habit.id),
        y: common_vendor.o(($event) => !_ctx.isOrderMode && _ctx.handleCardTouchEnd(habit), habit.id)
      });
    }),
    q: _ctx.isOrderMode,
    r: _ctx.isOrderMode ? 1 : "",
    s: _ctx.isOrderMode ? 1 : "",
    t: `translateX(${_ctx.translateX}px)`,
    v: common_vendor.o((...args) => _ctx.handleTouchStart && _ctx.handleTouchStart(...args)),
    w: common_vendor.o((...args) => _ctx.handleTouchEnd && _ctx.handleTouchEnd(...args)),
    x: !_ctx.isOrderMode
  }, !_ctx.isOrderMode ? {
    y: common_vendor.o((...args) => _ctx.addHabit && _ctx.addHabit(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
