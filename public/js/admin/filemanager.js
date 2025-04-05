function filemanagerManagement() {
    return {
        items: [],
        currentPath: '',
        showUploadModal: false,
        showFolderModal: false,
        showRenameModal: false,
        selectedFiles: [],
        folderName: '',
        newName: '',
        currentItem: null,

        init() {
            this.fetchItems();
        },

        get sortedItems() {
            return [...this.items].sort((a, b) => {
                // 文件夹优先
                if (a.is_dir && !b.is_dir) return -1;
                if (!a.is_dir && b.is_dir) return 1;
                // 按名称排序
                return a.name.localeCompare(b.name);
            });
        },

        async fetchItems() {
            try {
                const response = await fetch(`/api/filemanager/list?path=${encodeURIComponent(this.currentPath)}`);
                if (!response.ok) throw new Error('获取文件列表失败');
                this.items = await response.json();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        uploadFile() {
            this.selectedFiles = [];
            this.showUploadModal = true;
        },

        handleFileSelect(event) {
            const files = Array.from(event.target.files);
            this.selectedFiles = [...this.selectedFiles, ...files];
        },

        removeFile(index) {
            this.selectedFiles.splice(index, 1);
        },

        async submitUpload() {
            try {
                const formData = new FormData();
                formData.append('path', this.currentPath);
                this.selectedFiles.forEach(file => {
                    formData.append('files', file);
                });

                const response = await fetch('/api/filemanager/upload', {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '上传失败');
                }

                await this.fetchItems();
                this.showUploadModal = false;
                this.selectedFiles = [];
                Alpine.store('notification').show('文件上传成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        createFolder() {
            this.folderName = '';
            this.showFolderModal = true;
        },

        async submitFolder() {
            try {
                const response = await fetch('/api/filemanager/mkdir', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: this.currentPath,
                        name: this.folderName
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '创建文件夹失败');
                }

                await this.fetchItems();
                this.showFolderModal = false;
                Alpine.store('notification').show('文件夹创建成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        renameItem(item) {
            this.currentItem = item;
            this.newName = item.name;
            this.showRenameModal = true;
        },

        async submitRename() {
            try {
                const response = await fetch('/api/filemanager/rename', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: this.currentItem.path,
                        new_name: this.newName
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '重命名失败');
                }

                await this.fetchItems();
                this.showRenameModal = false;
                Alpine.store('notification').show('重命名成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async deleteItem(item) {
            if (!confirm(`确定要删除${item.is_dir ? '文件夹' : '文件'} "${item.name}" 吗？`)) return;

            try {
                const response = await fetch('/api/filemanager/delete', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        path: item.path
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }

                await this.fetchItems();
                Alpine.store('notification').show('删除成功', 'success');
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        async downloadFile(item) {
            try {
                const response = await fetch(`/api/filemanager/download?path=${encodeURIComponent(item.path)}`);
                if (!response.ok) throw new Error('下载失败');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = item.name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        navigateTo(path) {
            this.currentPath = path;
            this.fetchItems();
        },

        formatSize(size) {
            if (size === 0) return '0 B';
            const units = ['B', 'KB', 'MB', 'GB', 'TB'];
            const k = 1024;
            const i = Math.floor(Math.log(size) / Math.log(k));
            return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + units[i];
        },

        formatDate(timestamp) {
            if (!timestamp) return '';
            return new Date(timestamp * 1000).toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    };
} 