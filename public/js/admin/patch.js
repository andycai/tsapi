function patchManagement() {
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
            patch_path: '',
            zip_path: './data/patches',
            branch: 'trunk',
            platform: 'android',
            default_old_version: '',
            default_new_version: '',
            default_description: ''
        },
        records: [],
        currentPage: 1,
        pageSize: 10,
        totalRecords: 0,
        totalPages: 1,
        oldVersion: '',
        newVersion: '',
        description: '',

        init() {
            this.loadConfig();
            this.loadRecords();
        },

        async loadConfig() {
            try {
                const response = await fetch('/api/patch/config');
                if (!response.ok) throw new Error('加载配置失败');
                const data = await response.json();
                if (data) {
                    this.config = data;
                    
                    // 使用默认值初始化
                    if (this.config.default_old_version && !this.oldVersion) {
                        this.oldVersion = this.config.default_old_version;
                    }
                    if (this.config.default_new_version && !this.newVersion) {
                        this.newVersion = this.config.default_new_version;
                    }
                    if (this.config.default_description && !this.description) {
                        this.description = this.config.default_description;
                    }
                }
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async saveConfig() {
            try {
                this.config.default_new_version = this.newVersion;
                this.config.default_old_version = this.oldVersion;
                this.config.default_description = this.description;
                const response = await fetch('/api/patch/config', {
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

        async loadRecords() {
            try {
                const response = await fetch(`/api/patch/records?page=${this.currentPage}&limit=${this.pageSize}`);
                if (!response.ok) throw new Error('加载补丁记录失败');
                const data = await response.json();
                this.records = data.records;
                this.totalRecords = data.total;
                this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async changePage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currentPage = page;
            await this.loadRecords();
        },

        async generatePatch() {
            if (!this.oldVersion || !this.newVersion) {
                Alpine.store('notification').show('请输入版本号', 'error');
                return;
            }

            try {
                const response = await fetch('/api/patch/generate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        old_version: this.oldVersion,
                        new_version: this.newVersion,
                        description: this.description,
                        branch: this.config.branch,
                        platform: this.config.platform
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '生成补丁包失败');
                }

                await this.loadRecords();
                // this.oldVersion = '';
                // this.newVersion = '';
                // this.description = '';
                Alpine.store('notification').show('补丁包生成成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async applyPatch(recordId) {
            try {
                const response = await fetch('/api/patch/apply', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ record_id: recordId })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '应用补丁包失败');
                }

                await this.loadRecords();
                Alpine.store('notification').show('补丁包应用成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        formatDate(timestamp) {
            if (!timestamp) return '';
            
            // 如果是字符串格式，转换为Date对象
            let date;
            if (typeof timestamp === 'string') {
                date = new Date(timestamp);
            } else {
                date = new Date(timestamp);
            }

            // 检查日期是否有效
            if (isNaN(date.getTime())) {
                return '';
            }

            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        },

        getStatusText(status) {
            switch (status) {
                case 0: return '待应用';
                case 1: return '已应用';
                case 2: return '应用失败';
                default: return '未知';
            }
        }
    };
}