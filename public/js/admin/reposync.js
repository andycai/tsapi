function reposyncManagement() {
    window.Alpine = window.Alpine || {};
    if (!Alpine.store('notification')) {
        Alpine.store('notification', {
            show: (message, type) => {
                console.error(message);
            },
            after: () => {}
        });
    }
    return {
        config: {
            repo_type1: 'svn',
            repo_url1: '',
            local_path1: '',
            username1: '',
            password1: '',
            repo_type2: 'svn',
            repo_url2: '',
            local_path2: '',
            username2: '',
            password2: ''
        },
        commits: [],
        selectedCommits: [],
        selectAll: false,
        currentPage: 1,
        pageSize: 10,
        totalRecords: 0,
        totalPages: 1,
        refreshLimit: 100,

        init() {
            this.loadConfig();
            this.loadCommits();
        },

        async loadConfig() {
            try {
                const response = await fetch('/api/reposync/config');
                if (!response.ok) throw new Error('加载配置失败');
                const data = await response.json();
                if (data) {
                    this.config = data;
                }
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async saveConfig() {
            try {
                const response = await fetch('/api/reposync/config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.config)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '保存配置失败');
                }

                Alpine.store('notification').show('配置保存成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async checkoutRepos() {
            try {
                const response = await fetch('/api/reposync/checkout', {
                    method: 'POST'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '检出仓库失败');
                }

                await this.loadCommits();
                Alpine.store('notification').show('仓库检出成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async loadCommits() {
            try {
                const response = await fetch(`/api/reposync/commits?page=${this.currentPage}&pageSize=${this.pageSize}`);
                if (!response.ok) throw new Error('加载提交记录失败');
                const data = await response.json();
                this.commits = data.commits;
                this.totalRecords = data.total;
                this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
                this.selectedCommits = [];
                this.selectAll = false;
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async changePage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            await this.loadCommits();
        },

        toggleSelectAll() {
            this.selectAll = !this.selectAll;
            this.selectedCommits = this.selectAll ? this.commits.filter(commit => !commit.synced).map(commit => commit.revision) : [];
        },

        toggleSelect(revision) {
            const index = this.selectedCommits.indexOf(revision);
            if (index === -1) {
                this.selectedCommits.push(revision);
            } else {
                this.selectedCommits.splice(index, 1);
            }
            this.selectAll = this.selectedCommits.length === this.commits.filter(commit => !commit.synced).length;
        },

        async syncSelectedCommits() {
            if (this.selectedCommits.length === 0) {
                Alpine.store('notification').show('请选择要同步的提交记录', 'error');
                return;
            }

            try {
                // 对版本号进行排序（从小到大）
                const sortedRevisions = [...this.selectedCommits].sort((a, b) => {
                    // 如果是数字版本号，按数字大小排序
                    const numA = parseInt(a);
                    const numB = parseInt(b);
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return numA - numB;
                    }
                    // 如果不是数字，按字符串排序
                    return a.localeCompare(b);
                });

                const response = await fetch('/api/reposync/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ revisions: sortedRevisions })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '批量同步失败');
                }

                await this.loadCommits();
                Alpine.store('notification').show('批量同步成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async syncCommit(revision) {
            try {
                const response = await fetch('/api/reposync/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ revisions: [revision] })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '同步失败');
                }

                await this.loadCommits();
                Alpine.store('notification').show('同步成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        formatDate(timestamp) {
            if (!timestamp) return '';
            return new Date(timestamp).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        getChangeTypeText(changeType) {
            const types = {
                'A': '新增',
                'M': '修改',
                'D': '删除'
            };
            return types[changeType] || changeType;
        },

        async refreshCommits() {
            try {
                const response = await fetch('/api/reposync/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ limit: this.refreshLimit })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '刷新提交记录失败');
                }

                await this.loadCommits();
                Alpine.store('notification').show('刷新提交记录成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async clearSyncData() {
            if (!confirm('确定要清空所有同步数据吗？此操作不可恢复！')) {
                return;
            }

            try {
                const response = await fetch('/api/reposync/clear', {
                    method: 'POST'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '清空数据失败');
                }

                await this.loadCommits();
                Alpine.store('notification').show('清空数据成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        }
    };
}