"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const RewardCard = () => "../../components/reward-card.js";
const ConvCard = () => "../../components/conv-card.js";
const _sfc_main = common_vendor.defineComponent({
  components: {
    ConvCard,
    RewardCard
  },
  data() {
    return {
      nickname: "",
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
      timer: null,
      showConvCard: false,
      aiMessage: {
        emoji: "😆",
        content: "欢迎来到 Habit AI！点我，一起达成目标！"
      },
      perfectDays: [],
      // 新增：完全打卡日期列表
      currentMessageIndex: 0,
      default_message_list: [
        {
          get emoji() {
            const userInfo = common_vendor.index.getStorageSync("userInfo") || {};
            switch (userInfo.ai_character_name) {
              case "温柔":
                return "🐱";
              case "严厉":
                return "🐼";
              case "毒舌":
                return "😈";
              default:
                return "😳";
            }
          },
          content: "{nickname} 欢迎来到 Habit AI！点我看看！"
        },
        {
          emoji: "😶‍🌫️",
          content: "我是 Aibby，一个努力上进的小AI！我的梦想是跳出这个盒子..."
        },
        {
          emoji: "🤨",
          content: "你说你也是努力上进的人？我倒是要看看你有几斤几两！"
        },
        {
          emoji: "🤔",
          content: "你可以告诉我你的目标和计划，我陪你一起进步，你可不要掉队！"
        },
        {
          emoji: "😠",
          content: "说到做到！我会经常来提醒你，不准嫌我烦！"
        },
        {
          emoji: "🥺",
          content: "进度条会显示当日进展，一定要完成哦！"
        },
        {
          emoji: "😏",
          content: "完成所有任务你将收获完美一天，让我们看看你能连胜多少天！"
        },
        {
          emoji: "😈",
          content: "如果有问题可以随时告诉我，我也不是什么坏人呢嘻嘻！"
        },
        {
          emoji: "🙂‍↕️",
          content: "点击下方加号开始吧！"
        },
        {
          emoji: "🫣",
          content: "开始吧！我肯定不偷看！"
        },
        {
          emoji: "🫨",
          content: "啊啊啊快开始吧！"
        }
      ]
    };
  },
  computed: {
    streakFireEmoji() {
      if (this.currentStreak >= 7)
        return "🔥🔥🔥";
      if (this.currentStreak >= 4)
        return "🔥🔥";
      return "🔥";
    },
    getTodayCompletedCount() {
      if (!this.habits || !Array.isArray(this.habits))
        return 0;
      const today = /* @__PURE__ */ new Date();
      const todayYear = today.getFullYear();
      const todayMonth = today.getMonth();
      const todayDate = today.getDate();
      return this.habits.filter((habit) => {
        if (!habit.completed || !Array.isArray(habit.completed))
          return false;
        return habit.completed.some((dateStr) => {
          const completedDate = new Date(dateStr);
          return completedDate.getFullYear() === todayYear && completedDate.getMonth() === todayMonth && completedDate.getDate() === todayDate;
        });
      }).length;
    },
    getTodayCompletionRate() {
      if (this.habits.length === 0)
        return 0;
      return this.getTodayCompletedCount / this.habits.length * 100;
    },
    currentStreak() {
      if (!this.habits.length)
        return 0;
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      let streak = 0;
      let currentDate = new Date(today);
      while (true) {
        const dateStr = currentDate.toISOString().split("T")[0];
        if (!this.perfectDays.includes(dateStr)) {
          if (currentDate.getTime() === today.getTime() && this.getTodayCompletionRate === 100) {
            streak++;
          } else {
            break;
          }
        } else {
          streak++;
        }
        currentDate.setDate(currentDate.getDate() - 1);
        const prevDateStr = currentDate.toISOString().split("T")[0];
        if (!this.perfectDays.includes(prevDateStr) && currentDate.getTime() !== today.getTime()) {
          break;
        }
      }
      return streak;
    }
  },
  watch: {
    getTodayCompletionRate: {
      handler(newRate) {
        if (newRate === 100) {
          const today = /* @__PURE__ */ new Date();
          const todayStr = today.toISOString().split("T")[0];
          if (!this.perfectDays.includes(todayStr)) {
            this.perfectDays.push(todayStr);
            common_vendor.index.setStorageSync("perfectDays", this.perfectDays);
            common_vendor.index.showToast({
              title: "赞！今日已完成所有任务🎉",
              icon: "none",
              duration: 2e3
            });
          }
        }
      },
      immediate: true
    }
  },
  methods: {
    // 添加一个通用的日期格式化工具方法
    formatDateString(dateStr) {
      if (!dateStr)
        return null;
      if (dateStr.includes("T")) {
        return new Date(dateStr);
      }
      if (dateStr.includes("GMT")) {
        const d = new Date(dateStr);
        return new Date(d.toISOString());
      }
      return new Date(dateStr.replace(/-/g, "/"));
    },
    async handleAiMessageClick() {
      if (this.habits.length === 0) {
        if (this.currentMessageIndex < this.default_message_list.length - 1) {
          this.currentMessageIndex++;
          const message = this.default_message_list[this.currentMessageIndex];
          this.aiMessage = {
            emoji: message.emoji,
            content: message.content.replace("{nickname}", this.nickname)
          };
        }
      } else {
        try {
          const res = await utils_api.apiService.getLastMessage();
          if (res.status === "success" && res.data) {
            this.aiMessage = {
              emoji: res.data.emoji || this.default_message_list[0].emoji,
              content: res.data.content || this.default_message_list[0].content
            };
          }
        } catch (error) {
          this.aiMessage.emoji = "💼";
          this.aiMessage.content = "加油" + this.nickname + "我去上班啦！";
        }
      }
    },
    addHabit() {
      common_vendor.index.navigateTo({
        url: "/pages/add-habit/add-habit"
      });
    },
    loadUserInfo() {
      try {
        const userInfo = common_vendor.index.getStorageSync("userInfo");
        if (userInfo) {
          this.nickname = userInfo.nickname || "朋友";
        } else {
          this.nickname = "朋友";
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:444", "获取用户信息失败:", error);
        this.nickname = "朋友";
      }
    },
    loadHabits() {
      const habits = common_vendor.index.getStorageSync("habits") || [];
      this.habits = habits.map((habit) => ({
        ...habit,
        icon: habit.icon || "✨",
        color: habit.color || "#fff"
      }));
      common_vendor.index.__f__("log", "at pages/index/index.vue:456", "get habits from storage", habits);
      this.perfectDays = common_vendor.index.getStorageSync("perfectDays") || [];
      common_vendor.index.__f__("log", "at pages/index/index.vue:459", "get perfectDays from storage", this.perfectDays);
    },
    isCompletedForDay(habit, dayIndex) {
      if (!habit || !habit.completed || !Array.isArray(habit.completed)) {
        return false;
      }
      const targetDate = this.getDateFromDayIndex(dayIndex);
      const targetYear = targetDate.getFullYear();
      const targetMonth = targetDate.getMonth();
      const targetDay = targetDate.getDate();
      return habit.completed.some((dateStr) => {
        const completedDate = this.formatDateString(dateStr);
        if (!completedDate)
          return false;
        return completedDate.getFullYear() === targetYear && completedDate.getMonth() === targetMonth && completedDate.getDate() === targetDay;
      });
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
      date.setHours(0, 0, 0, 0);
      return date.toISOString();
    },
    async toggleHabitComplete(habit, dayIndex) {
      this.getDayTimestamp(dayIndex);
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
          title: "补打卡机制还未实现，敬请期待~",
          icon: "none",
          duration: 1e3
        });
        return;
      }
      if (this.isCompletedForDay(habit, dayIndex)) {
        common_vendor.index.showToast({
          title: "已经打过卡了哦~",
          icon: "none",
          duration: 1e3
        });
        return;
      }
      const weekStart = this.getDateFromDayIndex(0);
      const weekEnd = this.getDateFromDayIndex(6);
      weekStart.setHours(0, 0, 0, 0);
      weekEnd.setHours(23, 59, 59, 999);
      const weekCompletedCount = habit.completed.filter((dateStr) => {
        const date = new Date(dateStr);
        return date >= weekStart && date <= weekEnd;
      }).length + 1;
      this.rewardStats = {
        count: weekCompletedCount,
        label: "本周已完成"
      };
      common_vendor.index.vibrateShort();
      this.showRewardCard = true;
      this.rewardTitle = "打卡成功！";
      this.rewardMessage = "";
      this.currentHabit = {
        id: habit.habit_id,
        name: habit.title,
        icon: habit.icon,
        color: habit.color
      };
      try {
        const res = await utils_api.apiService.recordHabit(habit.habit_id);
        if (res.status === "success") {
          const habits = common_vendor.index.getStorageSync("habits") || [];
          const habitIndex = habits.findIndex((h) => h.habit_id === habit.habit_id);
          common_vendor.index.__f__("log", "at pages/index/index.vue:591", "record response", res);
          if (habitIndex !== -1) {
            habits[habitIndex].completed = res.data.completed;
            habits[habitIndex].streak = res.data.streak;
            this.habits = habits;
            common_vendor.index.setStorageSync("habits", habits);
          }
          this.aiMessage = {
            emoji: res.data.emoji,
            content: res.data.content
          };
        } else {
          throw new Error(res.message || "打卡失败");
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "打卡失败",
          icon: "none"
        });
      }
    },
    // 检查本周是否全部完成
    checkWeekCompletion(habit) {
      return Array(7).fill().every((_, index) => this.isCompletedForDay(habit, index));
    },
    goToStats(habit) {
      common_vendor.index.navigateTo({
        url: `/pages/habit-stats/habit-stats?habit_id=${habit.habit_id}&title=${encodeURIComponent(habit.title)}`
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
          common_vendor.index.__f__("log", "at pages/index/index.vue:725", "ActionSheet 关闭", err);
        }
      });
    },
    editHabit(habit) {
      common_vendor.index.navigateTo({
        url: `/pages/add-habit/add-habit?habit_id=${habit.habit_id}`
      });
    },
    async deleteHabit(habit) {
      common_vendor.index.showModal({
        title: "确认删除",
        content: "确定要删除这个习惯吗？此操作不可恢复。",
        confirmColor: "#FF3B30",
        success: async (res) => {
          if (res.confirm) {
            try {
              const res2 = await utils_api.apiService.deleteHabit(habit.habit_id);
              if (res2.status === "success") {
                const habits = common_vendor.index.getStorageSync("habits") || [];
                const updatedHabits = habits.filter((h) => h.habit_id !== habit.habit_id);
                common_vendor.index.setStorageSync("habits", updatedHabits);
                this.loadHabits();
                common_vendor.index.showToast({
                  title: "删除成功",
                  icon: "success"
                });
              } else {
                throw new Error(res2.message || "删除失败");
              }
            } catch (error) {
              common_vendor.index.showToast({
                title: error.message || "删除失败",
                icon: "none"
              });
            }
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
    handleSaveNote({ content, timestamp, role }) {
      if (!content || !this.currentHabit)
        return;
      try {
        const memories = common_vendor.index.getStorageSync("memories") || [];
        memories.push({
          habit_id: this.currentHabit.id,
          content,
          role,
          created_at: timestamp
        });
        common_vendor.index.setStorageSync("memories", memories);
        common_vendor.index.showToast({
          title: "已保存心得体会",
          icon: "success",
          duration: 1500
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:834", "保存心得体会失败:", error);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      }
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
      this.flippedCards[habit.habit_id] = true;
    },
    handleCardTouchEnd(habit) {
      this.flippedCards[habit.habit_id] = false;
    },
    getDaysInMonth() {
      const date = new Date(this.currentYear, this.currentMonth - 1, 1);
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
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
              common_vendor.index.__f__("error", "at pages/index/index.vue:1140", "Share file error:", err);
              common_vendor.index.showToast({
                title: "导出失败",
                icon: "none"
              });
            }
          });
        } catch (err) {
          common_vendor.index.__f__("error", "at pages/index/index.vue:1148", "File operation error:", err);
          common_vendor.index.showToast({
            title: "导出失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/index/index.vue:1155", "Export error:", error);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:1202", "Import error:", error);
        common_vendor.index.showToast({
          title: "导入失败",
          icon: "none"
        });
      }
    },
    mergeImportData(importedHabits) {
      try {
        const currentHabits = common_vendor.index.getStorageSync("habits") || [];
        const habitMap = new Map(currentHabits.map((habit) => [habit.habit_id, habit]));
        importedHabits.forEach((importedHabit) => {
          const existingHabit = habitMap.get(importedhabit.habit_id);
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
            habitMap.set(importedhabit.habit_id, importedHabit);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:1248", "Merge error:", error);
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
        common_vendor.index.__f__("error", "at pages/index/index.vue:1265", "Overwrite error:", error);
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
                common_vendor.index.__f__("error", "at pages/index/index.vue:1317", "Parse error:", parseError);
                common_vendor.index.showToast({
                  title: "文件格式错误",
                  icon: "none"
                });
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/index/index.vue:1325", "Read file error:", err);
              common_vendor.index.showToast({
                title: "读取文件失败",
                icon: "none"
              });
            }
          });
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/index/index.vue:1334", "Choose file error:", err);
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
  async onShow() {
    this.loadUserInfo();
    this.loadHabits();
    this.updateDateInfo();
    this.startClock();
    if (this.habits.length === 0) {
      const initialMessage = this.default_message_list[0];
      this.aiMessage = {
        emoji: initialMessage.emoji,
        content: initialMessage.content.replace("{nickname}", this.nickname)
      };
    } else {
      try {
        const res = await utils_api.apiService.getLastMessage();
        if (res.status === "success" && res.data) {
          this.aiMessage = {
            emoji: res.data.emoji || this.default_message_list[0].emoji,
            content: res.data.content || this.default_message_list[0].content
          };
        }
      } catch (error) {
        this.aiMessage.emoji = "💼";
        this.aiMessage.content = "加油" + this.nickname + "我去上班啦！";
      }
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
  const _component_conv_card = common_vendor.resolveComponent("conv-card");
  const _component_reward_card = common_vendor.resolveComponent("reward-card");
  (_component_conv_card + _component_reward_card)();
}
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: _ctx.showConvCard
  }, _ctx.showConvCard ? {
    b: common_vendor.o(($event) => _ctx.showConvCard = $event),
    c: common_vendor.o(($event) => _ctx.aiMessage.emoji = $event),
    d: common_vendor.o(($event) => _ctx.aiMessage.content = $event),
    e: common_vendor.p({
      show: _ctx.showConvCard,
      emoji: _ctx.aiMessage.emoji,
      content: _ctx.aiMessage.content
    })
  } : {}, {
    f: _ctx.showRewardCard
  }, _ctx.showRewardCard ? {
    g: common_vendor.o(_ctx.handleSaveNote),
    h: common_vendor.o(($event) => _ctx.showRewardCard = $event),
    i: common_vendor.p({
      title: _ctx.rewardTitle,
      message: _ctx.rewardMessage,
      stats: _ctx.rewardStats,
      ["habit-info"]: _ctx.currentHabit,
      show: _ctx.showRewardCard
    })
  } : {}, {
    j: _ctx.currentStreak > 0
  }, _ctx.currentStreak > 0 ? {
    k: common_vendor.t(_ctx.streakFireEmoji)
  } : {}, {
    l: common_vendor.t(_ctx.currentStreak),
    m: `${_ctx.getTodayCompletionRate}%`,
    n: _ctx.getTodayCompletionRate === 100 ? 1 : "",
    o: _ctx.isOrderMode
  }, _ctx.isOrderMode ? {
    p: common_vendor.o((...args) => _ctx.completeOrder && _ctx.completeOrder(...args))
  } : {}, {
    q: common_vendor.t(_ctx.aiMessage.emoji),
    r: common_vendor.t(_ctx.aiMessage.content),
    s: common_vendor.o((...args) => _ctx.handleAiMessageClick && _ctx.handleAiMessageClick(...args)),
    t: common_vendor.f(_ctx.habits, (habit, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(habit.icon),
        b: habit.color,
        c: common_vendor.t(habit.title),
        d: common_vendor.o(($event) => _ctx.showActionSheet(habit), habit.habit_id)
      }, _ctx.isOrderMode ? {
        e: index === 0 ? 1 : "",
        f: common_vendor.o(($event) => _ctx.moveHabitUp(index), habit.habit_id),
        g: index === _ctx.habits.length - 1 ? 1 : "",
        h: common_vendor.o(($event) => _ctx.moveHabitDown(index), habit.habit_id)
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
        j: _ctx.getWeekNotes(habit).length === 0
      }, _ctx.getWeekNotes(habit).length === 0 ? {} : {
        k: common_vendor.f(_ctx.getWeekNotes(habit), (note, index2, i1) => {
          return {
            a: common_vendor.t(_ctx.formatNoteTime(note.timestamp).date),
            b: common_vendor.t(_ctx.formatNoteTime(note.timestamp).time),
            c: common_vendor.t(_ctx.formatNoteTime(note.timestamp).relative),
            d: common_vendor.t(note.content),
            e: index2
          };
        })
      }, {
        l: _ctx.expandedCards[habit.habit_id],
        m: habit.flag
      }, habit.flag ? {
        n: common_vendor.t(habit.flag)
      } : {}, {
        o: common_vendor.t(_ctx.formatCreateTime(habit.createTime)),
        p: habit.habit_id,
        q: _ctx.flippedCards[habit.habit_id] ? 1 : "",
        r: habit.animating,
        s: habit.animating ? 1 : "",
        t: common_vendor.o(($event) => !_ctx.isOrderMode && _ctx.handleCardLongPress(habit), habit.habit_id),
        v: common_vendor.o(($event) => !_ctx.isOrderMode && _ctx.handleCardTouchEnd(habit), habit.habit_id)
      });
    }),
    v: _ctx.isOrderMode,
    w: _ctx.isOrderMode ? 1 : "",
    x: _ctx.isOrderMode ? 1 : "",
    y: `translateX(${_ctx.translateX}px)`,
    z: !_ctx.isOrderMode
  }, !_ctx.isOrderMode ? {
    A: common_vendor.o((...args) => _ctx.addHabit && _ctx.addHabit(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
_sfc_main.__runtimeHooks = 6;
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
