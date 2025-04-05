function noteManagement() {
    return {
        categories: [],
        notes: [],
        roles: [],
        selectedNote: null,
        showCategoryModal: false,
        showNoteModal: false,
        showPreview: true,
        categoryForm: {
            id: null,
            name: '',
            description: '',
            parent_id: 0,
            is_public: 0,
            role_ids: []
        },
        noteForm: {
            id: null,
            title: '',
            content: '',
            category_id: null,
            parent_id: 0,
            is_public: 0,
            role_ids: []
        },

        init() {
            this.loadCategories();
            this.loadNotes();
            this.loadRoles();
        },

        // 加载分类列表
        async loadCategories() {
            try {
                const response = await fetch('/api/notes/categories');
                if (!response.ok) throw new Error('加载分类失败');
                this.categories = await response.json();
                // 初始化展开状态并确保ID是数字类型
                this.categories.forEach(category => {
                    category.expanded = false;
                    category.id = Number(category.id);
                    category.parent_id = Number(category.parent_id || 0);
                });
            } catch (error) {
                console.error('Failed to load categories:', error);
                Alpine.store('notification').show('加载分类失败', 'error');
            }
        },

        // 加载笔记列表
        async loadNotes() {
            try {
                const response = await fetch('/api/notes/tree');
                if (!response.ok) throw new Error('加载笔记失败');
                this.notes = await response.json();
                // 确保ID是数字类型
                this.notes.forEach(note => {
                    note.id = Number(note.id);
                    note.category_id = Number(note.category_id || 0);
                    note.parent_id = Number(note.parent_id || 0);
                });
                // 按分类组织笔记
                this.organizeNotes();
            } catch (error) {
                console.error('Failed to load notes:', error);
                Alpine.store('notification').show('加载笔记失败', 'error');
            }
        },

        // 加载角色列表
        async loadRoles() {
            try {
                const response = await fetch('/api/roles');
                if (!response.ok) throw new Error('加载角色失败');
                this.roles = await response.json();
            } catch (error) {
                console.error('Failed to load roles:', error);
                Alpine.store('notification').show('加载角色失败', 'error');
            }
        },

        // 按分类组织笔记
        organizeNotes() {
            this.categories.forEach(category => {
                category.notes = this.notes.filter(note => note.category_id === category.id);
            });
        },

        // 切换分类展开状态
        toggleCategory(category) {
            category.expanded = !category.expanded;
        },

        // 选择笔记
        async selectNote(note) {
            try {
                const response = await fetch(`/api/notes/${note.id}`);
                if (!response.ok) throw new Error('加载笔记详情失败');
                this.selectedNote = await response.json();
            } catch (error) {
                console.error('Failed to load note details:', error);
                Alpine.store('notification').show('加载笔记详情失败', 'error');
            }
        },

        // 创建笔记
        createNote() {
            this.noteForm = {
                id: null,
                title: '',
                content: '',
                category_id: Number(this.categories[0]?.id || 0),
                parent_id: 0,
                is_public: 0,
                role_ids: []
            };
            this.showNoteModal = true;
        },

        // 编辑笔记
        editNote(note) {
            this.noteForm = {
                id: Number(note.id),
                title: note.title,
                content: note.content,
                category_id: Number(note.category_id || 0),
                parent_id: Number(note.parent_id || 0),
                is_public: note.is_public,
                role_ids: note.roles?.map(role => Number(role.id)) || []
            };
            this.showNoteModal = true;
        },

        // 保存笔记
        async saveNote() {
            if (this.selectedNote) {
                try {
                    const response = await fetch(`/api/notes/${this.selectedNote.id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: this.selectedNote.title,
                            content: this.selectedNote.content,
                            category_id: this.selectedNote.category_id,
                            parent_id: this.selectedNote.parent_id,
                            is_public: this.selectedNote.is_public ? 1 : 0,
                            role_ids: this.selectedNote.roles?.map(role => role.id) || []
                        }),
                    });

                    if (!response.ok) throw new Error('保存笔记失败');
                    
                    Alpine.store('notification').show('保存成功', 'success');
                    await this.loadNotes();
                } catch (error) {
                    console.error('Failed to save note:', error);
                    Alpine.store('notification').show('保存笔记失败', 'error');
                }
            }
        },

        // 提交笔记
        submitNote() {
            const isEdit = !!this.noteForm.id;
            const url = isEdit ? `/api/notes/${this.noteForm.id}` : '/api/notes';
            const method = isEdit ? 'PUT' : 'POST';

            fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: this.noteForm.title,
                    content: this.noteForm.content,
                    category_id: Number(this.noteForm.category_id || 0),
                    parent_id: Number(this.noteForm.parent_id || 0),
                    is_public: this.noteForm.is_public ? 1 : 0,
                    role_ids: this.noteForm.role_ids.map(id => Number(id))
                })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络响应不正常');
                }
                return response.json();
            })
            .then(data => {
                this.showNoteModal = false;
                this.loadNotes().then(() => {
                    // 创建或编辑笔记后，自动选中该笔记
                    if (data.id) {
                        // 查找新创建的笔记
                        const createdNote = this.notes.find(note => note.id === data.id);
                        if (createdNote) {
                            this.selectNote(createdNote);
                        }
                    }
                });
                Alpine.store('notification').show(isEdit ? '笔记更新成功' : '笔记创建成功', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                Alpine.store('notification').show(error.message, 'error');
            });
        },

        // 删除笔记
        async deleteNote(note) {
            if (!confirm('确定要删除这个笔记吗？')) return;

            try {
                const response = await fetch(`/api/notes/${note.id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) throw new Error('删除笔记失败');

                if (this.selectedNote?.id === note.id) {
                    this.selectedNote = null;
                }

                Alpine.store('notification').show('删除成功', 'success');
                await this.loadNotes();
            } catch (error) {
                console.error('Failed to delete note:', error);
                Alpine.store('notification').show('删除笔记失败', 'error');
            }
        },

        // 打开分类模态框，并重置表单
        openCategoryModal() {
            this.categoryForm = {
                id: null,
                name: '',
                description: '',
                parent_id: 0,
                is_public: 0,
                role_ids: []
            };
            this.showCategoryModal = true;
        },

        // 编辑分类
        editCategory(category) {
            this.categoryForm = {
                id: Number(category.id),
                name: category.name,
                description: category.description,
                parent_id: Number(category.parent_id || 0),
                is_public: category.is_public,
                role_ids: category.roles?.map(role => Number(role.id)) || []
            };
            this.showCategoryModal = true;
        },

        // 保存分类
        async saveCategory() {
            try {
                const url = this.categoryForm.id ? `/api/notes/categories/${this.categoryForm.id}` : '/api/notes/categories';
                const method = this.categoryForm.id ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: this.categoryForm.name,
                        description: this.categoryForm.description,
                        parent_id: Number(this.categoryForm.parent_id || 0),
                        is_public: this.categoryForm.is_public ? 1 : 0,
                        role_ids: this.categoryForm.role_ids.map(id => Number(id))
                    }),
                });

                if (!response.ok) throw new Error('保存分类失败');

                this.showCategoryModal = false;
                Alpine.store('notification').show('保存成功', 'success');
                await this.loadCategories();
            } catch (error) {
                console.error('Failed to save category:', error);
                Alpine.store('notification').show('保存分类失败', 'error');
            }
        },

        // 删除分类
        async deleteCategory(category) {
            if (!confirm('确定要删除这个分类吗？')) return;

            try {
                const response = await fetch(`/api/notes/categories/${category.id}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || '删除分类失败');
                }

                Alpine.store('notification').show('删除成功', 'success');
                await this.loadCategories();
            } catch (error) {
                console.error('Failed to delete category:', error);
                Alpine.store('notification').show(error.message || '删除分类失败', 'error');
            }
        },

        // Markdown 转 HTML
        markdownToHtml(markdown) {
            if (typeof marked !== 'undefined') {
                return marked.parse(markdown || '');
            } else {
                console.error('Marked library is not loaded');
                return markdown || '';
            }
        },

        // 切换预览状态
        togglePreview() {
            this.showPreview = !this.showPreview;
        },

        // 处理Tab键缩进
        handleTab(e) {
            const textarea = e.target;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            // 在当前光标位置插入Tab
            const text = textarea.value;
            textarea.value = text.substring(0, start) + '    ' + text.substring(end);
            
            // 重新设置光标位置
            textarea.selectionStart = textarea.selectionEnd = start + 4;
            
            // 触发更新 - 根据当前上下文更新不同的模型
            if (this.selectedNote) {
                this.selectedNote.content = textarea.value;
            } else if (this.noteForm) {
                this.noteForm.content = textarea.value;
            }
        },

        // 插入Markdown标记
        insertMarkdown(template) {
            // 根据当前操作上下文判断要使用的引用
            const textarea = this.selectedNote ? 
                document.querySelector('textarea[x-model="selectedNote.content"]') : 
                this.$refs.markdownEditor;
                
            if (!textarea) return;
            
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = textarea.value;
            
            // 如果有选中文本，使用选中的文本替换模板中的占位符
            let insertion = template;
            if (start !== end) {
                const selection = text.substring(start, end);
                if (template === '**粗体**') {
                    insertion = `**${selection}**`;
                } else if (template === '*斜体*') {
                    insertion = `*${selection}*`;
                } else if (template === '# 标题') {
                    insertion = `# ${selection}`;
                } else if (template === '[链接文本](https://example.com)') {
                    insertion = `[${selection}](https://example.com)`;
                } else if (template === '![图片描述](https://example.com/image.jpg)') {
                    insertion = `![${selection}](https://example.com/image.jpg)`;
                } else if (template === '```\n代码块\n```') {
                    insertion = `\`\`\`\n${selection}\n\`\`\``;
                }
            }
            
            // 插入内容
            textarea.value = text.substring(0, start) + insertion + text.substring(end);
            
            // 更新模型值 - 根据当前上下文更新不同的模型
            if (this.selectedNote) {
                this.selectedNote.content = textarea.value;
            } else if (this.noteForm) {
                this.noteForm.content = textarea.value;
            }
            
            // 设置新的光标位置
            const newPosition = start + insertion.length;
            textarea.selectionStart = textarea.selectionEnd = newPosition;
            
            // 聚焦回文本框
            textarea.focus();
        },
    };
} 