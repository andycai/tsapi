// User management functionality
function userManagement() {
    return {
        users: [],
        roles: [],
        showCreateModal: false,
        showEditModal: false,
        editMode: false,
        currentUser: null,
        form: {
            username: '',
            password: '',
            nickname: '',
            role_id: '',
            status: 1
        },
        loading: false,
        init() {
            this.fetchUsers();
            this.fetchRoles();
        },
        async fetchUsers() {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) throw new Error('获取用户列表失败');
                this.users = await response.json();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        async fetchRoles() {
            try {
                const response = await fetch('/api/roles');
                if (!response.ok) throw new Error('获取角色列表失败');
                this.roles = await response.json();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        createUser() {
            this.editMode = false;
            this.form = {
                username: '',
                password: '',
                nickname: '',
                role_id: '',
                status: 1
            };
            this.showCreateModal = true;
        },
        editUser(user) {
            this.editMode = true;
            this.currentUser = user;
            this.form = {
                username: user.username,
                nickname: user.nickname,
                role_id: user.role_id,
                status: user.status,
                password: ''
            };
            this.showEditModal = true;
        },
        closeModal() {
            this.showCreateModal = false;
            this.showEditModal = false;
            this.form = {
                username: '',
                password: '',
                nickname: '',
                role_id: '',
                status: 1
            };
        },
        async submitForm() {
            if (this.loading) return;
            this.loading = true;

            try {
                const url = this.editMode ? `/api/users/${this.currentUser.id}` : '/api/users';
                const method = this.editMode ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.form)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '操作失败');
                }

                Alpine.store('notification').show(
                    this.editMode ? '用户更新成功' : '用户创建成功',
                    'success'
                );
                this.closeModal();
                this.fetchUsers();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            } finally {
                this.loading = false;
            }
        },
        async deleteUser(id) {
            if (!confirm('确定要删除这个用户吗？')) return;

            try {
                const response = await fetch(`/api/users/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }

                Alpine.store('notification').show('用户删除成功', 'success');
                this.fetchUsers();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        formatDate(date) {
            if (!date) return '';
            return new Date(date).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
        }
    }
} 