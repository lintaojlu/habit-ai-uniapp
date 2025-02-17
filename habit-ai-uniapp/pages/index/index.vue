<template>
  <view class="container">
    <reward-card
        v-if="showRewardCard"
        :title="rewardTitle"
        :message="rewardMessage"
        :stats="rewardStats"
        :habit-info="currentHabit"
        :mode="viewMode"
        :show="showRewardCard"
        @saveNote="handleSaveNote"
        @updateShow="showRewardCard = $event"
    />
    <view class="header">
      <view class="date-info">
        <view class="date-content">
          <text class="year">{{ currentYear }}年第{{ yearWeek }}周</text>
          <text class="month-week">{{ currentMonth }}月第{{ monthWeek }}周</text>
        </view>
        <view class="flip-clock">
          <text class="time-unit">{{ formatNumber(hours) }}</text>
          <text class="time-separator">:</text>
          <text class="time-unit">{{ formatNumber(minutes) }}</text>
          <text class="time-separator">:</text>
          <text class="time-unit">{{ formatNumber(seconds) }}</text>
        </view>
      </view>
      <view class="header-row">
        <view class="habit-stats">
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: `${(getTodayCompletedCount / habits.length) * 100}%` }"></view>
          </view>
        </view>
        <view v-if="isOrderMode" class="complete-order-btn" @tap="completeOrder">完成排序</view>
      </view>
    </view>

    <view class="empty-state" v-if="habits.length === 0">
      <text class="empty-icon">📝</text>
      <text class="empty-title">开始培养新习惯</text>
      <text class="empty-desc">点击右下角的加号按钮添加你想要培养的习惯</text>
    </view>

    <view class="ai-message">
      <view class="ai-message-card">
        <text class="ai-message-icon">👩🏻‍</text>
        <text class="ai-message-content">检测到意志力溢出漏洞！建议晚上 10 点前洗漱保证按时睡觉！</text>
      </view>
    </view>

    <view class="view-container" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <view
          class="view-page habits-list"
          :style="{ transform: `translateX(${translateX}px)` }"
      >
        <view
            v-for="(habit, index) in habits"
            :key="habit.id"
            class="habit-card"
            :class="{
            'is-flipped': flippedCards[habit.id],
            'is-order-mode': isOrderMode,
            'no-interaction': isOrderMode,
            [habit.animating]: habit.animating
          }"
            @longpress="!isOrderMode && handleCardLongPress(habit)"
            @touchend="!isOrderMode && handleCardTouchEnd(habit)"
        >
          <!-- 卡片正面 -->
          <view class="card-face card-front">
            <view class="habit-header">
              <view class="title-section">
                <view class="habit-icon" :style="{ 'background-color': habit.color }">
                  <text class="emoji-icon">{{ habit.icon }}</text>
                </view>
                <text class="habit-title">{{ habit.title }}</text>
              </view>
              <view class="more-actions" @tap.stop="showActionSheet(habit)">
                <text class="more-icon">⋮</text>
              </view>
            </view>

            <!-- 排序按钮 -->
            <view class="order-buttons" v-if="isOrderMode">
              <view
                  class="order-btn up"
                  :class="{ disabled: index === 0 }"
                  @tap.stop="moveHabitUp(index)"
              >
                <text class="order-icon">↑</text>
              </view>
              <view
                  class="order-btn down"
                  :class="{ disabled: index === habits.length - 1 }"
                  @tap.stop="moveHabitDown(index)"
              >
                <text class="order-icon">↓</text>
              </view>
            </view>

            <!-- 习惯内容 -->
            <view class="habit-content">
              <view class="progress-view">
                <view
                    v-for="(day, i) in 7"
                    :key="i"
                    class="week-day"
                >
                  <text class="day-label">{{ weekDays[i] }}</text>
                  <view
                      class="day-box"
                      :class="{
                      completed: isCompletedForDay(habit, i),
                      today: isWeekToday(i),
                      future: isFutureDay(i)
                    }"
                      @tap.stop="handleDayClick(habit, i)"
                  >{{ getDayDate(i) }}
                  </view>
                </view>
              </view>
              <view class="expand-button" @tap.stop="toggleCardExpand(habit.id)">
                <text class="expand-text">{{ expandedCards[habit.id] ? '收起心得' : '查看心得' }}</text>
                <text class="expand-icon">{{ expandedCards[habit.id] ? '↑' : '↓' }}</text>
              </view>
            </view>

            <!-- 笔记容器 -->
            <view class="notes-container" v-show="expandedCards[habit.id]">
              <view class="empty-notes" v-if="getWeekNotes(habit).length === 0">
                <text>本周还没有记录心得哦~</text>
              </view>
              <view class="notes-list" v-else>
                <view
                    v-for="(note, index2) in getWeekNotes(habit)"
                    :key="index2"
                    class="note-item"
                >
                  <view class="note-time">
                    <view class="time-left">
                      <text class="date">{{ formatNoteTime(note.timestamp).date }}</text>
                      <text class="time">{{ formatNoteTime(note.timestamp).time }}</text>
                    </view>
                    <view class="time-right">{{ formatNoteTime(note.timestamp).relative }}</view>
                  </view>
                  <view class="note-content">{{ note.content }}</view>
                </view>
              </view>
            </view>
          </view>

          <!-- 卡片背面 -->
          <view class="card-face card-back">
            <view class="flag-banner" v-if="habit.flag">
              <text class="flag-icon">🎯</text>
              <text class="flag-text">{{ habit.flag }}</text>
            </view>
            <view class="flag-banner" v-else>
              <text class="flag-icon">✨</text>
              <text class="flag-text">点击习惯卡片右上角的按钮\n选择编辑添加目标！</text>
            </view>
            <view class="create-time">
              <text class="time-label">创建于</text>
              <text class="time-value">{{ formatCreateTime(habit.createTime) }}</text>
            </view>
          </view>
        </view>
      </view>

      </view>
    </view>

    <view class="add-button" v-if="!isOrderMode" @tap="addHabit">
      <text class="plus">+</text>
    </view>
</template>

<script>
import {defineComponent} from 'vue'
import RewardCard from '@/components/reward-card.vue'

