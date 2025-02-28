<template>
  <view class="container">
    <view class="header">
      <view class="back-button" @tap="goBack">
      </view>
      <text class="title">注册账号</text>
    </view>

    <view class="avatar-section">
      <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <image class="avatar" :src="userInfo.avatar_url || defaultavatar_url" mode="aspectFill"/>
        <text class="tip">点击选择头像</text>
      </button>
    </view>

    <view class="form-section">
      <view class="input-group">
        <text class="label">昵称</text>
        <input
            type="nickname"
            class="input-field"
            placeholder="请输入昵称"
            @change="onnicknameChange"
            v-model="userInfo.nickname"
        />
      </view>

      <view class="input-group">
        <text class="label">手机号</text>
        <input
            class="input-field"
            type="number"
            v-model="phone"
            placeholder="请输入手机号"
            maxlength="11"
        />
      </view>

      <view class="input-group">
        <text class="label">密码</text>
        <input
            class="input-field"
            type="password"
            v-model="password"
            placeholder="请设置密码"
            maxlength="20"
        />
      </view>

      <view class="input-group">
        <text class="label">选择AI角色</text>
        <view class="character-list">
          <view
            v-for="character in aiCharacters"
            :key="character.character_id"
            class="character-item"

            :class="{ 'character-item-active': selectedCharacterId === character.character_id }"
            @tap="selectCharacter(character)"
          >
            <text class="character-icon">{{ character.icon }}</text>
            <view class="character-info">
              <text class="character-name">{{ character.name }}</text>
              <text class="character-desc">{{ character.description }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="input-group">
        <text class="label">内测码</text>
        <input
            class="input-field"
            type="text"
            v-model="betaCode"
            placeholder="请输入内测码"
        />
      </view>
    </view>

    <button class="submit-button" @tap="handleRegister">注册</button>
  </view>
</template>

<script>
import { apiService } from '@/utils/api.js'

const defaultavatar_url = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

export default {
  data() {
    return {
      defaultavatar_url,
      userInfo: {
        avatar_url: '',
        nickname: '',
        openId: ''
      },
      phone: '',
      password: '',
      betaCode: '',
      aiCharacters: [], // 添加 AI 角色列表
      selectedCharacterId: '', // 添加选中的角色 ID
      ai_character_name: '' // 修改默认值为空字符串
    }
  },
  
  // 添加 created 生命周期钩子
  created() {
    this.loadAICharacters()
  },

  methods: {
    goBack() {
      uni.navigateBack()
    },
    getUserProfile() {
      // 使用微信小程序原生的用户信息接口
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          this.userInfo = {
            avatar_url: res.userInfo.avatar_url,
            nickname: res.userInfo.nickname
          }

          uni.showToast({
            title: '授权成功',
            icon: 'success'
          })
        },
        fail: (err) => {
          console.error('获取用户信息失败：', err)
          uni.showToast({
            title: '获取信息失败',
            icon: 'none'
          })
        }
      })
    },

    onnicknameChange(e) {
      this.userInfo.nickname = e.detail.value
    },

    // 添加选择角色的方法
    selectRole(value) {
      this.ai_character_name = value
    },

    async loadAICharacters() {
      try {
        const response = await apiService.getAICharacterList()
        if (response.status === 'success') {
          console.log('AI 角色列表:', response.data)
          this.aiCharacters = response.data
          // 默认选中第一个角色
          if (this.aiCharacters.length > 0) {
            this.selectCharacter(this.aiCharacters[0])
          }
        }
        // save to local storage
        uni.setStorageSync('aiCharacters', response.data)
      } catch (error) {
        console.error('加载 AI 角色失败:', error)
        uni.showToast({
          title: '加载角色失败',
          icon: 'none'
        })
      }
    },

    selectCharacter(character) {
      this.selectedCharacterId = character.character_id
      this.ai_character_name = character.name
    },

    async onChooseAvatar(e) {
      // 微信返回的是 avatarUrl，我们需要转换为 avatar_url
      const { avatarUrl } = e.detail
      // 直接设置头像 URL
      this.userInfo.avatar_url = avatarUrl
      console.log('选择的头像 URL:', avatarUrl)
    
      try {
        // TODO 获取微信 openid 的代码保持不变 ...
    
        uni.showToast({
          title: '头像设置成功',
          icon: 'success'
        })
      } catch (error) {
        console.error('获取 openid 失败：', error)
        uni.showToast({
          title: '头像设置成功',
          icon: 'success'
        })
      }
    },

    async handleRegister() {
      // 表单验证
      if (!this.userInfo.nickname) {
        uni.showToast({
          title: '请输入昵称',
          icon: 'none'
        })
        return
      }
    
      if (!this.phone) {
        uni.showToast({
          title: '请输入手机号',
          icon: 'none'
        })
        return
      }
    
      // 验证手机号格式
      const phoneReg = /^1[3-9]\d{9}$/
      if (!phoneReg.test(this.phone)) {
        uni.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        })
        return
      }
    
      if (!this.password) {
        uni.showToast({
          title: '请设置密码',
          icon: 'none'
        })
        return
      }
    
      if (!this.selectedCharacterId) {
        uni.showToast({
          title: '请选择AI角色',
          icon: 'none'
        })
        return
      }

      if (!this.betaCode) {
        uni.showToast({
          title: '请输入内测码',
          icon: 'none'
        })
        return
      } 
    
      uni.showLoading({
        title: '注册中...'
      })
    
      try {
        console.log('注册参数:', {
          telephone: this.phone,
          password: this.password,
          nickname: this.userInfo.nickname,
          avatar_url: this.userInfo.avatar_url,
          wechat_openid: this.userInfo.openId,
          registration_code: this.betaCode,
          ai_character_name: this.ai_character_name
        })
    
        const res = await apiService.register({
          telephone: this.phone,
          password: this.password,
          nickname: this.userInfo.nickname,
          avatar_url: this.userInfo.avatar_url,
          wechat_openid: this.userInfo.openId,
          registration_code: this.betaCode,
          ai_character_name: this.ai_character_name
        })
    
        console.log('注册响应:', res)
    
        if (res.status === 'success') {
          // 清空本地存储
          uni.clearStorageSync();

          // 保存用户信息
          this.userInfo.openId = res.openid
          this.userInfo.nickname = this.userInfo.nickname
          this.userInfo.avatar_url = this.userInfo.avatar_url
          this.userInfo.ai_character_name = this.ai_character_name
          uni.setStorageSync('userInfo', this.userInfo)

          // 保存 token 和用户 ID
          uni.setStorageSync('telephone', this.phone)
          uni.setStorageSync('password', this.password)
          uni.setStorageSync('token', res.token)
    
          uni.showToast({
            title: '注册成功',
            icon: 'success'
          })
    
          setTimeout(() => {
            // 在注册成功后的处理逻辑中
            uni.redirectTo({
              url: '/pages/guide/guide'
            })
          }, 1500)
        } else {
          throw new Error(res.message || '注册失败')
        }
      } catch (error) {
        console.error('注册失败:', error)
        uni.showToast({
          title: error.message || '注册失败',
          icon: 'none'
        })
      } finally {
        uni.hideLoading()
      }
    }
  }
}
</script>

