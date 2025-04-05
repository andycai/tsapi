// Role management functionality
function roleManagement() {
    return {
        roles: [],
        permissions: [],
        showCreateModal: false,
        showEditModal: false,
        editMode: false,
        currentRole: null,
        form: {
            name: '',
            description: '',
            permissions: []
        },
        loading: false,
        init() {
            this.fetchRoles();
            this.fetchPermissions();
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
        async fetchPermissions() {
            try {
                const response = await fetch('/api/permissions');
                if (!response.ok) throw new Error('获取权限列表失败');
                this.permissions = await response.json();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        createRole() {
            this.editMode = false;
            this.currentRole = null;
            this.form = {
                name: '',
                description: '',
                permissions: []
            };
            this.showCreateModal = true;
            this.showEditModal = false;
        },
        editRole(role) {
            this.editMode = true;
            this.currentRole = role;
            this.form = {
                name: role.name,
                description: role.description,
                permissions: role.permissions.map(p => parseInt(p.id))
            };
            this.showEditModal = true;
            this.showCreateModal = false;
        },
        closeModal() {
            this.showCreateModal = false;
            this.showEditModal = false;
            this.editMode = false;
            this.currentRole = null;
            this.form = {
                name: '',
                description: '',
                permissions: []
            };
        },
        async submitForm() {
            if (this.loading) return;
            this.loading = true;

            try {
                const url = this.editMode ? `/api/roles/${this.currentRole.id}` : '/api/roles';
                const method = this.editMode ? 'PUT' : 'POST';
                // 确保权限 ID 都是整数
                const formData = {
                    ...this.form,
                    permissions: this.form.permissions.map(id => parseInt(id))
                };
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '操作失败');
                }

                Alpine.store('notification').show(
                    this.editMode ? '角色更新成功' : '角色创建成功',
                    'success'
                );
                this.closeModal();
                this.fetchRoles();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            } finally {
                this.loading = false;
            }
        },
        async deleteRole(id) {
            if (!confirm('确定要删除这个角色吗？')) return;

            try {
                const response = await fetch(`/api/roles/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }

                Alpine.store('notification').show('角色删除成功', 'success');
                this.fetchRoles();
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