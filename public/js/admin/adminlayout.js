document.addEventListener('alpine:init', () => {
    Alpine.store('notification', {
        notifications: [],
        notificationCount: 0,
        show(message, type = 'success') {
            const id = ++this.notificationCount;
            const notification = {
                id,
                message,
                type,
                show: true,
                progress: 100
            };

            this.notifications.push(notification);

            setTimeout(() => {
                notification.progress = 0;
                setTimeout(() => {
                    notification.show = false;
                    setTimeout(() => {
                        this.notifications = this.notifications.filter(n => n.id !== id);
                    }, 300);
                }, 2000);
            }, 100);
        }
    });
});

function adminLayoutManagement() {
    return {
        user: JSON.parse(localStorage.getItem('user') || '{}'),
        collapsed: localStorage.getItem('menuCollapsed') === 'true',
        mobileMenuOpen: false,
        theme: localStorage.theme || 'light',
        currentPath: window.location.pathname,
        expandedGroup: localStorage.getItem('expandedMenuGroup'),
        recentTabs: [],
        maxTabs: 8,
        menuTree: [],
        loading: false,
        justCollapsed: false,
        menuIcons: {
            default: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>',
            home: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>',
            system: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>',
            filemanager: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>',
            imagemanager: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
            reposync: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>',
            user: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>',
            role: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
            permission: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>',
            menu: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>',
            adminlog: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
            game: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>',
            gamelog: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z M9 9h.01M15 9h.01M9 13h.01M15 13h.01M9 17h.01M15 17h.01" /></svg>',
            stats: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>',
            tools: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
            browse: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>',
            upload: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>',
            serverconf: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>',
            terminal: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
            package: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>',
            citask: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>',
            gameconf: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m-6-8h6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v2m0 12v2M3 12h2m14 0h2" /></svg>',
            patch: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>',
            parameter: '<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>',
            luban: '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>'
        },
        get recentTabsKey() {
            return 'recentTabs_' + this.user.id;
        },
        async loadMenus() {
            try {
                const response = await fetch('/api/menus/public/tree');
                if (!response.ok) throw new Error('加载菜单失败');
                this.menuTree = await response.json();

                // 加载菜单后，只初始化标签，不自动展开菜单
                this.initializeTabs();

                // 如果菜单是展开状态，并且localStorage中有保存的展开组，则恢复
                if (!this.collapsed) {
                    const savedGroup = localStorage.getItem('expandedMenuGroup');
                    if (savedGroup) {
                        this.expandedGroup = parseInt(savedGroup);
                    }
                }
            } catch (error) {
                console.error('Failed to load menus:', error);
                Alpine.store('notification').show('加载菜单失败', 'error');
            }
        },
        initializeTabs() {
            // 从 localStorage 获取保存的标签
            const savedTabs = JSON.parse(localStorage.getItem(this.recentTabsKey) || '[]');
            this.recentTabs = savedTabs;
        },
        hasPermission(permission) {
            // 如果没有配置权限，则不显示
            if (!permission) return false;

            // 检查用户是否存在且有角色
            if (!this.user || !this.user.role) return false;

            // 获取用户权限列表
            const userPermissions = this.user.role.permissions?.map(p => p.code) || [];

            // 如果用户有 admin 权限，允许访问所有内容
            if (userPermissions.includes('admin')) return true;

            // 检查具体权限
            return userPermissions.includes(permission);
        },
        hasMenuPermission(menuItem) {
            // 如果是父菜单，检查是否有可见的子菜单
            if (menuItem.children && menuItem.children.length > 0) {
                return this.hasVisibleChildren(menuItem);
            }

            // 如果是子菜单或没有子菜单的菜单项，检查自身权限
            return this.hasPermission(menuItem.menu.permission);
        },
        hasVisibleChildren(menuItem) {
            // 检查是否有任何子菜单有权限显示
            return menuItem.children && menuItem.children.some(child => this.hasPermission(child.menu.permission));
        },
        getMenuName(path) {
            // 首页特殊处理
            if (path === '/admin') return '首页';

            // 在菜单树中查找
            for (const menu of this.menuTree) {
                if (menu.menu.path === path) {
                    return menu.menu.name;
                }
                for (const child of menu.children) {
                    if (child.menu.path === path) {
                        return child.menu.name;
                    }
                }
            }
            return path;
        },
        addTab(path) {
            // 检查路径是否在菜单中定义
            const isMenuPath = this.isPathInMenu(path);
            if (!isMenuPath) {
                return; // 如果路径不在菜单中，不添加标签
            }

            // 查找菜单项以获取标题
            const menuItem = this.findMenuItemByPath(path);
            if (!menuItem) {
                return; // 如果找不到对应的菜单项，不添加标签
            }

            // 检查标签是否已存在
            const existingTabIndex = this.recentTabs.findIndex(tab => tab.path === path);
            if (existingTabIndex !== -1) {
                // 如果标签已存在，将其移动到最后
                const tab = this.recentTabs.splice(existingTabIndex, 1)[0];
                this.recentTabs.push(tab);
            } else {
                // 如果标签不存在，添加新标签
                this.recentTabs.push({
                    path: path,
                    title: menuItem.name
                });

                // 如果标签数量超过最大值，移除最早的标签
                if (this.recentTabs.length > this.maxTabs) {
                    this.recentTabs.shift();
                }
            }

            // 保存到 localStorage
            localStorage.setItem(this.recentTabsKey, JSON.stringify(this.recentTabs));
        },
        // 检查路径是否在菜单中定义
        isPathInMenu(path) {
            return this.findMenuItemByPath(path) !== null;
        },
        // 在菜单树中查找指定路径的菜单项
        findMenuItemByPath(path) {
            const searchInMenu = (items) => {
                for (const item of items) {
                    // 检查当前菜单
                    if (item.menu && item.menu.path === path) {
                        return item.menu;
                    }
                    // 检查子菜单项
                    if (item.children && item.children.length > 0) {
                        const found = searchInMenu(item.children);
                        if (found) return found;
                    }
                }
                return null;
            };
            return searchInMenu(this.menuTree);
        },
        closeTab(path) {
            const index = this.recentTabs.findIndex(tab => tab.path === path);
            if (index === -1) return;

            this.recentTabs.splice(index, 1);
            localStorage.setItem(this.recentTabsKey, JSON.stringify(this.recentTabs));

            // 如果关闭的是当前标签，导航到前一个标签
            if (path === this.currentPath) {
                const prevTab = this.recentTabs[Math.max(0, index - 1)];
                if (prevTab) {
                    this.navigate(prevTab.path);
                } else {
                    this.navigate('/admin');
                }
            }
        },
        navigate(path) {
            if (this.loading || path === this.currentPath) return;
            this.loading = true;

            try {
                window.location.href = path;
            } catch (error) {
                console.error('Navigation error:', error);
                Alpine.store('notification').show(error.message, 'error');
            } finally {
                this.loading = false;
            }
        },
        toggleMenuGroup(group) {
            if (this.expandedGroup === group) {
                this.expandedGroup = null;
                localStorage.removeItem('expandedMenuGroup');
            } else {
                this.expandedGroup = group;
                localStorage.setItem('expandedMenuGroup', group);
            }
        },
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', this.theme);

            if (this.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        toggleCollapse() {
            this.collapsed = !this.collapsed;
            localStorage.setItem('menuCollapsed', this.collapsed);
            if (this.collapsed) {
                this.justCollapsed = true;
                this.expandedGroup = null;
                // 300ms 后重置 justCollapsed，这个时间要比菜单收起的动画时间长
                setTimeout(() => {
                    this.justCollapsed = false;
                }, 300);
            }
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // post 请求 /logout
            window.location.href = '/logout';
        },
        init() {
            // 检查登录状态
            const token = localStorage.getItem('token');
            // if (!token) {
            //     window.location.href = '/login';
            //     return;
            // }

            // 设置初始主题
            if (this.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }

            // 加载菜单数据
            this.loadMenus();

            // 初始化时不显示浮动子菜单
            this.justCollapsed = true;
            setTimeout(() => {
                this.justCollapsed = false;
            }, 300);
        },
        // 查找当前路径对应的菜单项及其父菜单
        findCurrentMenu(items = this.menuTree, parent = null) {
            for (const item of items) {
                // 检查当前菜单项
                if (item.menu.path === this.currentPath) {
                    return { current: item.menu, parent };
                }
                // 检查子菜单项
                if (item.children && item.children.length > 0) {
                    const found = this.findCurrentMenu(item.children, item.menu);
                    if (found) return found;
                }
            }
            return null;
        },
        // 展开当前菜单的父菜单
        expandCurrentMenuParent() {
            const found = this.findCurrentMenu();
            if (found && found.parent) {
                this.expandedGroup = found.parent.id;
                localStorage.setItem('expandedMenuGroup', found.parent.id);
            }
        },
        async navigate(path) {
            if (this.loading || path === this.currentPath) return;
            this.loading = true;

            // 更新当前路径
            this.currentPath = path;

            // 更新标签
            const menuInfo = this.findCurrentMenu();
            if (menuInfo) {
                const { current } = menuInfo;

                // 添加到最近标签
                const existingTabIndex = this.recentTabs.findIndex(tab => tab.path === path);
                if (existingTabIndex === -1) {
                    // 添加新标签
                    this.recentTabs.push({
                        path: current.path,
                        name: current.name
                    });
                    // 如果超过最大数量，删除最早的标签
                    if (this.recentTabs.length > this.maxTabs) {
                        this.recentTabs.shift();
                    }
                    // 保存到 localStorage
                    localStorage.setItem(this.recentTabsKey, JSON.stringify(this.recentTabs));
                }
            }

            // 如果菜单是收起状态，确保不会展开
            if (this.collapsed) {
                this.expandedGroup = null;
                this.justCollapsed = true;
                setTimeout(() => {
                    this.justCollapsed = false;
                }, 300);
            }

            try {
                window.location.href = path;
            } catch (error) {
                console.error('Navigation error:', error);
                Alpine.store('notification').show(error.message, 'error');
            } finally {
                this.loading = false;
            }
        }
    }
}