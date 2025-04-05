function gameconfManagement() {
    return {
        projects: [],
        tables: [],
        currentProject: null,
        currentTable: null,
        showProjectForm: false,
        showTableForm: false,
        showExportForm: false,
        editingProject: false,
        editingTable: false,
        projectForm: {
            id: '',
            name: '',
            description: '',
            source_path: '',
            data_path: '',
            code_path: '',
            status: 'active'
        },
        tableForm: {
            id: '',
            name: '',
            description: '',
            file_type: 'excel',
            file_path: '',
            sheet_name: '',
            status: 'active'
        },
        exportForm: {
            format: 'json',
            language: 'cs'
        },

        init() {
            this.loadProjects();
        },

        // 加载项目列表
        async loadProjects() {
            try {
                const response = await fetch('/api/gameconf/projects');
                if (!response.ok) throw new Error('加载项目列表失败');
                this.projects = await response.json();
            } catch (error) {
                console.error('加载项目列表失败:', error);
                Alpine.store('notification').show('加载项目列表失败', 'error');
            }
        },

        // 创建项目
        createProject() {
            this.editingProject = false;
            this.projectForm = {
                id: '',
                name: '',
                description: '',
                source_path: '',
                data_path: '',
                code_path: '',
                status: 'active'
            };
            this.showProjectForm = true;
        },

        // 编辑项目
        editProject(project) {
            this.editingProject = true;
            this.projectForm = { ...project };
            this.showProjectForm = true;
        },

        // 保存项目
        async saveProject() {
            try {
                const url = this.editingProject
                    ? `/api/gameconf/projects/${this.projectForm.id}`
                    : '/api/gameconf/projects';
                const method = this.editingProject ? 'PUT' : 'POST';

                const formData = { ...this.projectForm };
                if (!this.editingProject) {
                    delete formData.id;
                }

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '操作失败');
                }

                await this.loadProjects();
                this.showProjectForm = false;
                Alpine.store('notification').show(
                    this.editingProject ? '项目更新成功' : '项目创建成功',
                    'success'
                );
            } catch (error) {
                console.error('保存项目失败:', error);
                Alpine.store('notification').show('保存项目失败', 'error');
            }
        },

        // 删除项目
        async deleteProject(project) {
            if (!confirm('确定要删除此项目吗？这将同时删除所有相关的配置表和导出记录。')) {
                return;
            }

            try {
                const response = await fetch(`/api/gameconf/projects/${project.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }

                await this.loadProjects();
                Alpine.store('notification').show('项目删除成功', 'success');
            } catch (error) {
                console.error('删除项目失败:', error);
                Alpine.store('notification').show('删除项目失败', 'error');
            }
        },

        // 查看项目的配置表
        async viewTables(project) {
            this.currentProject = project;
            await this.loadTables();
        },

        // 加载配置表列表
        async loadTables() {
            if (!this.currentProject) return;

            try {
                const response = await fetch(`/api/gameconf/tables?project_id=${this.currentProject.id}`);
                if (!response.ok) throw new Error('加载配置表列表失败');
                this.tables = await response.json();
            } catch (error) {
                console.error('加载配置表列表失败:', error);
                Alpine.store('notification').show('加载配置表列表失败', 'error');
            }
        },

        // 创建配置表
        createTable() {
            this.editingTable = false;
            this.tableForm = {
                id: '',
                name: '',
                description: '',
                file_type: 'excel',
                file_path: '',
                sheet_name: '',
                status: 'active'
            };
            this.showTableForm = true;
        },

        // 编辑配置表
        editTable(table) {
            this.editingTable = true;
            this.tableForm = { ...table };
            this.showTableForm = true;
        },

        // 保存配置表
        async saveTable() {
            try {
                this.tableForm.project_id = this.currentProject.id;

                const url = this.editingTable
                    ? `/api/gameconf/tables/${this.tableForm.id}`
                    : '/api/gameconf/tables';
                const method = this.editingTable ? 'PUT' : 'POST';

                const formData = { ...this.tableForm };
                if (!this.editingTable) {
                    delete formData.id;
                }

                const response = await fetch(url, {
                    method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '操作失败');
                }

                await this.loadTables();
                this.showTableForm = false;
                Alpine.store('notification').show(
                    this.editingTable ? '配置表更新成功' : '配置表创建成功',
                    'success'
                );
            } catch (error) {
                console.error('保存配置表失败:', error);
                Alpine.store('notification').show('保存配置表失败', 'error');
            }
        },

        // 删除配置表
        async deleteTable(table) {
            if (!confirm('确定要删除此配置表吗？这将同时删除所有相关的导出记录。')) {
                return;
            }

            try {
                const response = await fetch(`/api/gameconf/tables/${table.id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }

                await this.loadTables();
                Alpine.store('notification').show('配置表删除成功', 'success');
            } catch (error) {
                console.error('删除配置表失败:', error);
                Alpine.store('notification').show('删除配置表失败', 'error');
            }
        },

        // 验证配置表
        async validateTable(table) {
            try {
                const response = await fetch(`/api/gameconf/tables/${table.id}/validate`, {
                    method: 'POST'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '验证失败');
                }

                const result = await response.json();
                Alpine.store('notification').show(
                    result.valid ? '验证通过' : result.message,
                    result.valid ? 'success' : 'error'
                );
            } catch (error) {
                console.error('验证配置表失败:', error);
                Alpine.store('notification').show('验证配置表失败', 'error');
            }
        },

        // 创建导出记录
        async createExport() {
            try {
                const exportData = {
                    ...this.exportForm,
                    project_id: this.currentProject.id,
                    table_id: this.currentTable.id
                };

                const response = await fetch('/api/gameconf/exports', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(exportData)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '导出失败');
                }

                const result = await response.json();
                this.showExportForm = false;
                Alpine.store('notification').show('导出任务已创建，请稍后查看结果', 'success');

                // 如果导出成功，自动下载文件
                if (result.status === 'success') {
                    window.location.href = `/api/gameconf/exports/${result.id}/download`;
                }
            } catch (error) {
                console.error('创建导出记录失败:', error);
                Alpine.store('notification').show('创建导出记录失败', 'error');
            }
        },

        // 格式化日期时间
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

        // 获取状态显示样式
        getStatusBadge(status) {
            const statusClasses = {
                'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                'inactive': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
            };
            
            const statusText = {
                'active': '启用',
                'inactive': '禁用',
                'pending': '等待中'
            };

            const classes = statusClasses[status] || statusClasses['pending'];
            const text = statusText[status] || status;

            return `<span class="px-2 py-1 text-xs font-medium rounded-full ${classes}">${text}</span>`;
        }
    }
}

document.addEventListener('alpine:init', () => {
    Alpine.data('gameconfManagement', gameconfManagement);
});
