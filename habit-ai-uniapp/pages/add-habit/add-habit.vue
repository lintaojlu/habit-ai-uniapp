<template>
  <view class="container">
    <!-- 第一步：习惯名称和目标 -->
    <view class="step" v-if="currentStep === 1">
      <text class="title">为你的习惯起个名字</text>
      <input
          class="habit-input"
          type="text"
          v-model="habitName"
          maxlength="20"
          placeholder="设定一个可执行的习惯，例如：每天写1000字论文。（习惯需要明确且可量化，这样才能有效执行）"
      />
      <view class="input-footer">
        <text class="counter">{{ habitName.length }}/20</text>

      </view>
      <textarea
          class="habit-input flag-input"
          v-model="habitFlag"
          maxlength="100"
          placeholder="描述你的目标，例如：3.10号预答辩，需要完成完整论文。在这之前每天需要1000字论文，最后还要用一周的时间做Slides。（目标尽可能详细，AI会据此了解你，从而更好帮助你）"
      />
      <view class="input-footer">
        <text class="counter">{{ habitFlag.length }}/100</text>
      </view>

      <!-- 目标完成时间 -->
      <view class="target-date">
        <text class="target-title">目标完成时间</text>
        <picker
            mode="date"
            :value="targetDate"
            :start="today"
            @change="onTargetDateChange"
            class="date-picker"
        >
          <view class="date-display">
            <text class="date">{{ formatTargetDate }}</text>
            <text class="days-left">(还有 {{ daysLeft }} 天)</text>
          </view>
        </picker>
      </view>
      

      <!-- 提醒时间选择 -->
      <view class="reminder-times">
        <text class="reminder-title">设置提醒时间</text>
        <view class="reminder-list">
          <view v-for="(time, index) in reminderTimes" :key="index" class="reminder-item">
            <picker
              mode="time"
              :value="time"
              @change="(e) => onTimeChange(e, index)"
              class="time-picker"
            >
              <view class="time-display">
                <text class="time">{{ time }}</text>
                <text class="period">{{ getTimePeriod(time) }}</text>
              </view>
            </picker>
            <text class="delete-time" @tap="deleteTime(index)">×</text>
          </view>
        </view>
        <view class="add-time" @tap="addTime" v-if="reminderTimes.length < 5">
          <text class="add-icon">+</text>
          <text class="add-text">添加提醒时间</text>
        </view>
      </view>

      <button class="next-button" @tap="nextStep">下一步</button>


    </view>

    <!-- 第二步：选择类别 -->
    <view class="step step-category" v-if="currentStep === 2">
      <view class="step-header">
        <view class="back-button" @tap="currentStep = 1">
          <text class="back-arrow">←</text>
        </view>
        <text class="habit-name">为"{{ habitName }}"</text>
      </view>
      <text class="title">选择一个习惯类别</text>
      <view class="search-row">
        <input
            class="search-input"
            type="text"
            v-model="searchQuery"
            placeholder="搜索习惯"
            confirm-type="search"
        />
        <view class="icon-settings" @tap="showIconSettings">
          <view class="icon-preview"
                :style="{ backgroundColor: selectedColor === '$theme-color' ? themeColorHex : selectedColor }">
            <text class="emoji">{{ displayEmoji }}</text>
          </view>
          <text class="settings-tip">自定义</text>
        </view>
      </view>
      <text class="emoji-tip">已根据习惯名称自动匹配图标：{{ matchedEmoji }}</text>

      <!-- 设置弹窗 -->
      <view class="settings-modal" v-if="showSettingsModal">
        <view class="modal-content">
          <view class="settings-preview">
            <view class="preview-box"
                  :style="{ backgroundColor: selectedColor === '$theme-color' ? themeColorHex : selectedColor }">
              <text class="preview-emoji">{{ isValidEmoji(customEmoji) ? customEmoji : displayEmoji }}</text>
            </view>
          </view>
          <view class="settings-section">
            <text class="section-title">自定义图标</text>
            <textarea
                class="emoji-input"
                v-model="customEmoji"
                maxlength="4"
                placeholder="请输入emoji表情"
                @input="checkEmojiInput"
            />
          </view>
          <view class="settings-section">
            <text class="section-title">自定义颜色</text>
            <view class="color-input-row">
              <input
                  class="color-input"
                  type="text"
                  v-model="customColor"
                  placeholder="#RRGGBB"
                  @input="validateColorInput"
              />
              <view
                  class="custom-color-preview"
                  :style="{ backgroundColor: isValidColor(customColor) ? customColor : (selectedColor === '$theme-color' ? themeColorHex : '#CCCCCC') }"
              />
            </view>
          </view>
          <view class="settings-section">
            <view class="preset-colors">
              <view
                  v-for="(color, index) in presetColors"
                  :key="index"
                  class="color-item"
                  :class="{ active: selectedColor === color.value }"
                  @tap="selectColor(color.value)"
              >
                <view class="color-preview" :style="{ backgroundColor: color.value }"/>
                <text class="color-name">{{ color.name }}</text>
              </view>
            </view>
          </view>
          <view class="modal-footer">
            <view class="modal-buttons">
              <text class="reset-btn" @tap="resetSettings">重置</text>
              <text class="cancel-btn" @tap="showSettingsModal = false">取消</text>
              <text class="save-btn" @tap="saveSettings">确定</text>
            </view>
          </view>
        </view>
      </view>

      <button class="complete-button" @tap="completeHabitSetup">完成</button>

      <scroll-view
          class="categories-container"
          scroll-y
          :bounces="false"
          :enhanced="true"
          :show-scrollbar="false"
      >
        <view
            v-for="(categoryGroup, groupIndex) in filteredCategories"
            :key="groupIndex"
            class="category-group"
            v-show="categoryGroup.items.length > 0"
        >
          <view class="group-header">
            <text class="group-title">{{ categoryGroup.group }}</text>
            <view class="group-actions" v-if="groupIndex === 0">
              <view class="lucky-button" @tap="tryLuckyEmoji">
                <text class="lucky-text">试试手气</text>
                <text class="lucky-icon">🎲</text>
              </view>
            </view>
          </view>
          <view class="categories">
            <view
                v-for="(category, index) in categoryGroup.items"
                :key="index"
                class="category-item"
                :class="{ active: category.icon === displayEmoji }"
                @tap="selectCategory(category.value)"
            >
              <text class="emoji-icon">{{ category.icon }}</text>
              <text class="label">{{ category.label }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 第三步：设置提醒 -->
    <view class="step" v-if="currentStep === 3">
      <text class="title">设置每日提醒时间</text>
      <text class="subtitle">通过每日提醒，保持你的习惯不间断。</text>
      <view class="time-picker">
        <picker
            mode="time"
            :value="reminderTime"
            @change="onTimeChange"
        >
          <view class="time-display">
            <text class="time">{{ reminderTime }}</text>
            <text class="period">{{ timePeriod }}</text>
          </view>
        </picker>
      </view>
      <button class="save-button" @tap="saveHabit">保存提醒</button>
      <text class="skip-link" @tap="skipReminder">稍后再说</text>
    </view>
  </view>
</template>

<script>
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export default {
  data() {
    const today = new Date()
    const defaultTarget = new Date()
    defaultTarget.setDate(today.getDate() + 21) // 默认21天后
    return {
      today: this.formatDate(today),
      targetDate: this.formatDate(defaultTarget),
      currentStep: 1,
      habitName: '',
      habitFlag: '',
      selectedCategory: '',
      currentCategoryGroup: 0,
      reminderTime: '12:00',
      reminderTimes: ['12:00'],
      searchQuery: '',
      emojiMappings: {
        '运动|跑步|跑|步行|走|散步|健身': '🏃',
        '瑜伽|拉伸|柔韧|柔软': '🧘',
        '饮食|吃|食物|营养|餐': '🥗',
        '水|喝水|饮水': '💧',
        '睡觉|睡眠|休息': '😴',
        '冥想|放松|专注': '🧘',
        '体育|球|篮球|足球|羽毛球': '⚽',
        '读书|阅读|看书': '📚',
        '编程|代码|程序': '💻',
        '学习|课程|上课|听课': '📝',
        '写作|写|记录': '✍️',
        '笔记|记|背诵': '📔',
        '整理|收拾|打扫|清洁': '🧹',
        '做饭|烹饪|厨艺': '🍳',
        '理财|存钱|投资|财务': '💰',
        '植物|花|草|园艺': '🌱',
        '音乐|乐器|吉他|钢琴': '🎸',
        '绘画|画画|涂鸦|素描': '🎨',
        '手工|制作|创作': '🎭',
        '摄影|拍照|照片': '📸',
        '唱歌|歌唱|声乐': '🎤',
        '游戏|玩': '🎮',
        '时间|管理|规划': '⏰',
        '目标|计划|安排': '📊',
        '情绪|心情|感受': '🌈',
        '社交|交友|聊天|沟通': '👥',
        default: '✨'
      },
      categories: [
        {
          group: '随便选个',
          items: [
            {label: '闪亮', value: 'sparkle', icon: '✨'},
            {label: '星星', value: 'star', icon: '⭐'},
            {label: '爱心', value: 'heart', icon: '❤️'},
            {label: '彩虹', value: 'rainbow', icon: '🌈'},
            {label: '火焰', value: 'fire', icon: '🔥'},
            {label: '烟花', value: 'firework', icon: '🎆'},
            {label: '小花', value: 'flower', icon: '🌸'},
            {label: '太阳', value: 'sun', icon: '☀️'},
            {label: '月亮', value: 'moon', icon: '🌙'},
            {label: '笑脸', value: 'smile', icon: '😊'},
            {label: '皇冠', value: 'crown', icon: '👑'},
            {label: '钻石', value: 'diamond', icon: '💎'}
          ]
        },
        {
          group: '健康',
          items: [
            {label: '户外活动', value: 'workout', icon: '🏃'},
            {label: '健康饮食', value: 'diet', icon: '🥗'},
            {label: '喝水', value: 'water', icon: '💧'},
            {label: '早睡早起', value: 'sleep', icon: '😴'},
            {label: '瑜伽冥想', value: 'meditation', icon: '🧘'},
            {label: '体育运动', value: 'running', icon: '⚽'}
          ]
        },
        {
          group: '学习',
          items: [
            {label: '阅读', value: 'reading', icon: '📚'},
            {label: '编程', value: 'coding', icon: '💻'},
            {label: '上课程', value: 'course', icon: '📝'}
          ]
        },
        {
          group: '生活',
          items: [
            {label: '整理房间', value: 'cleaning', icon: '🧹'},
            {label: '做饭', value: 'cooking', icon: '🍳'},
            {label: '理财', value: 'finance', icon: '💰'},
            {label: '养护植物', value: 'plants', icon: '🌱'}
          ]
        },
        {
          group: '兴趣',
          items: [
            {label: '练乐器', value: 'music', icon: '🎸'},
            {label: '绘画', value: 'art', icon: '🎨'},
            {label: '手工', value: 'craft', icon: '🎭'},
            {label: '摄影', value: 'photo', icon: '📸'},
            {label: '唱歌', value: 'singing', icon: '🎤'},
            {label: '游戏', value: 'game', icon: '🎮'}
          ]
        },
        {
          group: '成长',
          items: [
            {label: '时间管理', value: 'time', icon: '⏰'},
            {label: '目标规划', value: 'planning', icon: '📊'},
            {label: '情绪记录', value: 'mood', icon: '🌈'},
            {label: '社交', value: 'social', icon: '👥'}
          ]
        }
      ],
      isEdit: false,
      habitId: null,
      touchStartX: 0,
      touchStartY: 0,

      matchedEmoji: '✨',
      selectedEmoji: '',
      showEmojiInput: false,
      customEmoji: '',
      showEmojiModal: false,
      showSettingsModal: false,
      selectedColor: '$theme-color',
      customColor: '',
      presetColors: [
        {name: '薄荷绿', value: '#98D8C6'},
        {name: '天空蓝', value: '#A5DEF1'},
        {name: '淡紫色', value: '#D4BFEA'},
        {name: '珊瑚粉', value: '#FFB5B5'},
        {name: '柔黄色', value: '#FFE5B4'},
        {name: '薰衣草', value: '#E6E6FA'},
        {name: '浅青色', value: '#B4E6E6'},
        {name: '粉桃色', value: '#FFD1DC'},
        {name: '奶咖色', value: '#D4C4B7'},
        {name: '浅灰蓝', value: '#B8C5D6'},
        {name: '清新绿', value: '#C1E1C1'},
        {name: '温柔粉', value: '#FAD3E7'}
      ],
      themeColorHex: 'var(--theme-color)'
    }
  },

  computed: {
    formatTargetDate() {
      const date = new Date(this.targetDate)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    },
    
    daysLeft() {
      const target = new Date(this.targetDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      target.setHours(0, 0, 0, 0)
      return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
    },
    timePeriod() {
      const hour = parseInt(this.reminderTime.split(':')[0])
      return hour >= 12 ? 'PM' : 'AM'
    },

    filteredCategories() {
      if (!this.searchQuery) return this.categories
      const query = this.searchQuery.toLowerCase()
      return this.categories.map(group => ({
        group: group.group,
        items: group.items.filter(item =>
            item.label.toLowerCase().includes(query) ||
            item.value.toLowerCase().includes(query)
        )
      }))
    },

    displayEmoji() {
      return this.selectedEmoji || this.matchedEmoji
    }
  },

  onLoad(options) {
    this.habitName = ''
    this.habitFlag = ''
    this.selectedCategory = ''
    this.selectedEmoji = ''
    this.matchedEmoji = this.emojiMappings.default
    this.selectedSuggestion = null

    if (options && options.id) {
      this.isEdit = true
      this.habitId = options.id
      this.loadHabitData()
    } else {
      this.isEdit = false
      this.habitId = null
    }

    uni.setNavigationBarTitle({
      title: this.isEdit ? '编辑习惯' : '添加习惯'
    })
  },

  methods: {
    formatDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    onTargetDateChange(e) {
      this.targetDate = e.detail.value
    },
    getTimePeriod(time) {
      const hour = parseInt(time.split(':')[0])
      return hour >= 12 ? '下午' : '上午'
    },

    onTimeChange(e, index) {
      const times = [...this.reminderTimes]
      times[index] = e.detail.value
      this.reminderTimes = times
    },

    addTime() {
      if (this.reminderTimes.length < 5) {
        this.reminderTimes.push('12:00')
      }
    },

    deleteTime(index) {
      this.reminderTimes.splice(index, 1)
    },

    nextStep() {
      if (this.currentStep === 1 && !this.habitName.trim()) {
        uni.showToast({
          title: '请输入习惯名称',
          icon: 'none'
        })
        return
      }
      if (this.isEdit && this.currentStep === 1) {
        this.currentStep = 2
        return
      }
      if (this.currentStep < 3) {
        this.currentStep++
      }
    },

    selectCategory(category) {
      if (this.selectedCategory === category) {
        this.selectedCategory = ''
        this.selectedEmoji = ''
      } else {
        this.selectedCategory = category
        const categoryItem = this.categories
            .flatMap(group => group.items)
            .find(item => item.value === category)
        if (categoryItem) {
          this.selectedEmoji = categoryItem.icon
        }
      }
    },


    skipReminder() {
      this.saveHabit()
    },

    saveHabit() {
      if (!this.habitName.trim()) {
        uni.showToast({
          title: '请输入习惯名称',
          icon: 'none'
        })
        return
      }

      const habits = uni.getStorageSync('habits') || []

      if (this.isEdit && this.habitId) {
        const index = habits.findIndex(h => h.id === this.habitId)
        if (index !== -1) {
          const originalHabit = habits[index]
          habits[index] = {
            ...originalHabit,
            // 保留原有数据（包括 id、completed 等）
            title: this.habitName,
            flag: this.habitFlag,
            category: this.selectedCategory,
            reminderTime: this.reminderTime,
            updateTime: Date.now()
          }
        } else {
          console.error('Habit not found:', this.habitId)
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
        }
        habits.push(newHabit)
      }

      uni.setStorageSync('habits', habits)
      uni.showToast({
        title: this.isEdit ? '保存成功' : '添加成功',
        icon: 'success',
        duration: 500
      })

      setTimeout(() => {
        uni.navigateBack()
      }, 500)
    },

    loadHabitData() {
      const habits = uni.getStorageSync('habits') || []
      const habit = habits.find(h => h.id === this.habitId)

      if (habit) {
        this.habitName = habit.title
        this.habitFlag = habit.flag || ''
        this.selectedCategory = habit.category
        this.reminderTime = habit.reminderTime || '12:00'
        if (habit.icon) {
          this.selectedEmoji = habit.icon
          this.matchedEmoji = habit.icon
        } else {
          this.matchedEmoji = this.matchHabitEmoji(habit.title)
        }
      } else {
        console.error('Failed to find habit in storage:', {
          searchId: this.habitId,
          availableHabits: habits.map(h => ({
            id: h.id,
            title: h.title
          }))
        })
        uni.showToast({
          title: '未找到习惯数据',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
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
        const keywordArray = keywords.split('|');

        if (keywordArray.some(keyword => text.includes(keyword))) {
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
      var habits = uni.getStorageSync("habits") || [];
      habits.push(habit);
      uni.setStorageSync("habits", habits);
      uni.showToast({
        title: "添加成功",
        icon: "success",
        duration: 500
      });
      setTimeout(function () {
        uni.navigateBack();
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
        uni.showToast({
          title: "请输入习惯名称",
          icon: "none"
        });
        return;
      }

      const habits = uni.getStorageSync("habits") || [];

      if (this.isEdit && this.habitId) {
        const index = habits.findIndex(h => h.id === this.habitId);
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
          console.error("Failed to find habit to edit:", this.habitId);
          uni.showToast({
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
        uni.setStorageSync("habits", habits);
        uni.showToast({
          title: this.isEdit ? "保存成功" : "添加成功",
          icon: "success",
          duration: 500
        });
        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      } catch (error) {
        console.error("Failed to save habit:", error);
        uni.showToast({
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

      const duration = 1000;
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
          uni.showToast({
            title: "手气不错！",
            icon: "none",
            duration: 1000
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
      const emojiCount = Array.from(this.customEmoji).filter(char => {
        const code = char.codePointAt(0);
        return (code >= 127744 && code <= 129535) || // Miscellaneous Symbols and Pictographs
            (code >= 9728 && code <= 9983) ||     // Miscellaneous Symbols
            (code >= 9984 && code <= 10175) ||    // Dingbats
            (code >= 65024 && code <= 65039) ||   // Variation Selectors
            (code >= 129280 && code <= 129535) || // Supplemental Symbols and Pictographs
            (code >= 128512 && code <= 128591);   // Emoticons
      }).length;

      if (emojiCount > 1) {
        const firstEmoji = Array.from(this.customEmoji).find(char => {
          const code = char.codePointAt(0);
          return (code >= 127744 && code <= 129535) ||
              (code >= 9728 && code <= 9983) ||
              (code >= 9984 && code <= 10175) ||
              (code >= 65024 && code <= 65039) ||
              (code >= 129280 && code <= 129535) ||
              (code >= 128512 && code <= 128591);
        });
        this.customEmoji = firstEmoji || "";
        uni.showToast({
          title: "只能输入一个emoji",
          icon: "none"
        });
      }
    },
    saveCustomEmoji: function saveCustomEmoji() {
      if (!this.customEmoji) {
        uni.showToast({
          title: "请输入表情",
          icon: "none"
        });
        return;
      }

      const isEmoji = Array.from(this.customEmoji).some(char => {
        const code = char.codePointAt(0);
        return (code >= 127744 && code <= 129535) ||
            (code >= 9728 && code <= 9983) ||
            (code >= 9984 && code <= 10175) ||
            (code >= 65024 && code <= 65039) ||
            (code >= 129280 && code <= 129535) ||
            (code >= 128512 && code <= 128591);
      });

      if (isEmoji) {
        this.selectedEmoji = this.customEmoji;
        this.showEmojiModal = false;
      } else {
        uni.showToast({
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
      if (color === "$theme-color") return true;
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
        const isEmoji = Array.from(this.customEmoji).some(char => {
          const code = char.codePointAt(0);
          return (code >= 127744 && code <= 129535) ||
              (code >= 9728 && code <= 9983) ||
              (code >= 9984 && code <= 10175) ||
              (code >= 65024 && code <= 65039) ||
              (code >= 129280 && code <= 129535) ||
              (code >= 128512 && code <= 128591);
        });
        if (isEmoji) {
          this.selectedEmoji = this.customEmoji;
        }
      }
      this.showSettingsModal = false;
    },
    isValidEmoji: function isValidEmoji(char) {
      if (!char) return false;
      return Array.from(char).some(char2 => {
        const code = char2.codePointAt(0);
        return (code >= 127744 && code <= 129535) || // Miscellaneous Symbols and Pictographs
            (code >= 9728 && code <= 9983) ||     // Miscellaneous Symbols
            (code >= 9984 && code <= 10175) ||    // Dingbats
            (code >= 65024 && code <= 65039) ||   // Variation Selectors
            (code >= 129280 && code <= 129535) || // Supplemental Symbols and Pictographs
            (code >= 128512 && code <= 128591);   // Emoticons
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
</script>

<style>
.reminder-times {
  margin: 20rpx 0;
}

.reminder-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.reminder-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.reminder-item {
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  padding: 20rpx;
  border-radius: 12rpx;
}

.time-picker {
  flex: 1;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.time {
  font-size: 32rpx;
  color: #333;
}

.period {
  font-size: 24rpx;
  color: #666;
}

.delete-time {
  font-size: 40rpx;
  color: #999;
  padding: 0 20rpx;
}

.add-time {
  display: flex;
  align-items: center;
  gap: 10rpx;
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 12rpx;
}

.add-icon {
  font-size: 32rpx;
  color: #666;
}

.add-text {
  font-size: 28rpx;
  color: #666;
}

.container {
  background-color: #fff;
  color: #2c3e50;
  height: 100vh;
  padding: 20rpx 40rpx;
}

.container, .step {
  box-sizing: border-box;
  overflow: hidden;
}

.step {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding-top: 40rpx;
  position: relative;
  width: 100%;
}

.title {
  font-size: 48rpx;
  font-weight: 600;
  margin-bottom: 40rpx;
}

.subtitle, .title {
  text-align: center;
}

.subtitle {
  color: #5c6b7a;
  font-size: 28rpx;
  margin-bottom: 60rpx;
}

.habit-input {
  background: #f5f7fa;
  font-size: 28rpx;
  border-radius: 20rpx;
  box-sizing: border-box;
  color: #2c3e50;
  height: 100rpx;
  margin-top: 20rpx;
  padding: 0 30rpx;
  width: 100%;
}

.flag-input {
  background: #edf0f5;
  font-size: 28rpx;
  margin: 20rpx 0;
  height: 200rpx !important; /* 增加高度 */
  padding: 20rpx 30rpx !important;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.next-button {
  align-items: center;
  background: var(--theme-color);
  border-radius: 20rpx;
  bottom: 30rpx;
  box-shadow: 0 0 15rpx rgba(255, 159, 10, .15);
  color: #fff;
  display: flex;
  font-size: 32rpx;
  height: 100rpx;
  justify-content: center;
  left: 0;
  margin: 30rpx auto;
  position: absolute;
  width: 100%;
  z-index: 10;
}

.next-button:active {
  opacity: .9;
}

.category-tabs {
  margin: 20rpx 0 30rpx;
  overflow: hidden;
  position: relative;
  width: 100%;
}

.category-tabs .tabs-content {
  display: flex;
  gap: 20rpx;
  padding: 0 20rpx;
  position: relative;
  transition: transform .3s ease;
  transition: transform .3s ease, -webkit-transform .3s ease;
  white-space: nowrap;
}

.category-tabs .tabs-content.group-0 {
  transform: translateX(calc(50vw - 120rpx));
}

.category-tabs .tabs-content.group-1 {
  transform: translateX(calc(50vw - 340rpx));
}

.category-tabs .tabs-content.group-2 {
  transform: translateX(calc(50vw - 560rpx));
}

.category-tabs .tabs-content.group-3 {
  transform: translateX(calc(50vw - 780rpx));
}

.category-tabs .tabs-content.group-4 {
  transform: translateX(calc(50vw - 1000rpx));
}

.category-tabs .tab-item {
  background: #edf0f5;
  border-radius: 40rpx;
  flex-shrink: 0;
  font-size: 28rpx;
  padding: 20rpx 40rpx;
  text-align: center;
  transition: all .3s ease;
  white-space: nowrap;
}

.category-tabs .tab-item.active {
  background: var(--theme-color);
  box-shadow: 0 0 15rpx rgba(255, 159, 10, .15);
  color: #fff;
  transform: scale(1.1);
}

.categories-container {
  -webkit-overflow-scrolling: touch;
  bottom: 160rpx;
  left: 0;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 460rpx;
}

.categories-container::-webkit-scrollbar {
  display: none;
  height: 0;
  width: 0;
}

.category-group:first-child .group-header .group-title {
  display: none;
}

.category-group:first-child .group-header .group-actions {
  width: 100%;
}

.group-header .group-actions .lucky-button .lucky-text {
  font-size: 26rpx;
}

.categories {
  flex-wrap: wrap;
  gap: 20rpx;
  padding: 0 20rpx;
  width: 100%;
}

.categories, .categories .category-item {
  box-sizing: border-box;
  display: flex;
}

.categories .category-item {
  align-items: center;
  aspect-ratio: 1;
  background: #f5f7fa;
  border-radius: 20rpx;
  flex-direction: column;
  justify-content: center;
  margin-bottom: 60rpx;
  overflow: visible;
  position: relative;
  transform: scale(.95);
  transition: all .3s ease;
  width: calc((100% - 100rpx) / 6);
}

.categories .category-item.active {
  background: var(--theme-color);
  transform: scale(1);
}

.categories .category-item.active .emoji-icon {
  filter: brightness(1.2);
}

.categories .category-item .emoji-icon {
  font-size: 44rpx;
}

.categories .category-item .label {
  bottom: -40rpx;
  color: #2c3e50;
  font-size: 20rpx;
  left: -30%;
  overflow: hidden;
  padding: 8rpx 0;
  position: absolute;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 160%;
}

.time-picker {
  padding: 40rpx 0;
  width: 100%;
}

.time-picker .time-display {
  align-items: center;
  display: flex;
  gap: 20rpx;
  justify-content: center;
}

.time-picker .time-display .time {
  color: #2c3e50;
  font-size: 72rpx;
  font-weight: 600;
}

.time-picker .time-display .period {
  color: #5c6b7a;
  font-size: 36rpx;
}

.save-button {
  background: var(--theme-color);
  border-radius: 20rpx;
  box-shadow: 0 0 15rpx rgba(255, 159, 10, .15);
  color: #fff;
  font-size: 32rpx;
  height: 100rpx;
  margin-top: 60rpx;
  width: 100%;
}

.skip-link {
  color: #5c6b7a;
  font-size: 28rpx;
  margin-top: 30rpx;
  text-decoration: underline;
}

.illustration {
  height: 400rpx;
  margin-top: 60rpx;
  width: 400rpx;
}

.search-box {
  margin-bottom: 30rpx;
  padding: 0;
  width: 100%;
}

.search-box .search-input {
  background: #f5f7fa;
  border-radius: 20rpx;
  color: #2c3e50;
  font-size: 28rpx;
  height: 100rpx;
  padding: 0 30rpx;
  width: 100%;
}

.custom-habit {
  margin: 0 0 30rpx;
}

.step-category {
  padding-top: 60rpx;
}

.step-category .title {
  margin-bottom: 60rpx;
}

.search-input {
  margin-bottom: 0;
  width: calc(66.66% - 10rpx);
}

.custom-habit {
  gap: 20rpx;
  margin-bottom: 40rpx;
  padding: 30rpx;
  width: 100%;
}

.custom-habit .label {
  font-size: 32rpx;
}

.category-group {
  margin-bottom: 40rpx;
}

.category-group:last-child {
  margin-bottom: 0;
}

.search-row {
  align-items: center;
  display: flex;
  gap: 20rpx;
  margin-bottom: 40rpx;
  width: 100%;
}

.search-input {
  color: #2c3e50;
  flex: 1;
  font-size: 28rpx;
  padding: 0 30rpx;
}

.custom-habit, .search-input {
  background: #f5f7fa;
  border-radius: 20rpx;
  height: 100rpx;
}

.custom-habit {
  align-items: center;
  display: flex;
  gap: 10rpx;
  justify-content: center;
  padding: 0;
  width: calc(33.33% - 10rpx);
}

.custom-habit .icon {
  font-size: 40rpx;
}

.custom-habit .label {
  color: #2c3e50;
  font-size: 28rpx;
}

.custom-habit:active {
  background: #edf0f5;
}

.category-item:active, .next-button:active, .save-button:active {
  opacity: .9;
}

.habit-suggestions {
  margin: 20rpx 0 40rpx;
}

.habit-suggestions.theme-suggestions {
  margin: 10rpx 0 20rpx;
}

.habit-suggestions.theme-suggestions .suggestion-title {
  font-size: 26rpx;
  margin-left: 10rpx;
}

.habit-suggestions .suggestion-title {
  color: #5c6b7a;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.habit-suggestions .suggestion-scroll {
  -webkit-overflow-scrolling: touch;
  white-space: nowrap;
  width: 100%;
}

.habit-suggestions .suggestion-scroll ::-webkit-scrollbar {
  color: transparent;
  display: none;
  height: 0;
  width: 0;
}

.habit-suggestions .suggestion-cards {
  display: inline-flex;
}

.habit-suggestions .suggestion-card {
  background: #f5f7fa;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, .05), 0 2rpx 8rpx rgba(0, 0, 0, .02);
  display: inline-block;
  margin-left: 10rpx;
  margin-right: 10rpx;
  padding: 20rpx;
  transition: all .3s ease;
  width: 300rpx;
}

.habit-suggestions .suggestion-card.theme-card {
  background: #edf0f5;
  width: 280rpx;
}

.habit-suggestions .suggestion-card.theme-card.active {
  background: var(--theme-color);
  color: #fff;
  transform: scale(1.02);
}

.habit-suggestions .suggestion-card.theme-card.active .card-flag, .habit-suggestions .suggestion-card.theme-card.active .card-title {
  color: #fff;
}

.habit-suggestions .suggestion-card:active {
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, .03), 0 1rpx 4rpx rgba(0, 0, 0, .01);
  opacity: .9;
  transform: scale(.98);
}

.habit-suggestions .suggestion-card .card-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.habit-suggestions .suggestion-card .card-title {
  color: #2c3e50;
  font-size: 28rpx;
  line-height: 1.4;
  white-space: normal;
}

.habit-suggestions .suggestion-card .card-flag {
  color: #5c6b7a;
  font-size: 24rpx;
  line-height: 1.4;
  white-space: normal;
}

.input-footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.input-footer .counter, .input-footer .input-tip {
  color: #5c6b7a;
  font-size: 24rpx;
}

.step-header {
  margin-bottom: 20rpx;
  position: relative;
}

.step-header, .step-header .back-button {
  align-items: center;
  display: flex;
}

.step-header .back-button {
  height: 80rpx;
  justify-content: center;
  left: 0;
  position: absolute;
  width: 80rpx;
}

.step-header .back-button .back-arrow {
  color: #2c3e50;
  font-size: 40rpx;
}

.step-header .back-button:active {
  opacity: .9;
}

.step-header .habit-name {
  color: #5c6b7a;
  font-size: 32rpx;
  text-align: center;
  width: 100%;
}

.step-category .title {
  margin-top: 20rpx;
}

.matched-emoji {
  align-items: center;
  background: #f5f7fa;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  height: 100rpx;
  justify-content: center;
  position: relative;
  transform: scale(.95);
  transition: all .3s ease;
  width: 100rpx;
}

.matched-emoji .emoji {
  font-size: 44rpx;
}

.matched-emoji .reset-tip {
  bottom: -30rpx;
  color: #5c6b7a;
  font-size: 20rpx;
  opacity: 0;
  position: absolute;
  text-align: center;
  transition: opacity .3s;
  width: 100%;
}

.matched-emoji:active {
  background: var(--theme-color);
  opacity: .9;
  transform: scale(1);
}

.matched-emoji:active .emoji {
  color: #fff;
  filter: brightness(1.2);
}

.matched-emoji:active .reset-tip {
  opacity: 1;
}

.complete-button {
  align-items: center;
  background: var(--theme-color);
  border-radius: 20rpx;
  bottom: 30rpx;
  box-shadow: 0 0 15rpx rgba(255, 159, 10, .15);
  box-sizing: border-box;
  color: #fff;
  display: flex;
  font-size: 32rpx;
  height: 100rpx;
  justify-content: center;
  left: 0;
  margin: 30rpx auto;
  padding: 0 40rpx;
  position: absolute;
  width: 100%;
  z-index: 10;
}

.complete-button:active {
  opacity: .9;
}

.emoji-tip {
  color: #5c6b7a;
  font-size: 28rpx;
  margin-bottom: 30rpx;
  text-align: center;
}

.categories-container {
  flex: 1;
  width: 100%;
}

.category-group:first-child .categories .category-item {
  aspect-ratio: 1;
  margin-bottom: 60rpx;
  transform: scale(.95);
  width: calc((100% - 100rpx) / 6);
}

.category-group:first-child .categories .category-item.active {
  transform: scale(1);
}

.category-group:first-child .categories .category-item .emoji-icon {
  font-size: 44rpx;
}

.category-group:first-child .categories .category-item .label {
  bottom: -40rpx;
  font-size: 20rpx;
  left: -30%;
  width: 160%;
}

.group-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-left: 20rpx;
}

.group-header .group-title {
  color: #5c6b7a;
  font-size: 26rpx;
  margin-left: 10rpx;
}

.group-header .group-actions, .group-header .group-actions .lucky-button {
  align-items: center;
  display: flex;
}

.group-header .group-actions .lucky-button {
  background: #f5f7fa;
  border-radius: 30rpx;
  gap: 8rpx;
}

.group-header .group-actions .lucky-button .lucky-text {
  color: #5c6b7a;
  font-size: 24rpx;
  margin-left: 10rpx;
}

.group-header .group-actions .lucky-button .lucky-icon {
  animation: spin 2s linear infinite;
  font-size: 32rpx;
}

.group-header .group-actions .lucky-button:active {
  opacity: .9;
  transform: scale(.95);
}

@-webkit-keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(1turn);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(1turn);
  }
}

.theme-suggestions-container {
  -webkit-overflow-scrolling: touch;
  bottom: 200rpx;
  flex: 1;
  left: 0;
  margin-top: 20rpx;
  overflow-y: auto;
  position: absolute;
  right: 0;
  top: 460rpx;
  width: 100%;
}

.theme-suggestions-container::-webkit-scrollbar {
  display: none;
  height: 0;
  width: 0;
}

.custom-emoji-btn {
  align-items: center;
  background: #f5f7fa;
  border-radius: 20rpx;
  display: flex;
  gap: 8rpx;
  height: 100rpx;
  justify-content: center;
  padding: 0 20rpx;
}

.custom-emoji-btn .btn-text {
  color: #5c6b7a;
  font-size: 24rpx;
}

.custom-emoji-btn .btn-icon {
  font-size: 32rpx;
}

.custom-emoji-btn:active {
  opacity: .9;
  transform: scale(.95);
}

.edit-modal {
  align-items: center;
  background: rgba(0, 0, 0, .5);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.edit-modal .modal-content {
  background: #fff;
  border-radius: 20rpx;
  max-width: 600rpx;
  padding: 40rpx;
  position: relative;
  width: 80%;
}

.edit-modal .modal-content .modal-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.edit-modal .modal-content .modal-header .modal-title {
  color: #2c3e50;
  font-size: 32rpx;
  font-weight: 600;
}

.edit-modal .modal-content .modal-header .close-btn {
  color: #5c6b7a;
  cursor: pointer;
  font-size: 32rpx;
}

.edit-modal .modal-content .edit-textarea {
  background: #f5f7fa;
  border-radius: 20rpx;
  box-sizing: border-box;
  color: #2c3e50;
  font-size: 28rpx;
  height: 80rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  width: 100%;
}

.edit-modal .modal-content .modal-footer {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
}

.edit-modal .modal-content .modal-footer .modal-buttons {
  display: flex;
  gap: 20rpx;
}

.edit-modal .modal-content .modal-footer .modal-buttons .cancel-btn {
  background: transparent;
  border-radius: 20rpx;
  color: #5c6b7a;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
}

.edit-modal .modal-content .modal-footer .modal-buttons .save-btn {
  background: var(--theme-color);
  border-radius: 20rpx;
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
}

.icon-actions {
  gap: 20rpx;
}

.color-picker-btn, .icon-actions {
  display: flex;
}

.color-picker-btn {
  align-items: center;
  background: #f5f7fa;
  border-radius: 20rpx;
  gap: 12rpx;
  height: 100rpx;
  justify-content: center;
  padding: 0 20rpx;
}

.color-picker-btn .color-preview {
  background-color: #f5f7fa; /* 使用默认的浅灰色背景 */
  border: 2rpx solid #e2e7ed;
  border-radius: 16rpx;
  height: 32rpx;
  width: 32rpx;
}

.color-picker-btn .btn-text {
  color: #5c6b7a;
  font-size: 24rpx;
}

.color-picker-btn:active {
  opacity: .9;
  transform: scale(.95);
}

.color-picker-modal {
  display: none;
}

.settings-modal {
  align-items: center;
  background: rgba(0, 0, 0, .5);
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
}

.settings-modal .modal-content {
  background: #fff;
  border-radius: 20rpx;
  max-height: 80vh;
  max-width: 600rpx;
  overflow-y: auto;
  padding: 40rpx;
  width: 90%;
}

.settings-modal .modal-content .settings-preview {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}

.settings-modal .modal-content .settings-preview .preview-box {
  align-items: center;
  border: 4rpx solid #e2e7ed;
  border-radius: 30rpx;
  display: flex;
  height: 120rpx;
  justify-content: center;
  width: 120rpx;
}

.settings-modal .modal-content .settings-preview .preview-box .preview-emoji {
  font-size: 60rpx;
}

.settings-modal .modal-content .settings-section {
  margin-bottom: 40rpx;
}

.settings-modal .modal-content .settings-section .section-title {
  color: #5c6b7a;
  font-size: 28rpx;
  margin-bottom: 20rpx;
}

.settings-modal .modal-content .settings-section .emoji-input {
  background: #f5f7fa;
  border-radius: 20rpx;
  box-sizing: border-box;
  color: #2c3e50;
  font-size: 28rpx;
  height: 80rpx;
  line-height: 1;
  padding: 20rpx 30rpx;
  text-align: center;
  width: 100%;
}

.settings-modal .modal-content .settings-section .color-input-row {
  align-items: center;
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.settings-modal .modal-content .settings-section .color-input-row .color-input {
  background: #f5f7fa;
  border-radius: 20rpx;
  color: #2c3e50;
  flex: 1;
  font-size: 28rpx;
  height: 80rpx;
  padding: 0 30rpx;
}

.settings-modal .modal-content .settings-section .color-input-row .custom-color-preview {
  border: 2rpx solid #e2e7ed;
  border-radius: 20rpx;
  flex-shrink: 0;
  height: 80rpx;
  transition: all .3s ease;
  width: 80rpx;
}

.settings-modal .modal-content .settings-section .color-input-row .custom-color-preview:active {
  transform: scale(.95);
}

.settings-modal .modal-content .settings-section .preset-colors {
  display: grid;
  gap: 20rpx;
  grid-template-columns: repeat(4, 1fr);
}

.settings-modal .modal-content .settings-section .preset-colors .color-item {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.settings-modal .modal-content .settings-section .preset-colors .color-item.active .color-preview {
  box-shadow: 0 0 0 4rpx var(--theme-color);
  transform: scale(1.1);
}

.settings-modal .modal-content .settings-section .preset-colors .color-item .color-preview {
  border: 2rpx solid #e2e7ed;
  border-radius: 20rpx;
  height: 80rpx;
  transition: all .3s ease;
  width: 80rpx;
}

.settings-modal .modal-content .settings-section .preset-colors .color-item .color-preview:active {
  transform: scale(.95);
}

.settings-modal .modal-content .settings-section .preset-colors .color-item .color-name {
  color: #5c6b7a;
  font-size: 20rpx;
  text-align: center;
}

.settings-modal .modal-content .modal-footer {
  align-items: center;
  display: flex;
  justify-content: flex-end;
  margin-top: 30rpx;
}

.settings-modal .modal-content .modal-footer .modal-buttons {
  display: flex;
  gap: 20rpx;
}

.settings-modal .modal-content .modal-footer .modal-buttons .reset-btn {
  background: #f5f7fa;
  border-radius: 20rpx;
  color: #5c6b7a;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
}

.settings-modal .modal-content .modal-footer .modal-buttons .cancel-btn {
  background: transparent;
  border-radius: 20rpx;
  color: #5c6b7a;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
}

.settings-modal .modal-content .modal-footer .modal-buttons .save-btn {
  background: var(--theme-color);
  border-radius: 20rpx;
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
}

.icon-settings {
  background: #f5f7fa;
  border-radius: 20rpx;
  flex-direction: column;
  gap: 8rpx;
  height: 100rpx;
  padding: 0 20rpx;
}

.icon-settings, .icon-settings .icon-preview {
  align-items: center;
  display: flex;
  justify-content: center;
}

.icon-settings .icon-preview {
  border: 2rpx solid #e2e7ed;
  border-radius: 16rpx;
  height: 60rpx;
  width: 60rpx;
}

.icon-settings .icon-preview .emoji {
  font-size: 32rpx;
}

.icon-settings .settings-tip {
  color: #5c6b7a;
  font-size: 20rpx;
}

.icon-settings:active {
  opacity: .9;
  transform: scale(.95);
}


.target-date {
  margin: 20rpx 0;
}

.target-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.date-picker {
  background: #f5f7fa;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
}

.date-display {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.date {
  font-size: 32rpx;
  color: #333;
}

.days-left {
  font-size: 24rpx;
  color: #666;
}

</style>