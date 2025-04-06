function loginManagement() {
    return {
        form: {
            username: '',
            password: '',
            remember: false
        },
        loading: false,
        error: '',
        showChangePasswordModal: false,
        passwordForm: {
            oldPassword: '',
            newPassword: '',
            confirmPassword: ''
        },
        passwordLoading: false,
        passwordError: '',

        init() {
            // 从localStorage读取上次保存的用户名
            const savedUsername = localStorage.getItem('saved_username');
            if (savedUsername) {
                this.form.username = savedUsername;
                this.form.remember = true;
            }
        },

        async submitForm() {
            this.loading = true;
            this.error = '';

            try {
                const response = await fetch('/admin/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.form)
                });

                const data = await response.json();
                console.log('Login response:', data);

                if (!response.ok) {
                    throw new Error(data.error || '登录失败');
                }

                if (data.code !== 0) {
                    throw new Error(data.message || '登录失败');
                }

                const { token, user } = data.data;

                // 根据记住我选项保存或清除用户名
                if (this.form.remember) {
                    localStorage.setItem('saved_username', this.form.username);
                } else {
                    localStorage.removeItem('saved_username');
                }

                // 保存 token 和用户信息到 localStorage
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));

                // 检查是否需要修改密码
                if (user.has_changed_pwd === false) {
                    this.showChangePasswordModal = true;
                    this.passwordForm.oldPassword = this.form.password;
                } else {
                    window.location.href = '/admin';
                }
            } catch (error) {
                this.error = error.message;
            } finally {
                this.loading = false;
            }
        },

        async changePassword() {
            if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
                this.passwordError = '两次输入的密码不一致';
                return;
            }

            if (this.passwordForm.newPassword.length < 6) {
                this.passwordError = '新密码长度不能小于6位';
                return;
            }

            this.passwordLoading = true;
            this.passwordError = '';

            try {
                const response = await fetch('/admin/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: this.form.username,
                        old_password: this.passwordForm.oldPassword,
                        new_password: this.passwordForm.newPassword
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || '修改密码失败');
                }

                if (data.code !== 0) {
                    throw new Error(data.message || '修改密码失败');
                }

                // 密码修改成功，重定向到首页
                window.location.href = '/admin';
            } catch (error) {
                this.passwordError = error.message;
            } finally {
                this.passwordLoading = false;
            }
        }
    }
}