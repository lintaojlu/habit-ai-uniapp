<template>
  <view class="container">
    <view class="calendar-section">
      <view class="month-header">
        <text class="month-title">{{ currentYear }}年{{ currentMonth }}月</text>
        <view class="month-controls">
          <text class="arrow" @tap="changeMonth(-1)">←</text>
          <text class="arrow" @tap="changeMonth(1)">→</text>
        </view>
      </view>
      <view class="calendar-grid">
        <view class="weekday-row">
          <text class="weekday" v-for="(day, index) in weekDays" :key="'weekday-' + index">{{ day }}</text>
        </view>
        <view class="days-grid">
          <view
              v-for="(day, index) in calendarDays"
              :key="'day-' + index"
              class="day-cell"
              :class="{
              'today': day.isToday,
              'selected': selectedDate === day.dateStr,
              'not-current-month': !day.isCurrentMonth
            }"
              @tap="day.isCurrentMonth && selectDate(day)"
          >
            <text class="day-number">{{ day.dayNumber }}</text>
            <view class="habits-count" v-if="day.habits.length > 0">
              <text class="count">{{ day.habits.length }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="notes-section" v-if="selectedDate">
      <text class="section-title">{{ formatSelectedDate(selectedDate) }}的打卡记录</text>
      <view class="notes-list" v-if="dailyRecords.length > 0">
        <view class="tags-wrapper">
          <text
              v-for="(record, index) in dailyRecords.filter(r => !r.content)"
              :key="'tag-' + index"
              class="habit-tag"
              :style="{
              backgroundColor: getCategoryColor(record.habit.category) + '20',
              color: getCategoryColor(record.habit.category)
            }"
          >{{ record.habit.title }}</text>
        </view>
        <view
            v-for="(record, index) in dailyRecords.filter(r => r.content)"
            :key="'note-' + index"
            class="note-card"
        >
          <view class="note-header">
            <text class="habit-name" :style="{ color: getCategoryColor(record.habit.category) }">
              {{ record.habit.title }}
            </text>
            <text class="note-date">{{ formatDate(record.timestamp) }}</text>
          </view>
          <view class="note-content">{{ record.content }}</view>
        </view>
      </view>
      <view class="empty-notes" v-else>
        <text class="empty-icon">📅</text>
        <text class="empty-message">当日没有打卡记录</text>
      </view>
    </view>
  </view>
</template>

<script>
import {defineComponent} from 'vue'

