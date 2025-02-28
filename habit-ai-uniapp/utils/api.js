// utils/api.js
const baseURL = 'http://123.56.229.52:9001';
// const baseURL = 'https://www.tempoai.top'

// Export the request function
export function request(options) {
    return new Promise((resolve, reject) => {
        // 获取 token
        const token = uni.getStorageSync('token');
        
        uni.request({
            url: baseURL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                ...options.header
            },
            success: (res) => {
                console.log(`[API Request] ${options.url} - ${options.method}`, options.data);
                
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                } else {
                    console.error(`[API Response] ${options.url} - Failed:`, res);
                    reject(res.data || { message: '请求失败' });
                }
            },
            fail: (err) => {
                console.log(`[API Request] ${options.url} - ${options.method}`, options.data);
                console.error(`[API Response] ${options.url} - Error:`, err);
                reject(err || { message: '网络错误' });
            }
        });
    });
}
// Mock API 服务，确保所有请求都返回成功
export const apiService = {
    register(userData) {
        return request({
            url: '/habit-ai/user/register',
            method: 'POST',
            data: userData
        });
    },
    
    login(loginData) {
        return request({
            url: '/habit-ai/user/login',
            method: 'POST',
            data: loginData
        });
    },
    
    getUserInfo() {
        return request({
            url: '/habit-ai/user/info',
            method: 'GET'
        });
    },
    
    updateUserInfo(userData) {
        return request({
            url: '/habit-ai/user/update',
            method: 'PUT',
            data: userData
        });
    },
    
    createHabit(habitData) {
        return request({
            url: '/habit-ai/habit/create',
            method: 'POST',
            data: habitData
        });
    },
    
    getHabitInfo(habitId) {
        return request({
            url: `/habit-ai/habit/info?habit_id=${habitId}`,
            method: 'GET'
        });
    },
    
    updateHabit(habit_id, habitData) {
        return request({
            url: '/habit-ai/habit/update',
            method: 'PUT',
            data: { habit_id, ...habitData }
        });
    },
    
    deleteHabit(habitId) {
        return request({
            url: '/habit-ai/habit/delete',
            method: 'DELETE',
            data: { habit_id: habitId }
        });
    },
    
    recordHabit(habitId) {
        return request({
            url: '/habit-ai/habit/checkin',
            method: 'POST',
            data: { habit_id: habitId }
        });
    },
    
    getHabitStreak(habitId) {
        return request({
            url: `/habit-ai/habit/streak?habit_id=${habitId}`,
            method: 'GET'
        });
    },
    
    getHabitList() {
        return request({
            url: '/habit-ai/habit/list',
            method: 'GET'
        });
    },

    getAICharacterList() {
        return request({
            url: '/habit-ai/character/list',
            method: 'GET'
        });
    },

    getLastMessage() {
        return request({
            url: `/habit-ai/message/last`,
            method: 'GET'
        });
    },
    
    getNewMessage() {
        return request({
            url: '/habit-ai/message/new',
            method: 'GET',
        });
    },

    feedback(params) {
        return request({
            url: '/habit-ai/feedback',
            method: 'POST',
            data: params
        });
    }
};

// 移除示例接口
export const getData = (params) => {
    return request({ url: '/data', method: 'GET', data: params });
};

export const postData = (data) => {
    return request({ url: '/data', method: 'POST', data });
};