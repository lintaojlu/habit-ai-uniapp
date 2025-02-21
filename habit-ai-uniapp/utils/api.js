// utils/api.js
const baseURL = 'http://123.56.229.52:8000';

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
                if (res.statusCode === 401) {
                    // token 失效，跳转登录页
                    uni.redirectTo({
                        url: '/pages/login/login'
                    });
                    reject(new Error('登录失败，请重新登录'));
                    return;
                }
                
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                } else {
                    console.error('API request failed:', res);
                    reject(res.data || { message: '请求失败' });
                }
            },
            fail: (err) => {
                reject(err || { message: '网络错误' });
            }
        });
    });
}
// Mock API 服务，确保所有请求都返回成功
export const apiService = {
    register(userData) {
        return Promise.resolve({
            status: "success",
            user_id: "mock_user_id",
            token: "mock_token"
        });
    },
    
    login(loginData) {
        return Promise.resolve({
            status: "success",
            user_id: "mock_user_id",
            token: "mock_token"
        });
    },
    
    getUserInfo() {
        return Promise.resolve({
            status: "success",
            data: {
                user_id: "mock_user_id",
                nickname: "Mock User",
                avatar_url: "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0",
                wechat_openid: "mock_openid",
                ai_character_name: "毒舌",
                telephone: "1234567890",
                created_at: "2023-09-01T00:00:00Z",
                updated_at: "2023-09-02T00:00:00Z",
                registration_code: "mock_code"
            }
        });
    },
    
    updateUserInfo(userData) {
        return Promise.resolve({
            status: "success",
            message: "用户数据已更新"
        });
    },
    
    createHabit(habitData) {
        return Promise.resolve({
            status: "success",
            habit_id: "mock_habit_id"
        });
    },
    
    getHabitInfo(habitId) {
        return Promise.resolve({
            status: "success",
            data: {
                habit_id: habitId,
                title: "Mock Habit",
                icon: "🏃",
                description: "Mock Description",
                alert_time: { days: [1, 3, 5], time: ["07:00"] },
                deadline: "2025-12-31T00:00:00Z",
                completed: ["2025-02-18T07:00:00Z"],
                streak: { current: 1, longest: 5, longest_start: "2025-02-13T00:00:00Z", longest_end: "2025-02-17T00:00:00Z" },
                is_archived: false,
                order: 0
            }
        });
    },
    
    // TODO 修改了input和output，注意
    updateHabit(habit_id, habitData) {
        return Promise.resolve({
            status: "success",
            message: "习惯已更新"
        });
    },
    
    deleteHabit(habitId) {
        return Promise.resolve({
            status: "success",
            message: "习惯已删除"
        });
    },
    
    recordHabit(habitId) {
        return Promise.resolve({
            status: "success",
            data: {
                habit_id: habitId,
                completed: ["2025-02-18T07:00:00Z", "2025-02-20T07:00:00Z", "2025-02-21T07:00:00Z"],
                streak: { current: 3, longest: 3, longest_start: "2025-02-18T00:00:00Z", longest_end: "2025-02-20T00:00:00Z" },
                message: {
                    emoji: "🎉",
                    content: "打卡成功"
                }
            }
        });
    },
    
    getHabitStreak(habitId) {
        return Promise.resolve({
            status: "success",
            data: {
                habit_id: habitId,
                streak: { current: 2, longest: 5, longest_start: "2025-02-13T00:00:00Z", longest_end: "2025-02-17T00:00:00Z" }
            }
        });
    },
    
    getHabitList() {
        return Promise.resolve({
            status: "success",
            data: [
                {
                    habit_id: "mock_habit_id_1",
                    title: "Mock Habit 1",
                    icon: "🏃",
                    description: "Mock Description 1",
                    alert_time: { days: [1, 3, 5], time: ["07:00"] },
                    deadline: "2025-12-31T00:00:00Z",
                    completed: ["2025-02-18T07:00:00Z"],
                    streak: { current: 1, longest: 5, longest_start: "2025-02-13T00:00:00Z", longest_end: "2025-02-17T00:00:00Z" },
                    is_archived: false,
                    order: 0
                },
                {
                    habit_id: "mock_habit_id_2",
                    title: "Mock Habit 2",
                    icon: "🍔",
                    description: "Mock Description 2",
                    alert_time: { days: [2, 4], time: ["12:00"] },
                    deadline: "2025-12-31T00:00:00Z",
                    completed: ["2025-02-18T12:00:00Z"],
                    streak: { current: 2, longest: 5, longest_start: "2025-02-13T00:00:00Z", longest_end: "2025-02-17T00:00:00Z" },
                    is_archived: false,
                    order: 1
                }
            ]
        });
    },

    getAICharacterList() {
        return Promise.resolve({
            status: "success",
            data: [
                {
                    character_id: "mock_character_id_1",
                    name: "Mock Character 1",
                    description: "Mock Description 1",
                    icon: "🐶"
                },
                {
                    character_id: "mock_character_id_2",
                    name: "Mock Character 2",
                    description: "Mock Description 2",
                    icon: "🐱"
                }
            ]
        });
    },
    
    getMemoryList(params = {}) {
        return Promise.resolve({
            status: "success",
            data: []
        });
    },
    
    getAISuggestion() {
        return Promise.resolve({
            status: "success",
            data: {
                emoji: "😥",
                suggestion: "你再不打卡我花都谢了"
            }
        });
    },
    
    sendConversation(content, sessionId = '') {
        return Promise.resolve({
            status: "success",
            data: {
                session_id: sessionId || "mock_session_id",
                reply: "这是一个测试回复，模拟 AI 的建议。"
            }
        });
    },

    feedback(params) {
        return Promise.resolve({
            status: "success",
            message: "反馈已提交"
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