export default defineComponent({
  data() {
    const today = new Date()
    return {
      weekDays: ['日', '一', '二', '三', '四', '五', '六'],
      currentYear: today.getFullYear(),
      currentMonth: today.getMonth() + 1,
      selectedDate: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`,
      allHabits: []
    }
  },

  computed: {
    calendarDays() {
      const days = []
      const firstDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, 1)
      const lastDayOfMonth = new Date(this.currentYear, this.currentMonth, 0)
      const daysInMonth = lastDayOfMonth.getDate()
      const firstDayWeekday = firstDayOfMonth.getDay()
      const prevMonthLastDay = new Date(this.currentYear, this.currentMonth - 1, 0).getDate()

      // 填充上个月的日期
      for (let i = firstDayWeekday - 1; i >= 0; i--) {
        const prevMonthDay = prevMonthLastDay - i
        const prevDate = new Date(this.currentYear, this.currentMonth - 2, prevMonthDay)
        days.push({
          dayNumber: prevMonthDay,
          dateStr: this.formatDateStr(prevDate),
          habits: [],
          isCurrentMonth: false
        })
      }

      // 填充当前月的日期
      for (let i = 1; i <= daysInMonth; i++) {
        const currentDate = new Date(this.currentYear, this.currentMonth - 1, i)
        const dateStr = this.formatDateStr(currentDate)
        const habits = this.allHabits.filter(habit =>
            habit.completed.some(t => {
              const d = new Date(t)
              return d.getFullYear() === currentDate.getFullYear() &&
                  d.getMonth() === currentDate.getMonth() &&
                  d.getDate() === currentDate.getDate()
            })
        )
        days.push({
          dayNumber: i,
          dateStr,
          habits,
          isToday: this.isToday(currentDate),
          isCurrentMonth: true
        })
      }

      // 填充下个月的日期
      const totalDaysNeeded = 42
      const remainingDays = totalDaysNeeded - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(this.currentYear, this.currentMonth, i)
        days.push({
          dayNumber: i,
          dateStr: this.formatDateStr(nextDate),
          habits: [],
          isCurrentMonth: false
        })
      }

      return days
    },

    dailyRecords() {
      if (!this.selectedDate) return []

      return this.allHabits
          .filter(habit =>
              habit.completed.some(t => {
                const d = new Date(t)
                return this.isSameDate(d, new Date(this.selectedDate))
              })
          )
          .flatMap(habit => {
            const notes = (habit.notes || []).filter(note => {
              const noteDate = note.retroactiveInfo
                  ? new Date(note.retroactiveInfo.retroTimestamp)
                  : new Date(note.timestamp)
              return this.isSameDate(noteDate, new Date(this.selectedDate))
            })

            if (notes.length > 0) {
              return notes.map(note => ({
                ...note,
                habit
              }))
            }

            const lastCheckTime = habit.completed.find(t =>
                this.isSameDate(new Date(t), new Date(this.selectedDate))
            )

            return [{
              habit,
              timestamp: lastCheckTime,
              content: null
            }]
          })
          .sort((a, b) => b.timestamp - a.timestamp)
    }
  },

  methods: {
    initData() {
      this.allHabits = uni.getStorageSync('habits') || []
    },

    selectDate(day) {
      if (day.dayNumber) {
        const date = new Date(this.currentYear, this.currentMonth - 1, day.dayNumber)
        this.selectedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      }
    },

    changeMonth(delta) {
      let newMonth = this.currentMonth + delta
      let newYear = this.currentYear

      if (newMonth > 12) {
        newMonth = 1
        newYear++
      } else if (newMonth < 1) {
        newMonth = 12
        newYear--
      }

      this.currentMonth = newMonth
      this.currentYear = newYear
      this.selectedDate = null
    },

    formatSelectedDate(dateStr) {
      const date = new Date(dateStr)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    },

    formatDate(timestamp) {
      const date = new Date(timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    },

    isToday(date) {
      const today = new Date()
      return date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate()
    },

    getCategoryColor(category) {
      const colors = {
        sports: '#FF6B6B',
        health: '#4ECDC4',
        work: '#45B7D1',
        study: '#96CEB4'
      }
      return colors[category] || '#808080'
    },

    formatDateStr(date) {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    },

    isSameDate(date1, date2) {
      return date1.getFullYear() === date2.getFullYear() &&
          date1.getMonth() === date2.getMonth() &&
          date1.getDate() === date2.getDate()
    }
  },

  onLoad() {
    this.initData()
  },

  onShow() {
    const today = new Date()
    this.selectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  }
})
</script>

<style>
.container {
  background-color: #fff;
  box-sizing: border-box;
  color: #2c3e50;
  min-height: 100vh;
  padding: 20rpx 40rpx;
}

.calendar-section {
  background: #f5f7fa;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,.05),0 2rpx 8rpx rgba(0,0,0,.02);
  margin-bottom: 30rpx;
  padding: 30rpx;
}

.month-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.month-header .month-title {
  color: #2c3e50;
  font-size: 32rpx;
  font-weight: 500;
}

.month-header .month-controls {
  display: flex;
  gap: 30rpx;
}

.month-header .month-controls .arrow {
  align-items: center;
  background: #edf0f5;
  border-radius: 30rpx;
  color: #2c3e50;
  display: flex;
  font-size: 28rpx;
  height: 60rpx;
  justify-content: center;
  transition: all .2s ease;
  width: 60rpx;
}

.month-header .month-controls .arrow:active {
  opacity: .9;
  transform: scale(.95);
}

.calendar-grid .weekday-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.calendar-grid .weekday-row .weekday {
  color: #5c6b7a;
  font-size: 24rpx;
  text-align: center;
  width: 14%;
}

.calendar-grid .days-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
}

.calendar-grid .days-grid .day-cell {
  aspect-ratio: 1;
  background: #e8e8e8;
  border-radius: 16rpx;
  box-sizing: border-box;
  padding: 12rpx;
  position: relative;
  transition: all .2s ease;
  width: calc(14.28% - 8rpx);
}

.calendar-grid .days-grid .day-cell:active {
  opacity: .9;
  transform: scale(.95);
}

.calendar-grid .days-grid .day-cell:not(.isCurrentMonth) {
  opacity: .5;
}

.calendar-grid .days-grid .day-cell .day-number {
  color: #5c6b7a;
  font-size: 24rpx;
  left: 8rpx;
  position: absolute;
  top: 8rpx;
}

.calendar-grid .days-grid .day-cell .habits-count {
  bottom: 8rpx;
  position: absolute;
  right: 8rpx;
}

.calendar-grid .days-grid .day-cell .habits-count .count {
  background: var(--theme-color);
  border-radius: 16rpx;
  color: #fff;
  display: inline-block;
  font-size: 20rpx;
  height: 32rpx;
  line-height: 32rpx;
  min-width: 32rpx;
  opacity: 1;
  padding: 0 8rpx;
  text-align: center;
}

.calendar-grid .days-grid .day-cell.today {
  border: 2rpx solid var(--theme-color);
  opacity: 1;
}

.calendar-grid .days-grid .day-cell.today::after {
  background-color: var(--theme-color);
  border-radius: 50%;
  bottom: -16rpx;
  content: "";
  height: 8rpx;
  left: 50%;
  opacity: 1;
  position: absolute;
  transform: translateX(-50%);
  width: 8rpx;
}

.calendar-grid .days-grid .day-cell.selected {
  background: var(--theme-color);
  opacity: 1;
}

.calendar-grid .days-grid .day-cell.selected .day-number {
  color: #fff;
}

.calendar-grid .days-grid .day-cell.selected .habits-count .count {
  background: #fff;
  color: var(--theme-color);
  opacity: 1;
}

.calendar-grid .days-grid .day-cell.not-current-month {
  background: #edf0f5;
  opacity: .6;
  pointer-events: none;
}

.calendar-grid .days-grid .day-cell.not-current-month .day-number {
  color: #999;
}

.notes-section {
  margin-top: 30rpx;
}

.notes-section .section-title {
  color: #2c3e50;
  display: block;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.notes-section .notes-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.notes-section .notes-list .tags-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.notes-section .notes-list .tags-wrapper .habit-tag {
  border-radius: 100rpx;
  font-size: 24rpx;
  font-weight: 500;
  padding: 8rpx 20rpx;
}

.notes-section .notes-list .note-card {
  background: #f5f7fa;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,.05),0 2rpx 8rpx rgba(0,0,0,.02);
  padding: 30rpx;
}

.notes-section .notes-list .note-card .note-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.notes-section .notes-list .note-card .note-header .habit-name {
  background: rgba(0,0,0,.05);
  border-radius: 12rpx;
  font-size: 28rpx;
  font-weight: 500;
  padding: 8rpx 16rpx;
}

.notes-section .notes-list .note-card .note-header .note-date {
  color: #5c6b7a;
  font-size: 24rpx;
}

.notes-section .notes-list .note-card .note-content {
  color: #2c3e50;
  font-size: 28rpx;
  line-height: 1.5;
}

.notes-section .empty-notes {
  align-items: center;
  background: #f5f7fa;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0,0,0,.05),0 2rpx 8rpx rgba(0,0,0,.02);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60rpx 0;
}

.notes-section .empty-notes .empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.notes-section .empty-notes .empty-message {
  color: #5c6b7a;
  font-size: 28rpx;
}
</style>