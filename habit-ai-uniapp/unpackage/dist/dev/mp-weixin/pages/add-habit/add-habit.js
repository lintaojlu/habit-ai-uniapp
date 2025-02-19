"use strict";
const common_vendor = require("../../common/vendor.js");
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : r & 3 | 8;
    return v.toString(16);
  });
}
const _sfc_main = {
  data() {
    const today = /* @__PURE__ */ new Date();
    const defaultTarget = /* @__PURE__ */ new Date();
    defaultTarget.setDate(today.getDate() + 21);
    return {
      today: this.formatDate(today),
      targetDate: this.formatDate(defaultTarget),
      currentStep: 1,
      habitName: "",
      habitFlag: "",
      selectedCategory: "",
      currentCategoryGroup: 0,
      reminderTime: "12:00",
      reminderTimes: ["12:00"],
      searchQuery: "",
      emojiMappings: {
        "运动|跑步|跑|步行|走|散步|健身": "🏃",
        "瑜伽|拉伸|柔韧|柔软": "🧘",
        "饮食|吃|食物|营养|餐": "🥗",
        "水|喝水|饮水": "💧",
        "睡觉|睡眠|休息": "😴",
        "冥想|放松|专注": "🧘",
        "体育|球|篮球|足球|羽毛球": "⚽",
        "读书|阅读|看书": "📚",
        "编程|代码|程序": "💻",
        "学习|课程|上课|听课": "📝",
        "写作|写|记录": "✍️",
        "笔记|记|背诵": "📔",
        "整理|收拾|打扫|清洁": "🧹",
        "做饭|烹饪|厨艺": "🍳",
        "理财|存钱|投资|财务": "💰",
        "植物|花|草|园艺": "🌱",
        "音乐|乐器|吉他|钢琴": "🎸",
        "绘画|画画|涂鸦|素描": "🎨",
        "手工|制作|创作": "🎭",
        "摄影|拍照|照片": "📸",
        "唱歌|歌唱|声乐": "🎤",
        "游戏|玩": "🎮",
        "时间|管理|规划": "⏰",
        "目标|计划|安排": "📊",
        "情绪|心情|感受": "🌈",
        "社交|交友|聊天|沟通": "👥",
        default: "✨"
      },
      categories: [
        {
          group: "随便选个",
          items: [
            { label: "闪亮", value: "sparkle", icon: "✨" },
            { label: "星星", value: "star", icon: "⭐" },
            { label: "爱心", value: "heart", icon: "❤️" },
            { label: "彩虹", value: "rainbow", icon: "🌈" },
            { label: "火焰", value: "fire", icon: "🔥" },
            { label: "烟花", value: "firework", icon: "🎆" },
            { label: "小花", value: "flower", icon: "🌸" },
            { label: "太阳", value: "sun", icon: "☀️" },
            { label: "月亮", value: "moon", icon: "🌙" },
            { label: "笑脸", value: "smile", icon: "😊" },
            { label: "皇冠", value: "crown", icon: "👑" },
            { label: "钻石", value: "diamond", icon: "💎" }
          ]
        },
        {
          group: "健康",
          items: [
            { label: "户外活动", value: "workout", icon: "🏃" },
            { label: "健康饮食", value: "diet", icon: "🥗" },
            { label: "喝水", value: "water", icon: "💧" },
            { label: "早睡早起", value: "sleep", icon: "😴" },
            { label: "瑜伽冥想", value: "meditation", icon: "🧘" },
            { label: "体育运动", value: "running", icon: "⚽" }
          ]
        },
        {
          group: "学习",
          items: [
            { label: "阅读", value: "reading", icon: "📚" },
            { label: "编程", value: "coding", icon: "💻" },
            { label: "上课程", value: "course", icon: "📝" }
          ]
        },
        {
          group: "生活",
          items: [
            { label: "整理房间", value: "cleaning", icon: "🧹" },
            { label: "做饭", value: "cooking", icon: "🍳" },
            { label: "理财", value: "finance", icon: "💰" },
            { label: "养护植物", value: "plants", icon: "🌱" }
          ]
        },
        {
          group: "兴趣",
          items: [
            { label: "练乐器", value: "music", icon: "🎸" },
            { label: "绘画", value: "art", icon: "🎨" },
            { label: "手工", value: "craft", icon: "🎭" },
            { label: "摄影", value: "photo", icon: "📸" },
            { label: "唱歌", value: "singing", icon: "🎤" },
            { label: "游戏", value: "game", icon: "🎮" }
          ]
        },
        {
          group: "成长",
          items: [
            { label: "时间管理", value: "time", icon: "⏰" },
            { label: "目标规划", value: "planning", icon: "📊" },
            { label: "情绪记录", value: "mood", icon: "🌈" },
            { label: "社交", value: "social", icon: "👥" }
          ]
        }
      ],
      isEdit: false,
      habitId: null,
      touchStartX: 0,
      touchStartY: 0,
      matchedEmoji: "✨",
      selectedEmoji: "",
      showEmojiInput: false,
      customEmoji: "",
      showEmojiModal: false,
      showSettingsModal: false,
      selectedColor: "$theme-color",
      customColor: "",
      presetColors: [
        { name: "薄荷绿", value: "#98D8C6" },
        { name: "天空蓝", value: "#A5DEF1" },
        { name: "淡紫色", value: "#D4BFEA" },
        { name: "珊瑚粉", value: "#FFB5B5" },
        { name: "柔黄色", value: "#FFE5B4" },
        { name: "薰衣草", value: "#E6E6FA" },
        { name: "浅青色", value: "#B4E6E6" },
        { name: "粉桃色", value: "#FFD1DC" },
        { name: "奶咖色", value: "#D4C4B7" },
        { name: "浅灰蓝", value: "#B8C5D6" },
        { name: "清新绿", value: "#C1E1C1" },
        { name: "温柔粉", value: "#FAD3E7" }
      ],
      themeColorHex: "var(--theme-color)"
    };
  },
  computed: {
    formatTargetDate() {
      const date = new Date(this.targetDate);
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    daysLeft() {
      const target = new Date(this.targetDate);
      const today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      target.setHours(0, 0, 0, 0);
      return Math.ceil((target - today) / (1e3 * 60 * 60 * 24));
    },
    timePeriod() {
      const hour = parseInt(this.reminderTime.split(":")[0]);
      return hour >= 12 ? "PM" : "AM";
    },
    filteredCategories() {
      if (!this.searchQuery)
        return this.categories;
      const query = this.searchQuery.toLowerCase();
      return this.categories.map((group) => ({
        group: group.group,
        items: group.items.filter(
          (item) => item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query)
        )
      }));
    },
    displayEmoji() {
      return this.selectedEmoji || this.matchedEmoji;
    }
  },
  onLoad(options) {
    this.habitName = "";
    this.habitFlag = "";
    this.selectedCategory = "";
    this.selectedEmoji = "";
    this.matchedEmoji = this.emojiMappings.default;
    this.selectedSuggestion = null;
    if (options && options.id) {
      this.isEdit = true;
      this.habitId = options.id;
      this.loadHabitData();
    } else {
      this.isEdit = false;
      this.habitId = null;
    }
    common_vendor.index.setNavigationBarTitle({
      title: this.isEdit ? "编辑习惯" : "添加习惯"
    });
  },
  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    onTargetDateChange(e) {
      this.targetDate = e.detail.value;
    },
    getTimePeriod(time) {
      const hour = parseInt(time.split(":")[0]);
      return hour >= 12 ? "下午" : "上午";
    },
    onTimeChange(e, index) {
      const times = [...this.reminderTimes];
      times[index] = e.detail.value;
      this.reminderTimes = times;
    },
    addTime() {
      if (this.reminderTimes.length < 5) {
        this.reminderTimes.push("12:00");
      }
    },
    deleteTime(index) {
      this.reminderTimes.splice(index, 1);
    },
    nextStep() {
      if (this.currentStep === 1 && !this.habitName.trim()) {
        common_vendor.index.showToast({
          title: "请输入习惯名称",
          icon: "none"
        });
        return;
      }
      if (this.isEdit && this.currentStep === 1) {
        this.currentStep = 2;
        return;
      }
      if (this.currentStep < 3) {
        this.currentStep++;
      }
    },
    selectCategory(category) {
      if (this.selectedCategory === category) {
        this.selectedCategory = "";
        this.selectedEmoji = "";
      } else {
        this.selectedCategory = category;
        const categoryItem = this.categories.flatMap((group) => group.items).find((item) => item.value === category);
        if (categoryItem) {
          this.selectedEmoji = categoryItem.icon;
        }
      }
    },
    skipReminder() {
      this.saveHabit();
    },
    saveHabit() {
      if (!this.habitName.trim()) {
        common_vendor.index.showToast({
          title: "请输入习惯名称",
          icon: "none"
        });
        return;
      }
      const habits = common_vendor.index.getStorageSync("habits") || [];
      if (this.isEdit && this.habitId) {
        const index = habits.findIndex((h) => h.id === this.habitId);
        if (index !== -1) {
          const originalHabit = habits[index];
          habits[index] = {
            ...originalHabit,
            // 保留原有数据（包括 id、completed 等）
            title: this.habitName,
            flag: this.habitFlag,
            category: this.selectedCategory,
            reminderTime: this.reminderTime,
            updateTime: Date.now()
          };
        } else {
          common_vendor.index.__f__("error", "at pages/add-habit/add-habit.vue:526", "Habit not found:", this.habitId);
        }
      } else {
        const newHabit = {
          id: generateUUID(),
          title: this.habitName,
          flag: this.habitFlag,
          category: this.selectedCategory,
          reminderTime: this.reminderTime,
          createTime: Date.now(),
          updateTime: Date.now(),
          completed: [],
          targetDate: this.targetDate,
          notes: []
        };
        habits.push(newHabit);
      }
      common_vendor.index.setStorageSync("habits", habits);
      common_vendor.index.showToast({
        title: this.isEdit ? "保存成功" : "添加成功",
        icon: "success",
        duration: 500
      });
      setTimeout(() => {
        common_vendor.index.navigateBack();
      }, 500);
    },
    loadHabitData() {
      const habits = common_vendor.index.getStorageSync("habits") || [];
      const habit = habits.find((h) => h.id === this.habitId);
      if (habit) {
        this.habitName = habit.title;
        this.habitFlag = habit.flag || "";
        this.selectedCategory = habit.category;
        this.reminderTime = habit.reminderTime || "12:00";
        if (habit.icon) {
          this.selectedEmoji = habit.icon;
          this.matchedEmoji = habit.icon;
        } else {
          this.matchedEmoji = this.matchHabitEmoji(habit.title);
        }
      } else {
        common_vendor.index.__f__("error", "at pages/add-habit/add-habit.vue:572", "Failed to find habit in storage:", {
          searchId: this.habitId,
          availableHabits: habits.map((h) => ({
            id: h.id,
            title: h.title
          }))
        });
        common_vendor.index.showToast({
          title: "未找到习惯数据",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      }
    },
    handleSwiperChange: function handleSwiperChange(e) {
      this.currentCategoryGroup = e.detail.current;
    },
    handleContainerTouchStart: function handleContainerTouchStart(e) {
      if (this.currentStep === 2) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
      }
    },
    handleContainerTouchEnd: function handleContainerTouchEnd(e) {
      if (this.currentStep === 2) {
        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        var minSwipeDistance = 50;
        var deltaX = touchEndX - this.touchStartX;
        var deltaY = touchEndY - this.touchStartY;
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
          if (deltaX > 0 && this.currentCategoryGroup > 0) {
            this.currentCategoryGroup--;
          } else if (deltaX < 0 && this.currentCategoryGroup < this.categories.length - 1) {
            this.currentCategoryGroup++;
          }
        }
      }
    },
    matchHabitEmoji: function matchHabitEmoji(habitName) {
      const text = habitName.toLowerCase();
      const entries = Object.entries(this.emojiMappings);
      for (let i = 0; i < entries.length; i++) {
        const [keywords, emoji] = entries[i];
        const keywordArray = keywords.split("|");
        if (keywordArray.some((keyword) => text.includes(keyword))) {
          return emoji;
        }
      }
      return this.emojiMappings.default;
    },
    selectCustomHabit: function selectCustomHabit() {
      var habitEmoji = this.matchHabitEmoji(this.habitName);
      this.selectedCategory = "custom";
      var habit = {
        id: generateUUID(),
        title: this.habitName,
        flag: this.habitFlag,
        category: "custom",
        icon: habitEmoji,
        createTime: Date.now(),
        updateTime: Date.now(),
        completed: [],
        notes: []
      };
      var habits = common_vendor.index.getStorageSync("habits") || [];
      habits.push(habit);
      common_vendor.index.setStorageSync("habits", habits);
      common_vendor.index.showToast({
        title: "添加成功",
        icon: "success",
        duration: 500
      });
      setTimeout(function() {
        common_vendor.index.navigateBack();
      }, 500);
    },
    selectSuggestion: function selectSuggestion(suggestion) {
      if (this.selectedSuggestion === suggestion) {
        this.selectedSuggestion = null;
        this.habitName = "";
        this.habitFlag = "";
        this.matchedEmoji = this.emojiMappings.default;
        this.selectedEmoji = "";
      } else {
        this.habitName = suggestion.title;
        this.habitFlag = suggestion.flag;
        this.selectedSuggestion = suggestion;
        this.matchedEmoji = this.matchHabitEmoji(suggestion.title);
        this.selectedEmoji = "";
      }
    },
    watchHabitNameChange: function watchHabitNameChange() {
      if (!this.selectedEmoji) {
        this.matchedEmoji = this.matchHabitEmoji(this.habitName);
      }
    },
    completeHabitSetup: function completeHabitSetup() {
      if (!this.habitName.trim()) {
        common_vendor.index.showToast({
          title: "请输入习惯名称",
          icon: "none"
        });
        return;
      }
      const habits = common_vendor.index.getStorageSync("habits") || [];
      if (this.isEdit && this.habitId) {
        const index = habits.findIndex((h) => h.id === this.habitId);
        if (index !== -1) {
          const originalHabit = habits[index];
          habits[index] = {
            ...originalHabit,
            title: this.habitName.trim(),
            flag: this.habitFlag.trim(),
            category: this.selectedCategory || originalHabit.category,
            icon: this.displayEmoji,
            color: this.selectedColor,
            updateTime: Date.now(),
            reminderTime: this.reminderTime
          };
        } else {
          common_vendor.index.__f__("error", "at pages/add-habit/add-habit.vue:701", "Failed to find habit to edit:", this.habitId);
          common_vendor.index.showToast({
            title: "保存失败，未找到习惯",
            icon: "none"
          });
          return;
        }
      } else {
        const newHabit = {
          id: generateUUID(),
          title: this.habitName.trim(),
          flag: this.habitFlag.trim(),
          category: this.selectedCategory || "custom",
          icon: this.displayEmoji,
          color: this.selectedColor,
          createTime: Date.now(),
          updateTime: Date.now(),
          completed: [],
          notes: [],
          reminderTime: this.reminderTime
        };
        habits.push(newHabit);
      }
      try {
        common_vendor.index.setStorageSync("habits", habits);
        common_vendor.index.showToast({
          title: this.isEdit ? "保存成功" : "添加成功",
          icon: "success",
          duration: 500
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 500);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/add-habit/add-habit.vue:736", "Failed to save habit:", error);
        common_vendor.index.showToast({
          title: "保存失败，请重试",
          icon: "none"
        });
      }
    },
    resetEmojiSelection: function resetEmojiSelection() {
      this.selectedEmoji = "";
      this.matchedEmoji = this.matchHabitEmoji(this.habitName);
    },
    tryLuckyEmoji: function tryLuckyEmoji() {
      const decorativeEmojis = this.categories[0].items;
      const randomIndex = Math.floor(Math.random() * decorativeEmojis.length);
      const luckyEmoji = decorativeEmojis[randomIndex];
      this.selectedCategory = luckyEmoji.value;
      this.selectedEmoji = luckyEmoji.icon;
      const duration = 1e3;
      const steps = 10;
      const interval = duration / steps;
      let count = 0;
      const animate = () => {
        if (count < steps) {
          const randomEmoji = decorativeEmojis[Math.floor(Math.random() * decorativeEmojis.length)];
          this.selectedEmoji = randomEmoji.icon;
          count++;
          setTimeout(animate, interval);
        } else {
          this.selectedEmoji = luckyEmoji.icon;
          common_vendor.index.showToast({
            title: "手气不错！",
            icon: "none",
            duration: 1e3
          });
        }
      };
      animate();
    },
    showCustomEmojiInput: function showCustomEmojiInput() {
      this.customEmoji = "";
      this.showEmojiModal = true;
    },
    checkEmojiInput: function checkEmojiInput() {
      const emojiCount = Array.from(this.customEmoji).filter((char) => {
        const code = char.codePointAt(0);
        return code >= 127744 && code <= 129535 || // Miscellaneous Symbols and Pictographs
        code >= 9728 && code <= 9983 || // Miscellaneous Symbols
        code >= 9984 && code <= 10175 || // Dingbats
        code >= 65024 && code <= 65039 || // Variation Selectors
        code >= 129280 && code <= 129535 || // Supplemental Symbols and Pictographs
        code >= 128512 && code <= 128591;
      }).length;
      if (emojiCount > 1) {
        const firstEmoji = Array.from(this.customEmoji).find((char) => {
          const code = char.codePointAt(0);
          return code >= 127744 && code <= 129535 || code >= 9728 && code <= 9983 || code >= 9984 && code <= 10175 || code >= 65024 && code <= 65039 || code >= 129280 && code <= 129535 || code >= 128512 && code <= 128591;
        });
        this.customEmoji = firstEmoji || "";
        common_vendor.index.showToast({
          title: "只能输入一个emoji",
          icon: "none"
        });
      }
    },
    saveCustomEmoji: function saveCustomEmoji() {
      if (!this.customEmoji) {
        common_vendor.index.showToast({
          title: "请输入表情",
          icon: "none"
        });
        return;
      }
      const isEmoji = Array.from(this.customEmoji).some((char) => {
        const code = char.codePointAt(0);
        return code >= 127744 && code <= 129535 || code >= 9728 && code <= 9983 || code >= 9984 && code <= 10175 || code >= 65024 && code <= 65039 || code >= 129280 && code <= 129535 || code >= 128512 && code <= 128591;
      });
      if (isEmoji) {
        this.selectedEmoji = this.customEmoji;
        this.showEmojiModal = false;
      } else {
        common_vendor.index.showToast({
          title: "请输入有效的emoji表情",
          icon: "none"
        });
      }
    },
    showIconSettings: function showIconSettings() {
      this.showSettingsModal = true;
      this.customColor = this.selectedColor === "$theme-color" ? this.themeColorHex : this.selectedColor;
      this.customEmoji = this.selectedEmoji || "";
    },
    validateColorInput: function validateColorInput() {
      this.customColor = this.customColor.replace(/\s/g, "");
      if (this.customColor && !this.customColor.startsWith("#")) {
        this.customColor = "#" + this.customColor;
      }
      if (this.customColor.length > 7) {
        this.customColor = this.customColor.slice(0, 7);
      }
    },
    isValidColor: function isValidColor(color) {
      if (color === "$theme-color")
        return true;
      return /^#[0-9A-Fa-f]{6}$/.test(color);
    },
    selectColor: function selectColor(color) {
      this.selectedColor = color;
      this.customColor = color;
    },
    resetSettings: function resetSettings() {
      this.selectedColor = "$theme-color";
      this.customColor = this.themeColorHex;
      this.selectedEmoji = "";
      this.customEmoji = "";
      this.matchedEmoji = this.matchHabitEmoji(this.habitName);
    },
    saveSettings: function saveSettings() {
      if (this.customColor && this.isValidColor(this.customColor)) {
        this.selectedColor = this.customColor === this.themeColorHex ? "$theme-color" : this.customColor;
      }
      if (this.customEmoji) {
        const isEmoji = Array.from(this.customEmoji).some((char) => {
          const code = char.codePointAt(0);
          return code >= 127744 && code <= 129535 || code >= 9728 && code <= 9983 || code >= 9984 && code <= 10175 || code >= 65024 && code <= 65039 || code >= 129280 && code <= 129535 || code >= 128512 && code <= 128591;
        });
        if (isEmoji) {
          this.selectedEmoji = this.customEmoji;
        }
      }
      this.showSettingsModal = false;
    },
    isValidEmoji: function isValidEmoji(char) {
      if (!char)
        return false;
      return Array.from(char).some((char2) => {
        const code = char2.codePointAt(0);
        return code >= 127744 && code <= 129535 || // Miscellaneous Symbols and Pictographs
        code >= 9728 && code <= 9983 || // Miscellaneous Symbols
        code >= 9984 && code <= 10175 || // Dingbats
        code >= 65024 && code <= 65039 || // Variation Selectors
        code >= 129280 && code <= 129535 || // Supplemental Symbols and Pictographs
        code >= 128512 && code <= 128591;
      });
    }
  },
  watch: {
    habitName: {
      handler: "watchHabitNameChange",
      immediate: true
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.currentStep === 1
  }, $data.currentStep === 1 ? common_vendor.e({
    b: $data.habitName,
    c: common_vendor.o(($event) => $data.habitName = $event.detail.value),
    d: common_vendor.t($data.habitName.length),
    e: $data.habitFlag,
    f: common_vendor.o(($event) => $data.habitFlag = $event.detail.value),
    g: common_vendor.t($data.habitFlag.length),
    h: common_vendor.t($options.formatTargetDate),
    i: common_vendor.t($options.daysLeft),
    j: $data.targetDate,
    k: $data.today,
    l: common_vendor.o((...args) => $options.onTargetDateChange && $options.onTargetDateChange(...args)),
    m: common_vendor.f($data.reminderTimes, (time, index, i0) => {
      return {
        a: common_vendor.t(time),
        b: common_vendor.t($options.getTimePeriod(time)),
        c: time,
        d: common_vendor.o((e) => $options.onTimeChange(e, index), index),
        e: common_vendor.o(($event) => $options.deleteTime(index), index),
        f: index
      };
    }),
    n: $data.reminderTimes.length < 5
  }, $data.reminderTimes.length < 5 ? {
    o: common_vendor.o((...args) => $options.addTime && $options.addTime(...args))
  } : {}, {
    p: common_vendor.o((...args) => $options.nextStep && $options.nextStep(...args))
  }) : {}, {
    q: $data.currentStep === 2
  }, $data.currentStep === 2 ? common_vendor.e({
    r: common_vendor.o(($event) => $data.currentStep = 1),
    s: common_vendor.t($data.habitName),
    t: $data.searchQuery,
    v: common_vendor.o(($event) => $data.searchQuery = $event.detail.value),
    w: common_vendor.t($options.displayEmoji),
    x: $data.selectedColor === "$theme-color" ? $data.themeColorHex : $data.selectedColor,
    y: common_vendor.o((...args) => $options.showIconSettings && $options.showIconSettings(...args)),
    z: common_vendor.t($data.matchedEmoji),
    A: $data.showSettingsModal
  }, $data.showSettingsModal ? {
    B: common_vendor.t($options.isValidEmoji($data.customEmoji) ? $data.customEmoji : $options.displayEmoji),
    C: $data.selectedColor === "$theme-color" ? $data.themeColorHex : $data.selectedColor,
    D: common_vendor.o([($event) => $data.customEmoji = $event.detail.value, (...args) => $options.checkEmojiInput && $options.checkEmojiInput(...args)]),
    E: $data.customEmoji,
    F: common_vendor.o([($event) => $data.customColor = $event.detail.value, (...args) => $options.validateColorInput && $options.validateColorInput(...args)]),
    G: $data.customColor,
    H: $options.isValidColor($data.customColor) ? $data.customColor : $data.selectedColor === "$theme-color" ? $data.themeColorHex : "#CCCCCC",
    I: common_vendor.f($data.presetColors, (color, index, i0) => {
      return {
        a: color.value,
        b: common_vendor.t(color.name),
        c: index,
        d: $data.selectedColor === color.value ? 1 : "",
        e: common_vendor.o(($event) => $options.selectColor(color.value), index)
      };
    }),
    J: common_vendor.o((...args) => $options.resetSettings && $options.resetSettings(...args)),
    K: common_vendor.o(($event) => $data.showSettingsModal = false),
    L: common_vendor.o((...args) => $options.saveSettings && $options.saveSettings(...args))
  } : {}, {
    M: common_vendor.o((...args) => $options.completeHabitSetup && $options.completeHabitSetup(...args)),
    N: common_vendor.f($options.filteredCategories, (categoryGroup, groupIndex, i0) => {
      return common_vendor.e({
        a: common_vendor.t(categoryGroup.group),
        b: groupIndex === 0
      }, groupIndex === 0 ? {
        c: common_vendor.o((...args) => $options.tryLuckyEmoji && $options.tryLuckyEmoji(...args), groupIndex)
      } : {}, {
        d: common_vendor.f(categoryGroup.items, (category, index, i1) => {
          return {
            a: common_vendor.t(category.icon),
            b: common_vendor.t(category.label),
            c: index,
            d: category.icon === $options.displayEmoji ? 1 : "",
            e: common_vendor.o(($event) => $options.selectCategory(category.value), index)
          };
        }),
        e: groupIndex,
        f: categoryGroup.items.length > 0
      });
    })
  }) : {}, {
    O: $data.currentStep === 3
  }, $data.currentStep === 3 ? {
    P: common_vendor.t($data.reminderTime),
    Q: common_vendor.t($options.timePeriod),
    R: $data.reminderTime,
    S: common_vendor.o((...args) => $options.onTimeChange && $options.onTimeChange(...args)),
    T: common_vendor.o((...args) => $options.saveHabit && $options.saveHabit(...args)),
    U: common_vendor.o((...args) => $options.skipReminder && $options.skipReminder(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/add-habit/add-habit.js.map
