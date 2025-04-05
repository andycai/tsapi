// Menu management functionality
function menuManagement() {
    return {
        menuTree: [],
        parentMenus: [],
        showModal: false,
        editMode: false,
        currentMenu: null,
        form: {
            parent_id: 0,
            name: '',
            path: '',
            icon: '',
            permission: '',
            sort: 0,
            is_show: true
        },
        loading: false,

        get flattenedMenus() {
            if (!this.menuTree || !Array.isArray(this.menuTree) || this.menuTree.length === 0) {
                return [];
            }
            
            const flattened = [];
            const processMenu = (menuNode, level = 0) => {
                if (!menuNode || !menuNode.menu) return;
                
                flattened.push({ ...menuNode.menu, level });
                if (menuNode.children && Array.isArray(menuNode.children) && menuNode.children.length > 0) {
                    menuNode.children.forEach(child => {
                        processMenu(child, level + 1);
                    });
                }
            };
            
            this.menuTree.forEach(menuNode => processMenu(menuNode));
            return flattened;
        },

        init() {
            this.fetchMenus();
        },

        async fetchMenus() {
            try {
                const treeResponse = await fetch('/api/menus/tree');
                if (!treeResponse.ok) throw new Error('获取菜单树失败');
                this.menuTree = await treeResponse.json();

                const response = await fetch('/api/menus');
                if (!response.ok) throw new Error('获取菜单列表失败');
                const menus = await response.json();
                this.parentMenus = menus.filter(menu => menu.parent_id === 0);
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        },

        createMenu() {
            this.editMode = false;
            this.currentMenu = null;
            this.form = {
                parent_id: 0,
                name: '',
                path: '',
                icon: '',
                permission: '',
                sort: 0,
                is_show: true
            };
            this.showModal = true;
        },

        editMenu(menu) {
            this.editMode = true;
            this.currentMenu = menu;
            this.form = {
                parent_id: menu.parent_id,
                name: menu.name,
                path: menu.path,
                icon: menu.icon,
                permission: menu.permission,
                sort: menu.sort,
                is_show: menu.is_show
            };
            this.showModal = true;
        },

        closeModal() {
            this.showModal = false;
            this.editMode = false;
            this.currentMenu = null;
            this.form = {
                parent_id: 0,
                name: '',
                path: '',
                icon: '',
                permission: '',
                sort: 0,
                is_show: true
            };
        },

        async submitForm() {
            if (this.loading) return;
            this.loading = true;

            try {
                const url = this.editMode ? `/api/menus/${this.currentMenu.id}` : '/api/menus';
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
                    this.editMode ? '菜单更新成功' : '菜单创建成功',
                    'success'
                );
                this.closeModal();
                this.fetchMenus();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            } finally {
                this.loading = false;
            }
        },

        async deleteMenu(id) {
            if (!confirm('确定要删除这个菜单吗？如果是父级菜单，其下的子菜单也会被删除。')) return;

            try {
                const response = await fetch(`/api/menus/${id}`, {
                    method: 'DELETE'
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || '删除失败');
                }

                Alpine.store('notification').show('菜单删除成功', 'success');
                this.fetchMenus();
            } catch (error) {
                Alpine.store('notification').show(error.message, 'error');
            }
        }
    }
} 