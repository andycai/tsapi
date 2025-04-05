// SVN management functionality
function svnManagement() {
    return {
        repositories: [],
        showCheckoutModal: false,
        showCommitModal: false,
        showDetailsModal: false,
        detailsTitle: '',
        detailsContent: '',
        currentRepo: null,
        checkoutForm: {
            url: '',
            path: '',
            username: '',
            password: ''
        },
        commitForm: {
            message: ''
        },
        init() {
            this.fetchRepositories();
        },
        async fetchRepositories() {
            try {
                const response = await fetch('/api/svn/status');
                if (!response.ok) throw new Error('获取仓库列表失败');
                const data = await response.json();
                this.repositories = data.repositories;
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        checkoutRepository() {
            this.checkoutForm = {
                url: '',
                path: '',
                username: '',
                password: ''
            };
            this.showCheckoutModal = true;
        },
        async submitCheckout() {
            try {
                const response = await fetch('/api/svn/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.checkoutForm)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '检出失败');
                }

                Alpine.store('notification').show('仓库检出成功', 'success');
                this.showCheckoutModal = false;
                this.fetchRepositories();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        async updateRepository(repo) {
            try {
                const response = await fetch('/api/svn/update', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: repo.path })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '更新失败');
                }

                Alpine.store('notification').show('仓库更新成功', 'success');
                this.fetchRepositories();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        async viewStatus(repo) {
            try {
                const response = await fetch(`/api/svn/status?path=${encodeURIComponent(repo.path)}`);
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '获取状态失败');
                }

                const data = await response.json();
                this.detailsTitle = '仓库状态';
                this.detailsContent = data.status;
                this.showDetailsModal = true;
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        async viewLog(repo) {
            try {
                const response = await fetch(`/api/svn/log?path=${encodeURIComponent(repo.path)}&limit=10`);
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '获取日志失败');
                }

                const data = await response.json();
                this.detailsTitle = '提交日志';
                this.detailsContent = data.log;
                this.showDetailsModal = true;
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        commitChanges(repo) {
            this.currentRepo = repo;
            this.commitForm.message = '';
            this.showCommitModal = true;
        },
        async submitCommit() {
            try {
                const response = await fetch('/api/svn/commit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: this.currentRepo.path,
                        message: this.commitForm.message
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '提交失败');
                }

                Alpine.store('notification').show('更改提交成功', 'success');
                this.showCommitModal = false;
                this.fetchRepositories();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        async revertChanges(repo) {
            if (!confirm('确定要还原所有更改吗？此操作无法撤销。')) {
                return;
            }

            try {
                const response = await fetch('/api/svn/revert', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ path: repo.path })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '还原失败');
                }

                Alpine.store('notification').show('更改还原成功', 'success');
                this.fetchRepositories();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        getStatusText(status) {
            switch (status) {
                case 'clean':
                    return '干净';
                case 'modified':
                    return '已修改';
                case 'conflict':
                    return '冲突';
                default:
                    return '未知';
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