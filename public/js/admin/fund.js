function fundManagement() {
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
        marketIndices: [],
        funds: [],
        currentPage: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
        isSyncing: false,

        init() {
            this.loadMarketData();
            this.loadFunds();
            // 每5分钟自动刷新一次数据
            setInterval(() => {
                this.loadMarketData();
            }, 5 * 60 * 1000);
        },

        async loadMarketData() {
            try {
                const response = await fetch('/api/fund/market');
                if (!response.ok) throw new Error('加载市场数据失败');
                const data = await response.json();
                if (data.indices && Array.isArray(data.indices)) {
                    this.marketIndices = data.indices;
                }
            } catch (error) {
                console.error('加载市场数据失败:', error);
                Alpine.store('notification').show('加载市场数据失败: ' + error.message, 'error');
            }
        },

        async loadFunds() {
            try {
                const response = await fetch(`/api/fund/list?page=${this.currentPage}&limit=${this.pageSize}`);
                if (!response.ok) throw new Error('加载基金列表失败');
                const data = await response.json();
                if (data.funds && Array.isArray(data.funds)) {
                    this.funds = data.funds;
                    this.total = data.total || 0;
                    this.totalPages = Math.max(1, Math.ceil(this.total / this.pageSize));
                }
            } catch (error) {
                console.error('加载基金列表失败:', error);
                Alpine.store('notification').show('加载基金列表失败: ' + error.message, 'error');
            }
        },

        async syncData() {
            if (this.isSyncing) return;
            
            this.isSyncing = true;
            try {
                const response = await fetch('/api/fund/sync', {
                    method: 'POST'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '同步数据失败');
                }

                await this.loadMarketData();
                await this.loadFunds();
                Alpine.store('notification').show('数据同步成功', 'success');
            } catch (error) {
                console.error('同步数据失败:', error);
                Alpine.store('notification').show(error.message || '同步数据失败', 'error');
            } finally {
                this.isSyncing = false;
            }
        },

        async changePage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            await this.loadFunds();
        },

        formatDate(timestamp) {
            if (!timestamp) return '';
            try {
                return new Date(timestamp).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return timestamp;
            }
        },

        formatChange(change) {
            if (!change && change !== 0) return '0.00';
            return (change > 0 ? '+' : '') + Number(change).toFixed(2);
        },

        formatGrowth(growth) {
            if (!growth && growth !== 0) return '0.00%';
            return (growth > 0 ? '+' : '') + Number(growth).toFixed(2) + '%';
        },

        getGrowthClass(growth) {
            if (!growth && growth !== 0) return 'text-gray-600 dark:text-gray-400';
            if (growth > 0) {
                return 'text-red-600 dark:text-red-400';
            } else if (growth < 0) {
                return 'text-green-600 dark:text-green-400';
            }
            return 'text-gray-600 dark:text-gray-400';
        }
    };
} 