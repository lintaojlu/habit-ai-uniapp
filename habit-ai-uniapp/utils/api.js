// utils/api.js
const baseURL = 'https://api.example.com';

function request(options) {
    return new Promise((resolve, reject) => {
        uni.request({
            url: baseURL + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                'Content-Type': 'application/json',
                'Authorization': uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : '',
                ...options.header
            },
            success: (res) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(res.data);
                } else {
                    reject(res.data);
                }
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

// 示例接口封装
export const getData = (params) => {
    return request({ url: '/data', method: 'GET', data: params });
};

export const postData = (data) => {
    return request({ url: '/data', method: 'POST', data });
};