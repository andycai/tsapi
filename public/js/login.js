function loginManagement() {
    return {
        username: '',
        password: '',
        remember: false,
        errorMessage: '',
        successMessage: '',
        loading: false,

        async login() {
            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';

            try {
                // 记录发送到服务器的数据
                const requestData = {
                    username: this.username,
                    password: this.password,
                    remember: this.remember
                };
                console.log('发送到服务器的数据:', requestData);
                
                const response = await fetch('/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });

                console.log('服务器响应状态:', response.status);
                console.log('响应头:', [...response.headers.entries()]);
                
                // 检查内容类型
                const contentType = response.headers.get('content-type');
                let data;
                
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    // 处理非JSON响应
                    const text = await response.text();
                    console.log('服务器返回的非JSON响应:', text);
                    data = { message: text || '服务器返回了非JSON响应' };
                }

                console.log('解析后的响应数据:', data);

                if (!response.ok) {
                    this.errorMessage = data.message || '登录失败，请检查您的凭据';
                    return;
                }

                const { token, user } = data.data;

                // 根据记住我选项保存或清除用户名
                if (this.remember) {
                    localStorage.setItem('saved_username', this.username);
                } else {
                    localStorage.removeItem('saved_username');
                }

                // 保存 token 和用户信息到 localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                this.successMessage = '登录成功！正在跳转...';

                setTimeout(() => {
                    window.location.href = '/admin';
                }, 1000);

            } catch (error) {
                console.error('登录失败:', error);
                this.errorMessage = '登录过程中发生错误，请稍后再试';
            } finally {
                this.loading = false;
            }
        }
    }
}
