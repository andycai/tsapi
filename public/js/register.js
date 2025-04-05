function registerManagement() {
    return {
        username: '',
        password: '',
        email: '',
        errorMessage: '',
        successMessage: '',
        loading: false,

        async register() {
            this.loading = true;
            this.errorMessage = '';
            this.successMessage = '';

            try {
                const response = await fetch('/auth/register', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: this.username,
                        password: this.password,
                        email: this.email || undefined
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    this.errorMessage = data.message || '注册失败，请检查您的输入';
                    return;
                }

                this.successMessage = '注册成功！即将跳转到登录页面...';

                // 重置表单
                this.username = '';
                this.password = '';
                this.email = '';

                // 延迟跳转
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);

            } catch (error) {
                console.error('注册失败:', error);
                this.errorMessage = '注册过程中发生错误，请稍后再试';
            } finally {
                this.loading = false;
            }
        }
    }
}