<style>
.container {
  padding: 40rpx;
  min-height: 100vh;
  background-color: #fff;
}

.header {
  display: flex;
  align-items: center;
  margin-bottom: 60rpx;
  position: relative;
}

.back-button {
  position: absolute;
  left: 0;
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 40rpx;
  color: #2c3e50;
}

.title {
  width: 100%;
  text-align: center;
  font-size: 36rpx;
  font-weight: 600;
  color: #2c3e50;
}

.avatar-section {
  display: flex;
  justify-content: center;
}

.avatar-wrapper {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  width: 200rpx; /* 减小头像容器大小 */
  height: 280rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper:after {
  border: none;
}

.avatar {
  width: 200rpx; /* 减小头像大小 */
  height: 200rpx;
  border-radius: 50%;
}

/* 添加提示文字样式 */
.tip {
  display: block; /* 移除 display: none */
  font-size: 24rpx;
  color: #5c6b7a;
  margin-top: 16rpx;
}

/* 移除不需要的样式 */
.nickname-wrapper,
.nickname-label,
.nickname-input {
  display: none;
}

.nickname-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  margin-top: 20rpx;
}

.nickname-label {
  font-size: 28rpx;
  color: #5c6b7a;
}

.nickname-input {
  width: 300rpx;
  height: 80rpx;
  background: #f5f7fa;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 32rpx;
  color: #2c3e50;
  text-align: center;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
  margin-bottom: 60rpx;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.label {
  font-size: 28rpx;
  color: #5c6b7a;
}

.input-field {
  height: 100rpx;
  background: #f5f7fa;
  border-radius: 20rpx;
  padding: 0 30rpx;
  font-size: 32rpx;
  color: #2c3e50;
}

.submit-button {
  width: 100%;
  height: 100rpx;
  background: var(--theme-color);
  border-radius: 20rpx;
  color: #fff;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-button:active {
  opacity: 0.9;
}

.radio-group {
  display: flex;
  gap: 20rpx;
  flex-wrap: wrap;
}

.radio-item {
  padding: 20rpx 40rpx;
  background: #f5f7fa;
  border-radius: 20rpx;
  font-size: 28rpx;
  color: #2c3e50;
}

.radio-item-active {
  background: var(--theme-color);
  color: #fff;
}

.character-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.character-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background: #f5f7fa;
  border-radius: 20rpx;
  gap: 20rpx;
}

.character-item-active {
  background: var(--theme-color);
}

.character-item-active .character-name,
.character-item-active .character-desc {
  color: #ffffff;
}

.character-icon {
  font-size: 48rpx;
}

.character-info {
  flex: 1;
}

.character-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8rpx;
}

.character-desc {
  font-size: 26rpx;
  color: #5c6b7a;
}

/* 移除旧的 radio-group 相关样式 */
</style>