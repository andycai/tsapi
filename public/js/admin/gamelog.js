// Game logs management functionality
function gameLogManagement() {
    return {
        logs: [],
        total: 0,
        currentPage: 1,
        pageSize: 50,
        showModal: false,
        currentLog: null,
        currentLogIndex: -1,
        filters: {
            startDate: '',
            endDate: '',
            search: '',
            type: ''
        },

        init() {
            this.fetchLogs();
            this.initDateRange();
            this.watchFilters();
        },

        initDateRange() {
            // 默认显示最近7天的日志
            const end = new Date();
            const start = new Date();
            start.setDate(start.getDate() - 7);
            
            this.filters.startDate = start.toISOString().split('T')[0];
            this.filters.endDate = end.toISOString().split('T')[0];
        },

        async fetchLogs() {
            try {
                const params = new URLSearchParams({
                    page: this.currentPage,
                    pageSize: this.pageSize,
                    ...this.filters
                });

                const response = await fetch(`/api/gamelog?${params}`);
                if (!response.ok) throw new Error('获取日志列表失败');
                const data = await response.json();
                
                this.logs = data.logs;
                this.total = data.total;
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        viewDetails(log) {
            this.currentLog = log;
            this.currentLogIndex = this.logs.findIndex(l => l.id === log.id);
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.currentLog = null;
            this.currentLogIndex = -1;
        },

        hasPreviousLog() {
            return this.currentLogIndex > 0;
        },

        hasNextLog() {
            return this.currentLogIndex < this.logs.length - 1;
        },

        previousLog() {
            if (this.hasPreviousLog()) {
                this.currentLogIndex--;
                this.currentLog = this.logs[this.currentLogIndex];
            }
        },

        nextLog() {
            if (this.hasNextLog()) {
                this.currentLogIndex++;
                this.currentLog = this.logs[this.currentLogIndex];
            }
        },

        async deleteLog(id) {
            if (!confirm('确定要删除这条日志记录吗？')) return;

            try {
                const response = await fetch(`/api/gamelog/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }

                Alpine.store('notification').show('日志记录删除成功', 'success');
                this.fetchLogs();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async clearOldData() {
            if (!confirm('确定要清理旧日志数据吗？此操作不可恢复。')) return;

            try {
                const response = await fetch(`/api/gamelog/before?date=${this.filters.endDate}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '清理失败');
                }

                Alpine.store('notification').show('旧日志清理成功', 'success');
                this.fetchLogs();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        refreshData() {
            this.fetchLogs();
        },

        previousPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
                this.fetchLogs();
            }
        },

        nextPage() {
            if (this.currentPage * this.pageSize < this.total) {
                this.currentPage++;
                this.fetchLogs();
            }
        },

        formatDateTime(timestamp) {
            if (!timestamp) return '';
            const date = new Date(timestamp);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },

        formatStack(stack) {
            if (!stack) return '';
            return stack.replace(/\\n/g, '\n').replace(/\\t/g, '    ');
        },

        watchFilters() {
            this.$watch('filters', () => {
                this.fetchLogs();
            });
        }
    }
} 