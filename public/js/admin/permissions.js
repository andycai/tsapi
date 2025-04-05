// Permission management functionality
function permissionManagement() {
    return {
        permissions: [],
        showCreateModal: false,
        showEditModal: false,
        editMode: false,
        currentPermission: null,
        form: {
            name: '',
            code: '',
            description: ''
        },
        loading: false,
        init() {
            this.fetchPermissions();
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
        createPermission() {
            this.editMode = false;
            this.currentPermission = null;
            this.form = {
                name: '',
                code: '',
                description: ''
            };
            this.showCreateModal = true;
            this.showEditModal = false;
        },
        editPermission(permission) {
            this.editMode = true;
            this.currentPermission = permission;
            this.form = {
                name: permission.name,
                code: permission.code,
                description: permission.description
            };
            this.showEditModal = true;
            this.showCreateModal = false;
        },
        closeModal() {
            this.showCreateModal = false;
            this.showEditModal = false;
            this.editMode = false;
            this.currentPermission = null;
            this.form = {
                name: '',
                code: '',
                description: ''
            };
        },
        async submitForm() {
            if (this.loading) return;
            this.loading = true;

            try {
                const url = this.editMode ? `/api/permissions/${this.currentPermission.id}` : '/api/permissions';
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
                    this.editMode ? '权限更新成功' : '权限创建成功',
                    'success'
                );
                this.closeModal();
                this.fetchPermissions();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            } finally {
                this.loading = false;
            }
        },
        async deletePermission(id) {
            if (!confirm('确定要删除这个权限吗？')) return;

            try {
                const response = await fetch(`/api/permissions/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }

                Alpine.store('notification').show('权限删除成功', 'success');
                this.fetchPermissions();
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