export default defineComponent({
  components: {
    RewardCard
  },
  data() {
    return {
      weekDays: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      habits: [],
      currentYear: 0,
      currentMonth: 0,
      yearWeek: 0,
      monthWeek: 0,
      showRewardCard: false,
      rewardTitle: '',
      rewardMessage: '',
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
    }
  },

  computed: {
    getTodayCompletedCount() {
      const today = new Date()
      const todayTimestamp = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
      ).getTime()
      return this.habits.filter(habit =>
          habit.completed.includes(todayTimestamp)
      ).length
    }
  },


  methods: {
    addHabit() {
      uni.navigateTo({
        url: '/pages/add-habit/add-habit'
      })
    },

    loadHabits() {
      const habits = uni.getStorageSync('habits') || []
      this.habits = habits.map(habit => ({
        ...habit,
        icon: habit.icon || this.getCategoryIcon(habit.category),
        color: habit.color || '$theme-color'
      }))
    },

    // 周视图相关方法
    isCompletedForDay(habit, dayIndex) {
      const timestamp = this.getDayTimestamp(dayIndex)
      return habit.completed.includes(timestamp)
    },

    isWeekToday(dayIndex) {
      const today = new Date()
      const targetDate = this.getDayDate(dayIndex)
      return today.getDate() === targetDate
    },

    isFutureDay(dayIndex) {
      const today = new Date()
      const targetDate = this.getDateFromDayIndex(dayIndex)
      const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const targetDateOnly = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
      return targetDateOnly > todayDate
    },

    getDayDate(dayIndex) {
      const date = this.getDateFromDayIndex(dayIndex)
      return date.getDate()
    },

    getDateFromDayIndex(dayIndex) {
      const today = new Date()
      const monday = new Date()
      monday.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1))
      const targetDate = new Date(monday)
      targetDate.setDate(monday.getDate() + dayIndex)
      return targetDate
    },

    getDayTimestamp(dayIndex) {
      const date = this.getDateFromDayIndex(dayIndex)
      return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
    },

    toggleHabitComplete(habit, dayIndex) {
      const timestamp = this.getDayTimestamp(dayIndex)
      const today = new Date()
      const targetDate = this.getDateFromDayIndex(dayIndex)

      if (targetDate > today) {
        uni.showToast({
          title: '未来还未来哦~',
          icon: 'none',
          duration: 1000
        })
        return
      }

      if (
          targetDate.getDate() !== today.getDate() ||
          targetDate.getMonth() !== today.getMonth() ||
          targetDate.getFullYear() !== today.getFullYear()
      ) {
        uni.showToast({
          title: '请点击习惯卡，在日历中进行补打卡',
          icon: 'none',
          duration: 1000
        })
        return
      }

      const habits = uni.getStorageSync('habits') || []
      const habitIndex = habits.findIndex(h => h.id === habit.id)
      if (habitIndex === -1) return

      const completedIndex = habits[habitIndex].completed.indexOf(timestamp)
      if (completedIndex === -1) {
        habits[habitIndex].completed.push(timestamp)
        const weekStart = this.getDateFromDayIndex(0)
        const weekEnd = this.getDateFromDayIndex(6)
        weekStart.setHours(0, 0, 0, 0)
        weekEnd.setHours(23, 59, 59, 999)

        const weekCompletedCount = habits[habitIndex].completed.filter(time => {
          const date = new Date(time)
          return date >= weekStart && date <= weekEnd
        }).length

        this.showRewardCard = true
        this.rewardTitle = '打卡成功！'
        this.rewardMessage = ''
        this.currentHabit = {
          id: habit.id,
          name: habit.title,
          icon: habit.icon,
          color: habit.color
        }
        this.rewardStats = {
          count: weekCompletedCount,
          label: '本周已完成'
        }
      } else {
        habits[habitIndex].completed.splice(completedIndex, 1)
      }

      uni.setStorageSync('habits', habits)
      this.loadHabits()
      uni.vibrateShort()
    },

    // 检查本周是否全部完成
    checkWeekCompletion(habit) {
      return Array(7).fill().every((_, index) => this.isCompletedForDay(habit, index))
    },

    // 通用方法
    updateHabitCompletion(habit, timestamp) {
      const habits = uni.getStorageSync('habits') || []
      const habitIndex = habits.findIndex(h => h.id === habit.id)
      if (habitIndex === -1) return

      const completedIndex = habits[habitIndex].completed.indexOf(timestamp)
      if (completedIndex === -1) {
        habits[habitIndex].completed.push(timestamp)
      } else {
        habits[habitIndex].completed.splice(completedIndex, 1)
      }

      uni.setStorageSync('habits', habits)
      this.loadHabits()
      uni.vibrateShort()
    },

    goToStats(habit) {
      uni.navigateTo({
        url: `/pages/habit-stats/habit-stats?id=${habit.id}&title=${encodeURIComponent(habit.title)}`
      })
    },

    getCategoryIcon(category) {
      const icons = {
        workout: '🏃',
        diet: '🥗',
        water: '💧',
        sleep: '😴',
        meditation: '🧘',
        running: '⚽',
        reading: '📚',
        coding: '💻',
        course: '📝',
        cleaning: '🧹',
        cooking: '🍳',
        finance: '💰',
        plants: '🌱',
        music: '🎸',
        art: '🎨',
        craft: '🎭',
        photo: '📸',
        singing: '🎤',
        game: '🎮',
        time: '⏰',
        planning: '📊',
        mood: '🌈',
        social: '👥',
        notes: '📝',
        writing: '✍️',
        custom: '✨',
        other: '🎯'
      }
      return icons[category] || '🎯'
    },

    getCategoryColor(category) {
      const colors = {
        // 健康组
        workout: '#FF6B6B',
        diet: '#95E1D3',
        water: '#87CEEB',
        sleep: '#6C5B7B',
        meditation: '#9B89B3',
        running: '#FF6B6B',
        // 学习组
        reading: '#FFD93D',
        coding: '#6C5B7B',
        course: '#96CEB4',
        // 生活组
        cleaning: '#A8E6CF',
        cooking: '#F8B195',
        finance: '#2A363B',
        plants: '#4ECDC4',
        // 兴趣组
        music: '#FF8C94',
        art: '#F67280',
        craft: '#C06C84',
        photo: '#355C7D',
        singing: '#FF8C94',
        game: '#3F72AF',
        // 成长组
        time: '#45B7D1',
        planning: '#96CEB4',
        mood: '#9B89B3',
        social: '#F8B195'
      }
      return colors[category] || '$theme-color'
    },

    showActionSheet(habit) {
      const actions = [
        {
          name: '编辑习惯',
          action: () => this.editHabit(habit)
        },
        {
          name: '调整顺序',
          action: () => this.toggleOrderMode()
        },
        {
          name: '删除习惯',
          action: () => this.deleteHabit(habit)
        }
      ]

      const systemInfo = uni.getSystemInfoSync()
      uni.showActionSheet({
        itemList: actions.map(item => item.name),
        itemColor: systemInfo.platform === 'ios' ? '#007AFF' : '#2d8cf0',
        success: (res) => {
          if (systemInfo.platform === 'ios') {
            setTimeout(() => {
              actions[res.tapIndex]?.action()
            }, 100)
          } else {
            actions[res.tapIndex]?.action()
          }
        },
        fail: (err) => {
          console.log('ActionSheet 关闭', err)
        }
      })
    },

    editHabit(habit) {
      uni.navigateTo({
        url: `/pages/add-habit/add-habit?id=${habit.id}`
      })
    },

    deleteHabit(habit) {
      uni.showModal({
        title: '确认删除',
        content: '确定要删除这个习惯吗？此操作不可恢复。',
        confirmColor: '#FF3B30',
        success: (res) => {
          if (res.confirm) {
            const habits = uni.getStorageSync('habits') || []
            const updatedHabits = habits.filter(h => h.id !== habit.id)
            uni.setStorageSync('habits', updatedHabits)
            this.loadHabits()
            uni.showToast({
              title: '删除成功',
              icon: 'success'
            })
          }
        }
      })
    },

    updateDateInfo() {
      const now = new Date()
      this.currentYear = now.getFullYear()
      this.currentMonth = now.getMonth() + 1

      const calcYearWeek = (date) => {
        const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
        target.setUTCDate(target.getUTCDate() + 3 - (target.getUTCDay() || 7))
        const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1))
        return Math.ceil(((target - yearStart) / 86400000 + 1) / 7)
      }

      const calcMonthWeek = (date) => {
        const d = new Date(date.getTime())
        d.setHours(0, 0, 0, 0)
        const firstDay = new Date(d.getFullYear(), d.getMonth(), 1)
        const firstThursday = new Date(firstDay)
        firstThursday.setDate(firstDay.getDate() + (11 - firstDay.getDay()) % 7 - 3)
        const diff = d - firstThursday
        return Math.floor(diff / 604800000) + 1
      }

      this.yearWeek = calcYearWeek(now)
      this.monthWeek = calcMonthWeek(now)
    },

    onShareAppMessage() {
      return {
        title: '习惯追踪器',
        path: '/pages/index/index'
      }
    },

    onShareTimeline() {
      return {
        title: '习惯追踪器'
      }
    },

    handleSaveNote({timestamp, content}) {
      const noteTimestamp = Date.now()
      const habits = uni.getStorageSync('habits') || []
      const habitIndex = habits.findIndex(h => h.id === this.currentHabit.id)

      habits[habitIndex].notes.push({
        timestamp: noteTimestamp,
        content: content
      })

      uni.setStorageSync('habits', habits)
      this.loadHabits()
    },

    showFutureToast() {
      uni.showToast({
        title: '未来还未来哦~',
        icon: 'none',
        duration: 1000
      })
    },

    handleDayClick(habit, dayIndex) {
      if (this.isFutureDay(dayIndex)) {
        uni.showToast({
          title: '未来还未来哦~',
          icon: 'none',
          duration: 1000
        })
        return
      }
      this.toggleHabitComplete(habit, dayIndex)
    },

    handleCardLongPress(habit) {
      this.flippedCards[habit.id] = true
    },

    handleCardTouchEnd(habit) {
      this.flippedCards[habit.id] = false
    },

    handleTouchStart(event) {
      if (this.isOrderMode) return
      this.touchStartX = event.touches[0].clientX
      this.touchStartTime = Date.now()
      this.translateX = 0
    },

    handleTouchEnd(event) {
      if (this.isOrderMode) return
      const touchEndX = event.changedTouches[0].clientX
      const deltaX = touchEndX - this.touchStartX
      const touchEndTime = Date.now()
      const touchDuration = touchEndTime - this.touchStartTime
      const minSwipeDistance = 100
      const maxSwipeTime = 300
      const swipeVelocity = Math.abs(deltaX) / touchDuration

      if (Math.abs(deltaX) > minSwipeDistance &&
          touchDuration < maxSwipeTime &&
          swipeVelocity > 0.3) {
        if (deltaX < 0 && this.viewMode === 'week') {
          this.switchView('month')
        } else if (deltaX > 0 && this.viewMode === 'month') {
          this.switchView('week')
        }
      }
      this.translateX = 0
    },

    switchView(mode) {
      if (mode === this.viewMode) return
      try {
        const {windowWidth} = uni.getWindowInfo()
        const direction = mode === 'month' ? -1 : 1
        this.translateX = direction * windowWidth * 0.3
        setTimeout(() => {
          this.viewMode = mode
          this.translateX = 0
        }, 50)
      } catch (error) {
        console.error('获取窗口信息失败:', error)
        this.viewMode = mode
        this.translateX = 0
      }
    },

    getDaysInMonth() {
      const date = new Date(this.currentYear, this.currentMonth - 1, 1)
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    },

    isCompletedForMonthDay(habit, day) {
      const timestamp = new Date(this.currentYear, this.currentMonth - 1, day).getTime()
      return habit.completed.includes(timestamp)
    },

    isMonthToday(day) {
      const today = new Date()
      return today.getDate() === day &&
          today.getMonth() === this.currentMonth - 1 &&
          today.getFullYear() === this.currentYear
    },

    isFutureMonthDay(day) {
      const today = new Date()
      const targetDate = new Date(this.currentYear, this.currentMonth - 1, day)
      return targetDate > today
    },

    handleMonthDayClick(habit, day) {
      const timestamp = new Date(this.currentYear, this.currentMonth - 1, day).getTime()
      const today = new Date()
      const targetDate = new Date(this.currentYear, this.currentMonth - 1, day)

      if (targetDate > today) {
        uni.showToast({
          title: '未来还未来哦~',
          icon: 'none',
          duration: 1000
        })
        return
      }

      if (targetDate.getDate() !== today.getDate() ||
          targetDate.getMonth() !== today.getMonth() ||
          targetDate.getFullYear() !== today.getFullYear()) {
        uni.showToast({
          title: '请点击习惯卡，在日历中进行补打卡',
          icon: 'none',
          duration: 1000
        })
        return
      }

      const habits = uni.getStorageSync('habits') || []
      const habitIndex = habits.findIndex(h => h.id === habit.id)
      if (habitIndex === -1) return

      const completedIndex = habits[habitIndex].completed.indexOf(timestamp)
      if (completedIndex === -1) {
        habits[habitIndex].completed.push(timestamp)
        const monthStart = new Date(this.currentYear, this.currentMonth - 1, 1)
        const monthEnd = new Date(this.currentYear, this.currentMonth, 0)
        const monthCompletedCount = habits[habitIndex].completed.filter(time => {
          const date = new Date(time)
          return date >= monthStart && date <= monthEnd
        }).length

        this.showRewardCard = true
        this.rewardTitle = '打卡成功！'
        this.rewardMessage = ''
        this.currentHabit = {
          id: habit.id,
          name: habit.title,
          icon: habit.icon,
          color: habit.color
        }
        this.rewardStats = {
          count: monthCompletedCount
        }
      } else {
        habits[habitIndex].completed.splice(completedIndex, 1)
      }

      uni.setStorageSync('habits', habits)
      this.loadHabits()
      uni.vibrateShort()
    },

    getMonthCompletionCount(habit) {
      const monthStart = new Date(this.currentYear, this.currentMonth - 1, 1)
      const monthEnd = new Date(this.currentYear, this.currentMonth, 0)
      return habit.completed.filter(timestamp => {
        const date = new Date(timestamp)
        return date >= monthStart && date <= monthEnd
      }).length
    },

    getMonthCompletionRate(habit) {
      const daysInMonth = this.getDaysInMonth()
      const completedDays = this.getMonthCompletionCount(habit)
      const today = new Date()
      let availableDays

      if (today.getMonth() === this.currentMonth - 1 && today.getFullYear() === this.currentYear) {
        availableDays = today.getDate()
      } else {
        availableDays = daysInMonth
      }
      return Math.round(completedDays / availableDays * 100)
    },

    formatNumber(num) {
      return num < 10 ? `0${num}` : num
    },

    updateTime() {
      const now = new Date()
      this.hours = now.getHours()
      this.minutes = now.getMinutes()
      this.seconds = now.getSeconds()
    },

    startClock() {
      this.updateTime()
      this.timer = setInterval(() => {
        this.updateTime()
      }, 1000)
    },

    stopClock() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
    },

    toggleOrderMode() {
      this.isOrderMode = !this.isOrderMode
      if (this.isOrderMode) {
        uni.showToast({
          title: '进入排序模式',
          icon: 'none',
          duration: 1500
        })
      }
    },

    moveHabitUp(index) {
      if (index > 0) {
        this.$set(this.habits[index], 'animating', 'moving-up')
        this.$set(this.habits[index - 1], 'animating', 'moving-down')
        setTimeout(() => {
          const habits = [...this.habits]
          const temp = habits[index]
          habits[index] = habits[index - 1]
          habits[index - 1] = temp
          habits[index].animating = ''
          habits[index - 1].animating = ''
          this.habits = habits
          uni.setStorageSync('habits', habits)
        }, 300)
      }
    },

    moveHabitDown(index) {
      if (index < this.habits.length - 1) {
        this.$set(this.habits[index], 'animating', 'moving-down')
        this.$set(this.habits[index + 1], 'animating', 'moving-up')
        setTimeout(() => {
          const habits = [...this.habits]
          const temp = habits[index]
          habits[index] = habits[index + 1]
          habits[index + 1] = temp
          habits[index].animating = ''
          habits[index + 1].animating = ''
          this.habits = habits
          uni.setStorageSync('habits', habits)
        }, 300)
      }
    },

    completeOrder() {
      this.isOrderMode = false
      uni.showToast({
        title: '排序已保存',
        icon: 'success',
        duration: 1500
      })
    },

    formatCreateTime(timestamp) {
      if (!timestamp) return '未知时间'
      const date = new Date(timestamp)
      const now = new Date()
      const isToday = date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()

      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = date.getFullYear() === yesterday.getFullYear() &&
          date.getMonth() === yesterday.getMonth() &&
          date.getDate() === yesterday.getDate()

      const startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const diffTime = Math.abs(endDate - startDate)
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      let daysDesc

      if (isToday) {
        daysDesc = '今天创建'
      } else if (isYesterday) {
        daysDesc = '昨天创建'
      } else {
        daysDesc = `已创建${diffDays}天`
      }

      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${hours}:${minutes} · ${daysDesc}`
    },

    toggleCardExpand(habitId) {
      this.$set(this.expandedCards, habitId, !this.expandedCards[habitId])
    },

    getWeekNotes(habit) {
      if (!habit.notes) return []
      const now = new Date()
      const monday = new Date(now)
      monday.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1))
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)

      const weekStart = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate())
      const weekEnd = new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate(), 23, 59, 59, 999)

      return habit.notes
          .filter(note => {
            const noteDate = new Date(note.retroactiveInfo ? note.retroactiveInfo.retroTimestamp : note.timestamp)
            return noteDate >= weekStart && noteDate <= weekEnd
          })
          .sort((a, b) => {
            const aTime = a.retroactiveInfo ? a.retroactiveInfo.retroTimestamp : a.timestamp
            const bTime = b.retroactiveInfo ? b.retroactiveInfo.retroTimestamp : b.timestamp
            return bTime - aTime
          })
    },

    formatNoteTime(timestamp) {
      const date = new Date(timestamp)
      const now = new Date()
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const timeStr = `${hours}:${minutes}`

      const isToday = date.getDate() === now.getDate() &&
          date.getMonth() === now.getMonth() &&
          date.getFullYear() === now.getFullYear()

      const yesterday = new Date(now)
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = date.getDate() === yesterday.getDate() &&
          date.getMonth() === yesterday.getMonth() &&
          date.getFullYear() === yesterday.getFullYear()

      const weekDay = weekDays[date.getDay()]
      const dateStr = `${date.getMonth() + 1}月${date.getDate()}日`

      return {
        date: `${dateStr} ${weekDay}`,
        time: timeStr,
        relative: isToday ? '今天' : isYesterday ? '昨天' : dateStr
      }
    },

    showBackupOptions() {
      const systemInfo = uni.getSystemInfoSync()
      uni.showActionSheet({
        itemList: ['导出数据', '导入数据'],
        itemColor: systemInfo?.platform === 'ios' ? '#007AFF' : '#2d8cf0',
        success: (res) => {
          if (systemInfo?.platform === 'ios') {
            setTimeout(() => {
              this.handleBackupAction(res.tapIndex)
            }, 100)
          } else {
            this.handleBackupAction(res.tapIndex)
          }
        }
      })
    },

    handleBackupAction(tapIndex) {
      if (tapIndex === 0) {
        this.handleExport()
      } else if (tapIndex === 1) {
        this.handleImport()
      }
    },

    async handleExport() {
      uni.showModal({
        title: '导出说明',
        content: '由于微信小程序的限制，导出数据将通过分享功能实现。导出后您可以选择将文件保存到手机进行备份。',
        confirmText: '继续导出',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.performExport()
          }
        }
      })
    },

    async performExport() {
      try {
        const habits = uni.getStorageSync('habits') || []
        const exportData = {
          version: '1.0',
          exportTime: new Date().toISOString(),
          data: habits
        }

        const jsonStr = JSON.stringify(exportData, null, 2)
        const fileName = `habits_backup_${this.formatExportDate(new Date())}.json`

        try {
          const userPath = wx.env.USER_DATA_PATH
          const filePath = `${userPath}/${fileName}`
          const fs = wx.getFileSystemManager()
          fs.writeFileSync(filePath, jsonStr, 'utf8')

          wx.shareFileMessage({
            filePath: filePath,
            success: () => {
              uni.showToast({
                title: '数据已导出，请确保从你分享的对话中选择该数据文件保存到手机',
                icon: 'none',
                duration: 3000
              })
            },
            fail: (err) => {
              console.error('Share file error:', err)
              uni.showToast({
                title: '导出失败',
                icon: 'none'
              })
            }
          })
        } catch (err) {
          console.error('File operation error:', err)
          uni.showToast({
            title: '导出失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('Export error:', error)
        uni.showToast({
          title: '导出失败',
          icon: 'none'
        })
      }
    },

    formatExportDate(date) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      return `${year}${month}${day}_${hours}${minutes}${seconds}`
    },

    async performImport(importData) {
      try {
        uni.showActionSheet({
          itemList: ['合并数据', '完全覆盖'],
          success: (res) => {
            if (res.tapIndex === 0) {
              uni.showModal({
                title: '确认合并',
                content: '合并将保留现有数据，并添加新数据。确定继续吗？',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.mergeImportData(importData.data)
                  }
                }
              })
            } else {
              uni.showModal({
                title: '确认覆盖',
                content: '此操作将完全覆盖现有数据，确定继续吗？',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    this.overwriteImportData(importData.data)
                  }
                }
              })
            }
          }
        })
      } catch (error) {
        console.error('Import error:', error)
        uni.showToast({
          title: '导入失败',
          icon: 'none'
        })
      }
    },

    mergeImportData(importedHabits) {
      try {
        const currentHabits = uni.getStorageSync('habits') || []
        const habitMap = new Map(currentHabits.map(habit => [habit.id, habit]))

        importedHabits.forEach(importedHabit => {
          const existingHabit = habitMap.get(importedHabit.id)
          if (existingHabit) {
            const completedSet = new Set([...existingHabit.completed, ...importedHabit.completed])
            existingHabit.completed = Array.from(completedSet)

            const notesMap = new Map()
            existingHabit.notes.forEach(note => {
              notesMap.set(note.timestamp, note)
            })
            importedHabit.notes.forEach(note => {
              notesMap.set(note.timestamp, note)
            })
            existingHabit.notes = Array.from(notesMap.values())
                .sort((a, b) => b.timestamp - a.timestamp)

            existingHabit.title = importedHabit.title
            existingHabit.icon = importedHabit.icon
            existingHabit.color = importedHabit.color
            existingHabit.flag = importedHabit.flag
          } else {
            habitMap.set(importedHabit.id, importedHabit)
          }
        })

        const mergedHabits = Array.from(habitMap.values())
        uni.setStorageSync('habits', mergedHabits)
        this.loadHabits()
        uni.showToast({
          title: '数据已合并',
          icon: 'success'
        })
      } catch (error) {
        console.error('Merge error:', error)
        uni.showToast({
          title: '合并失败',
          icon: 'none'
        })
      }
    },

    overwriteImportData(importedHabits) {
      try {
        uni.setStorageSync('habits', importedHabits)
        this.loadHabits()
        uni.showToast({
          title: '导入成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('Overwrite error:', error)
        uni.showToast({
          title: '导入失败',
          icon: 'none'
        })
      }
    },

    async handleImport() {
      uni.showModal({
        title: '导入说明',
        content: '请确保：\n1. 选择的是.json格式的备份文件\n2. 文件是从本应用导出的有效文件\n3. 聊天记录中存在该文件',
        confirmText: '开始导入',
        success: (res) => {
          if (res.confirm) {
            this.chooseAndReadFile()
          }
        }
      })
    },

    chooseAndReadFile() {
      wx.chooseMessageFile({
        count: 1,
        type: 'all', // 修改为 'all' 而不是 'file'
        success: (res) => {
          const tempFilePath = res.tempFiles[0].path
          if (!tempFilePath.toLowerCase().endsWith('.json')) {
            uni.showToast({
              title: '请选择JSON格式文件',
              icon: 'none',
              duration: 2000
            })
            return
          }

          const fs = wx.getFileSystemManager()
          fs.readFile({
            filePath: tempFilePath,
            encoding: 'utf8',
            success: (readRes) => {
              try {
                const importData = JSON.parse(readRes.data)
                if (!this.validateImportData(importData)) {
                  uni.showToast({
                    title: '导入文件格式错误',
                    icon: 'none'
                  })
                  return
                }
                this.performImport(importData)
              } catch (parseError) {
                console.error('Parse error:', parseError)
                uni.showToast({
                  title: '文件格式错误',
                  icon: 'none'
                })
              }
            },
            fail: (err) => {
              console.error('Read file error:', err)
              uni.showToast({
                title: '读取文件失败',
                icon: 'none'
              })
            }
          })
        },
        fail: (err) => {
          console.error('Choose file error:', err)
          const systemInfo = uni.getSystemInfoSync()
          const isIOS = systemInfo.platform === 'ios'
          if (isIOS) {
            uni.showModal({
              title: '选择文件失败',
              content: '请确保:\n1. 选择正确的JSON文件\n2. 如果看不到文件，请重新发送到聊天\n3. 或先保存到"文件"应用再选择',
              showCancel: false
            })
          } else {
            uni.showToast({
              title: '选择文件失败',
              icon: 'none',
              duration: 2000
            })
          }
        }
      })
    }
  },

  onShow() {
    this.loadHabits()
    this.updateDateInfo()
    this.startClock()
    const hasShownReminder = uni.getStorageSync('has_shown_data_loss_reminder')
    if (!hasShownReminder) {
      uni.showModal({
        title: '数据安全提醒',
        content: '请注意：在微信设置中选择"清理小程序缓存"会导致所有数据被删除。建议定期使用导出功能备份您的数据，以防数据丢失。',
        confirmText: '我知道了',
        success: (res) => {
          if (res.confirm) {
            uni.setStorageSync('has_shown_data_loss_reminder', true)
          }
        }
      })
    }
  },

  onHide() {
    this.stopClock()
  },

  onUnload() {
    this.stopClock()
  }
})
</script>

<style>
.container {
  background-color: #fff;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding: 20rpx 40rpx;
}

.container, .ai-message {
  box-sizing: border-box;
}

.ai-message {
  background: #fff;
  left: 0;
  padding: 20rpx 40rpx 0;
  position: fixed;
  right: 0;
  top: 200rpx;
  width: 100%;
  z-index: 100;
}

.ai-message .ai-message-card {
  background: #f5f7fa;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, .05), 0 2rpx 8rpx rgba(0, 0, 0, .02);
  padding: 30rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
  transition: all 0.3s ease;
}

.ai-message .ai-message-card:active {
  opacity: 0.9;
  transform: scale(0.98);
}

.ai-message .ai-message-card .ai-message-icon {
  font-size: 40rpx;
  color: #fff;
  width: 70rpx;
  height: 70rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ai-message .ai-message-card .ai-message-content {
  color: #2c3e50;
  font-size: 28rpx;
  line-height: 1.5;
  flex: 1;
}

.container, .header {
  box-sizing: border-box;
}

.header {
  background: #fff;
  left: 0;
  padding: 20rpx 40rpx 0;
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  z-index: 100;
}

.date-info {
  align-items: center;
  display: flex;
  gap: 20rpx;
  justify-content: space-between;
}

.date-info .date-content {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.date-info .date-content .year {
  color: #2c3e50;
  font-size: 32rpx;
  font-weight: 400;
}

.date-info .date-content .month-week {
  color: #5c6b7a;
  font-size: 24rpx;
}

.date-info .flip-clock {
  align-items: center;
  background: #f5f7fa;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .1);
  display: flex;
  height: 100%;
  padding: 12rpx 24rpx;
}

.date-info .flip-clock .time-unit {
  background: #edf0f5;
  border-radius: 8rpx;
  color: #2c3e50;
  font-size: 36rpx;
  font-weight: 500;
  min-width: 52rpx;
  padding: 8rpx 12rpx;
  position: relative;
  text-align: center;
  transition: all .3s ease;
  width: 100%;
}

.date-info .flip-clock .time-unit::before {
  background: rgba(0, 0, 0, .1);
  content: "";
  height: 2rpx;
  left: 0;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

.date-info .flip-clock .time-separator {
  animation: blink 1s infinite;
  color: #ff9f0a;
  font-size: 36rpx;
  font-weight: 700;
  margin: 0 6rpx;
}

.header-row {
  align-items: center;
  justify-content: space-between;
  margin-top: 10rpx;
}

.habit-stats, .header-row {
  display: flex;
}

.habit-stats {
  gap: 40rpx;
  width: 100%;
  margin-top: 20rpx;
}

.habit-stats .progress-bar {
  background: #edf0f5;
  border-radius: 16rpx;
  height: 12rpx;
  width: 100%;
  overflow: hidden;
}

.habit-stats .progress-bar .progress-fill {
  background: #ff9f0a;
  border-radius: 16rpx;
  height: 100%;
  transition: width 0.3s ease;
  width: 0;
}


.habits-list {
  perspective: 1000px;
}

.habits-list .habit-card {
  background: #f5f7fa;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, .05), 0 2rpx 8rpx rgba(0, 0, 0, .02);
  margin-bottom: 20rpx;
  min-height: 250rpx;
  position: relative;
  transform-style: preserve-3d;
  transition: transform .6s cubic-bezier(.4, 0, .2, 1);
  transition: transform .6s cubic-bezier(.4, 0, .2, 1), -webkit-transform .6s cubic-bezier(.4, 0, .2, 1);
}

.habits-list .habit-card.is-flipped {
  transform: rotateY(180deg);
}

.habits-list .habit-card:active:not(.is-flipped) {
  opacity: .9;
  transform: scale(.98);
}

.habits-list .habit-card .card-face {
  backface-visibility: hidden;
  background: #f5f7fa;
  border-radius: 20rpx;
  box-sizing: border-box;
  padding: 30rpx;
  position: relative;
  width: 100%;
}

.habits-list .habit-card .card-face.card-front {
  transform: rotateY(0deg);
  z-index: 2;
}

.habits-list .habit-card .card-face.card-back {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  left: 0;
  position: absolute;
  top: 0;
  transform: rotateY(180deg);
  z-index: 1;
}

.habits-list .habit-card .card-face.card-back .flag-banner {
  align-items: center;
  background: linear-gradient(180deg, #fff4e5, #ff9f0a);
  border: 2rpx solid #e2e7ed;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(255, 159, 10, .15);
  box-sizing: border-box;
  display: flex;
  gap: 20rpx;
  overflow: hidden;
  padding: 30rpx;
  position: relative;
  width: 100%;
}

.habits-list .habit-card .card-face.card-back .flag-banner::before {
  background: linear-gradient(180deg, transparent, rgba(255, 159, 10, .08));
  content: "";
  height: 2rpx;
  left: 0;
  position: absolute;
  right: 0;
  top: 0;
}

.habits-list .habit-card .card-face.card-back .flag-banner .flag-icon {
  align-items: center;
  background: #edf0f5;
  border-radius: 40rpx;
  display: flex;
  flex-shrink: 0;
  font-size: 48rpx;
  height: 80rpx;
  justify-content: center;
  width: 80rpx;
}

.habits-list .habit-card .card-face.card-back .flag-banner .flag-text {
  color: #2c3e50;
  flex: 1;
  font-size: 32rpx;
  font-weight: 500;
  line-height: 1.5;
  padding: 0 20rpx;
}

.habits-list .habit-card .card-face.card-back .create-time {
  align-items: center;
  bottom: 20rpx;
  display: flex;
  gap: 10rpx;
  justify-content: center;
  left: 0;
  padding: 0 30rpx;
  position: absolute;
  right: 0;
}

.habits-list .habit-card .card-face.card-back .create-time .time-label {
  color: #5c6b7a;
  font-size: 24rpx;
}

.habits-list .habit-card .card-face.card-back .create-time .time-value {
  color: #2c3e50;
  font-size: 24rpx;
}

.habits-list .habit-card .habit-header {
  display: flex;
  justify-content: space-between;
}

.habits-list .habit-card .habit-header .title-section {
  align-items: center;
  border-radius: 16rpx;
  display: flex;
  flex: 1;
  padding: 10rpx;
}

.habits-list .habit-card .habit-header .title-section .habit-icon {
  align-items: center;
  background-color: #ff9f0a;
  border-radius: 16rpx;
  display: flex;
  height: 70rpx;
  justify-content: center;
  overflow: hidden;
  width: 70rpx;
}

.habits-list .habit-card .habit-header .title-section .habit-icon .emoji-icon {
  align-items: center;
  color: #fff;
  display: flex;
  font-size: 40rpx;
  height: 100%;
  justify-content: center;
  width: 100%;
}

.habits-list .habit-card .habit-header .title-section .habit-title {
  color: #2c3e50;
  font-size: 28rpx;
  margin-left: 20rpx;
}

.habits-list .habit-card .habit-header .more-actions {
  align-items: center;
  display: flex;
  height: 60rpx;
  justify-content: center;
  padding: 10rpx;
  width: 60rpx;
}

.habits-list .habit-card .habit-header .more-actions .more-icon {
  color: #5c6b7a;
  font-size: 32rpx;
  font-weight: 700;
}

.habits-list .habit-card .habit-content {
  position: relative;
  z-index: 1;
}

.progress-view {
  display: flex;
  justify-content: space-between;
  margin-top: 30rpx;
}

.progress-view .week-day {
  align-items: center;
  display: flex;
  flex-direction: column;
}

.progress-view .week-day .day-label {
  color: #5c6b7a;
  font-size: 22rpx;
  margin-bottom: 10rpx;
}

.progress-view .week-day .day-box {
  align-items: center;
  background: #edf0f5;
  border-radius: 16rpx;
  color: #2c3e50;
  display: flex;
  font-size: 24rpx;
  height: 70rpx;
  justify-content: center;
  position: relative;
  transition: all .2s ease;
  width: 70rpx;
}

.progress-view .week-day .day-box:active {
  opacity: .9;
  transform: scale(.95);
}

.progress-view .week-day .day-box.today {
  border: 2rpx solid #ff9f0a !important;
}

.progress-view .week-day .day-box.today::after {
  background-color: #ff9f0a;
  border-radius: 50%;
  bottom: -20rpx;
  content: "";
  height: 8rpx;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 8rpx;
  z-index: 1;
}

.progress-view .week-day .day-box.completed {
  animation: complete-animation .5s cubic-bezier(.4, 0, .2, 1);
  background: #ff9f0a !important;
  box-shadow: 0 0 15rpx rgba(255, 159, 10, .15);
  color: #fff !important;
}

.progress-view .week-day .day-box.completed:not(:active) {
  animation: none;
}

.progress-view .week-day .day-box.today.completed {
  background: #ff9f0a !important;
  border-color: #fff !important;
  color: #fff !important;
}

.progress-view .week-day .day-box.today.completed::after {
  background-color: #ff9f0a;
  border-radius: 50%;
  bottom: -20rpx;
  content: "";
  height: 8rpx;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  width: 8rpx;
  z-index: 1;
}

.progress-view .week-day .day-box.future {
  opacity: .5;
}

.add-button {
  position: fixed;
  bottom: 40rpx; /* 修改：增加底部距离 */
  right: 40rpx; /* 修改：增加右侧距离 */
  width: 100rpx;
  height: 100rpx;
  background: #ff9f0a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(255, 159, 10, .15);
  z-index: 999; /* 修改：增加 z-index 确保在最上层 */
}

.add-button .plus {
  color: #fff;
  font-size: 50rpx;
  font-weight: 300;
}

.add-button:active {
  opacity: .9;
  transform: scale(.95);
}

.empty-state {
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  margin-top: -200rpx;
  padding: 40rpx;
}

.empty-state .empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-state .empty-title {
  color: #2c3e50;
  font-size: 32rpx;
  margin-bottom: 16rpx;
}

.empty-state .empty-desc {
  color: #5c6b7a;
  font-size: 28rpx;
  line-height: 1.5;
  text-align: center;
}

@-webkit-keyframes complete-animation {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes complete-animation {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.2);
  }

  100% {
    transform: scale(1);
  }
}



.view-container {
  height: calc(100vh - 220rpx);
  margin-top: 400rpx;
  overflow-y: auto;
  position: relative;
}

.view-container .view-page {
  width: 100%;
  will-change: transform;
}

.view-container .view-page, .view-container .view-page.slide-left-enter-active, .view-container .view-page.slide-right-enter-active {
  transition: transform .3s ease-out;
  transition: transform .3s ease-out, -webkit-transform .3s ease-out;
}

.view-container .view-page.slide-left-enter-from {
  transform: translateX(100%);
}

.view-container .view-page.slide-right-enter-from {
  transform: translateX(-100%);
}

.view-container .view-page.slide-left-enter-to, .view-container .view-page.slide-right-enter-to {
  transform: translateX(0);
}

@-webkit-keyframes blink {
  0%, 100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}

@keyframes blink {
  0%, 100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}

.complete-order-btn {
  background: #ff9f0a;
  border-radius: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .1);
  color: #fff;
  font-size: 28rpx;
  padding: 10rpx 30rpx;
}

.complete-order-btn:active {
  opacity: .9;
  transform: scale(.95);
}

.habit-card {
  position: relative;
  transform-origin: center center;
  transition: all .3s linear;
}

.habit-card.is-order-mode {
  padding-right: 100rpx;
  transform: translateX(-60rpx);
}

.habit-card.moving-up {
  animation: moveUp .3s linear;
}

.habit-card.moving-down {
  animation: moveDown .3s linear;
}

.habit-card.no-interaction, .habit-card.no-interaction .habit-content, .habit-card.no-interaction .more-actions {
  pointer-events: none;
}

.habit-card.no-interaction .order-buttons {
  pointer-events: auto;
}

.habit-card .order-buttons {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  position: absolute;
  right: -70rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
}

.habit-card .order-buttons .order-btn {
  align-items: center;
  background: #f5f7fa;
  border-radius: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, .1);
  display: flex;
  height: 60rpx;
  justify-content: center;
  width: 60rpx;
}

.habit-card .order-buttons .order-btn.disabled {
  opacity: .5;
  pointer-events: none;
}

.habit-card .order-buttons .order-btn:active {
  opacity: .9;
  transform: scale(.9);
}

.habit-card .order-buttons .order-btn .order-icon {
  color: #2c3e50;
  font-size: 32rpx;
  font-weight: 700;
}

.habit-card .order-buttons .order-btn.up {
  background: #ff9f0a;
}

.habit-card .order-buttons .order-btn.up .order-icon {
  color: #fff;
}

.habit-card .order-buttons .order-btn.down {
  background: #edf0f5;
}

.month-habit-card.no-interaction {
  pointer-events: none;
}

@-webkit-keyframes moveUp {
  0% {
    transform: translateX(-60rpx) translateY(0);
  }

  100% {
    transform: translateX(-60rpx) translateY(-240rpx);
  }
}

@keyframes moveUp {
  0% {
    transform: translateX(-60rpx) translateY(0);
  }

  100% {
    transform: translateX(-60rpx) translateY(-240rpx);
  }
}

@-webkit-keyframes moveDown {
  0% {
    transform: translateX(-60rpx) translateY(0);
  }

  100% {
    transform: translateX(-60rpx) translateY(240rpx);
  }
}

@keyframes moveDown {
  0% {
    transform: translateX(-60rpx) translateY(0);
  }

  100% {
    transform: translateX(-60rpx) translateY(240rpx);
  }
}

.expand-button {
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 10rpx;
  justify-content: center;
  padding: 20rpx 0 10rpx;
}

.expand-button .expand-icon, .expand-button .expand-text {
  color: #5c6b7a;
  font-size: 24rpx;
}

.expand-button .expand-icon {
  transition: transform .3s ease;
  transition: transform .3s ease, -webkit-transform .3s ease;
}

.expand-button:active {
  opacity: .9;
}

.notes-container {
  border-top: 2rpx solid #edf0f5;
  margin-top: 20rpx;
  padding-top: 20rpx;
  position: relative;
  z-index: 1;
}

.notes-container .empty-notes {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  padding: 30rpx;
  width: 100%;
}

.notes-container .empty-notes text {
  color: rgba(44, 62, 80, .6);
  font-size: 28rpx;
  text-align: center;
}

.notes-container .notes-list {
  box-sizing: border-box;
  margin: 0 auto;
  max-height: 400rpx;
  overflow-y: auto;
  width: 100%;
}

.notes-container .notes-list .note-item {
  background: #edf0f5;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, .05), 0 2rpx 8rpx rgba(0, 0, 0, .02);
  box-sizing: border-box;
  margin-bottom: 20rpx;
  padding: 30rpx;
  transition: all .2s ease;
  width: 100%;
}

.notes-container .notes-list .note-item:active {
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, .03), 0 1rpx 4rpx rgba(0, 0, 0, .01);
  transform: scale(.98);
}

.notes-container .notes-list .note-item .note-time {
  align-items: center;
  color: #8c9baa;
  display: flex;
  font-size: 24rpx;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
}

.notes-container .notes-list .note-item .note-time .time-left {
  align-items: center;
  display: flex;
  gap: 8rpx;
}

.notes-container .notes-list .note-item .note-time .time-left .date {
  color: #5c6b7a;
}

.notes-container .notes-list .note-item .note-time .time-left .time {
  color: #8c9baa;
}

.notes-container .notes-list .note-item .note-time .time-right {
  color: #8c9baa;
  font-size: 22rpx;
  opacity: .8;
}

.notes-container .notes-list .note-item .note-content {
  color: #2c3e50;
  font-size: 28rpx;
  line-height: 1.6;
  padding-top: 4rpx;
}

.backup-actions .backup-btn {
  align-items: center;
  background: transparent;
  border: none;
  display: flex;
  justify-content: center;
  margin: 0;
  padding: 10rpx;
}

.backup-actions .backup-btn::after {
  border: none;
}

.backup-actions .backup-btn .icon {
  font-size: 40rpx;
}

.backup-actions .backup-btn:active {
  opacity: .7;
}
</style>