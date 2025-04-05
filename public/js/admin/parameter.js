// Parameter management functionality
function parameterManagement() {
    return {
        parameters: [],
        currentPage: 1,
        pageSize: 10,
        totalPages: 0,
        searchKeyword: '',
        showModal: false,
        editMode: false,
        currentParameter: null,
        loading: false,
        form: {
            type: '',
            name: '',
            parameters: []
        },
        init() {
            this.fetchParameters();
        },
        async fetchParameters() {
            try {
                let url = `/api/parameters?page=${this.currentPage}&limit=${this.pageSize}`;
                if (this.searchKeyword) {
                    url += `&search=${encodeURIComponent(this.searchKeyword)}`;
                }
                
                const response = await fetch(url);
                if (!response.ok) throw new Error('获取参数列表失败');
                const data = await response.json();
                
                this.parameters = data.parameters;
                this.totalPages = Math.ceil(data.total / this.pageSize);
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },
        search() {
            this.currentPage = 1;
            this.fetchParameters();
        },
        goToPage(page) {
            if (page < 1 || page > this.totalPages || page === this.currentPage) return;
            this.currentPage = page;
            this.fetchParameters();
        },
        get paginationPages() {
            // 计算要显示的页码范围
            let startPage = Math.max(1, this.currentPage - 2);
            let endPage = Math.min(this.totalPages, startPage + 4);
            
            if (endPage - startPage < 4) {
                startPage = Math.max(1, endPage - 4);
            }
            
            const pages = [];
            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
            
            return pages;
        },
        createParameter() {
            this.editMode = false;
            this.currentParameter = null;
            this.form = {
                type: '',
                name: '',
                parameters: []
            };
            this.addField(); // 添加一个空字段
            this.showModal = true;
        },
        editParameter(parameter) {
            this.editMode = true;
            this.currentParameter = parameter;
            
            // 加载参数数据
            this.loading = true;
            fetch(`/api/parameters/${parameter.id}`)
                .then(response => {
                    if (!response.ok) throw new Error('加载参数数据失败');
                    return response.json();
                })
                .then(data => {
                    this.form = {
                        type: data.type,
                        name: data.name,
                        parameters: []
                    };
                    
                    // 添加参数字段
                    if (data.parameters && data.parameters.length > 0) {
                        data.parameters.forEach(field => {
                            this.form.parameters.push({
                                name: field.name,
                                type: field.type,
                                value: field.value
                            });
                        });
                    } else {
                        this.addField(); // 如果没有字段，添加一个空字段
                    }
                    
                    this.showModal = true;
                })
                .catch(error => {
                    Alpine.store('notification').show(error.message, 'error');
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        closeModal() {
            this.showModal = false;
            this.editMode = false;
            this.currentParameter = null;
            this.form = {
                type: '',
                name: '',
                parameters: []
            };
        },
        addField() {
            this.form.parameters.push({
                name: '',
                type: 'string',
                value: ''
            });
        },
        removeField(index) {
            this.form.parameters.splice(index, 1);
        },
        updateFieldType(index) {
            const field = this.form.parameters[index];
            // 根据字段类型重置值
            switch (field.type) {
                case 'string':
                    field.value = '';
                    break;
                case 'number':
                    field.value = 0;
                    break;
                case 'boolean':
                    field.value = 'false';
                    break;
            }
        },
        validateForm() {
            // 验证参数类型和名称
            if (!this.form.type.trim()) {
                Alpine.store('notification').show('参数类型不能为空', 'error');
                return false;
            }
            
            if (!this.form.name.trim()) {
                Alpine.store('notification').show('参数名称不能为空', 'error');
                return false;
            }
            
            // 验证字段
            const fieldNames = new Set();
            
            for (const field of this.form.parameters) {
                if (!field.name.trim()) {
                    Alpine.store('notification').show('字段名称不能为空', 'error');
                    return false;
                }
                
                // 检查字段名称是否重复
                if (fieldNames.has(field.name.trim())) {
                    Alpine.store('notification').show(`字段名称 '${field.name.trim()}' 重复`, 'error');
                    return false;
                }
                
                fieldNames.add(field.name.trim());
            }
            
            return true;
        },
        async submitForm() {
            if (this.loading) return;
            
            // 验证表单
            if (!this.validateForm()) return;
            
            this.loading = true;
            
            try {
                // 准备提交数据
                const parameterData = {
                    type: this.form.type.trim(),
                    name: this.form.name.trim(),
                    parameters: this.form.parameters.map(field => {
                        let value = field.value;
                        
                        // 处理不同类型的值
                        if (field.type === 'number') {
                            value = parseFloat(value);
                        } else if (field.type === 'boolean') {
                            value = value === 'true';
                        }
                        
                        return {
                            name: field.name.trim(),
                            type: field.type,
                            value: value
                        };
                    })
                };
                
                const url = this.editMode ? `/api/parameters/${this.currentParameter.id}` : '/api/parameters';
                const method = this.editMode ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(parameterData)
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '操作失败');
                }
                
                Alpine.store('notification').show(
                    this.editMode ? '参数更新成功' : '参数创建成功',
                    'success'
                );
                
                this.closeModal();
                this.fetchParameters();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            } finally {
                this.loading = false;
            }
        },
        async deleteParameter(id) {
            if (!confirm('确定要删除这个参数吗？此操作不可恢复。')) return;
            
            try {
                const response = await fetch(`/api/parameters/${id}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }
                
                Alpine.store('notification').show('参数删除成功', 'success');
                this.fetchParameters();
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
    };
}