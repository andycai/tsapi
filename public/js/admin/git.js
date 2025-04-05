function gitManagement() {
    return {
        repositories: [],
        showCloneModal: false,
        showCommitModal: false,
        showBranchModal: false,
        showStashModal: false,
        showDetailsModal: false,
        detailsTitle: '',
        detailsContent: '',
        selectedRepo: null,
        branches: [],
        cloneForm: {
            url: '',
            path: '',
            branch: '',
            username: '',
            password: ''
        },
        commitForm: {
            message: ''
        },
        branchForm: {
            name: '',
            selected: '',
            mergeFrom: ''
        },

        init() {
            this.loadRepositories();
        },

        async loadRepositories() {
            try {
                const response = await fetch('/api/git/repositories');
                if (!response.ok) throw new Error('Failed to load repositories');
                this.repositories = await response.json();
            } catch (error) {
                console.error('Error loading repositories:', error);
                toast.error('加载仓库列表失败');
            }
        },

        getStatusText(status) {
            const statusMap = {
                'clean': '干净',
                'modified': '已修改',
                'conflict': '冲突'
            };
            return statusMap[status] || status;
        },

        formatDate(timestamp) {
            if (!timestamp) return '';
            return new Date(timestamp * 1000).toLocaleString();
        },

        async cloneRepository() {
            this.showCloneModal = true;
        },

        async submitClone(e) {
            e.preventDefault();
            try {
                const response = await fetch('/api/git/clone', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.cloneForm)
                });
                if (!response.ok) throw new Error('Failed to clone repository');
                toast.success('仓库克隆成功');
                this.showCloneModal = false;
                this.loadRepositories();
                this.cloneForm = { url: '', path: '', branch: '', username: '', password: '' };
            } catch (error) {
                console.error('Error cloning repository:', error);
                toast.error('克隆仓库失败');
            }
        },

        async pullChanges(repo) {
            try {
                const response = await fetch(`/api/git/pull`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: repo.path })
                });
                if (!response.ok) throw new Error('Failed to pull changes');
                toast.success('拉取更改成功');
                this.loadRepositories();
            } catch (error) {
                console.error('Error pulling changes:', error);
                toast.error('拉取更改失败');
            }
        },

        async pushChanges(repo) {
            try {
                const response = await fetch(`/api/git/push`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: repo.path })
                });
                if (!response.ok) throw new Error('Failed to push changes');
                toast.success('推送更改成功');
                this.loadRepositories();
            } catch (error) {
                console.error('Error pushing changes:', error);
                toast.error('推送更改失败');
            }
        },

        async viewStatus(repo) {
            try {
                const response = await fetch(`/api/git/status?path=${encodeURIComponent(repo.path)}`);
                if (!response.ok) throw new Error('Failed to get status');
                const status = await response.text();
                this.detailsTitle = '仓库状态';
                this.detailsContent = status;
                this.showDetailsModal = true;
            } catch (error) {
                console.error('Error getting status:', error);
                toast.error('获取状态失败');
            }
        },

        async viewLog(repo) {
            try {
                const response = await fetch(`/api/git/log?path=${encodeURIComponent(repo.path)}`);
                if (!response.ok) throw new Error('Failed to get log');
                const log = await response.text();
                this.detailsTitle = '提交日志';
                this.detailsContent = log;
                this.showDetailsModal = true;
            } catch (error) {
                console.error('Error getting log:', error);
                toast.error('获取日志失败');
            }
        },

        async commitChanges(repo) {
            this.selectedRepo = repo;
            this.showCommitModal = true;
        },

        async submitCommit(e) {
            e.preventDefault();
            try {
                const response = await fetch('/api/git/commit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: this.selectedRepo.path,
                        message: this.commitForm.message
                    })
                });
                if (!response.ok) throw new Error('Failed to commit changes');
                toast.success('提交更改成功');
                this.showCommitModal = false;
                this.commitForm.message = '';
                this.loadRepositories();
            } catch (error) {
                console.error('Error committing changes:', error);
                toast.error('提交更改失败');
            }
        },

        async manageBranches(repo) {
            this.selectedRepo = repo;
            try {
                const response = await fetch(`/api/git/branches?path=${encodeURIComponent(repo.path)}`);
                if (!response.ok) throw new Error('Failed to get branches');
                this.branches = await response.json();
                this.branchForm.selected = repo.branch;
                this.showBranchModal = true;
            } catch (error) {
                console.error('Error getting branches:', error);
                toast.error('获取分支��表失败');
            }
        },

        async createBranch() {
            if (!this.branchForm.name) {
                toast.error('请输入分支名称');
                return;
            }
            try {
                const response = await fetch('/api/git/branch/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: this.selectedRepo.path,
                        name: this.branchForm.name
                    })
                });
                if (!response.ok) throw new Error('Failed to create branch');
                toast.success('创建分支成功');
                this.branchForm.name = '';
                await this.manageBranches(this.selectedRepo);
            } catch (error) {
                console.error('Error creating branch:', error);
                toast.error('创建分支失败');
            }
        },

        async checkoutBranch() {
            try {
                const response = await fetch('/api/git/branch/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: this.selectedRepo.path,
                        name: this.branchForm.selected
                    })
                });
                if (!response.ok) throw new Error('Failed to checkout branch');
                toast.success('切换分支成功');
                this.loadRepositories();
            } catch (error) {
                console.error('Error checking out branch:', error);
                toast.error('切换分支失败');
            }
        },

        async mergeBranch() {
            try {
                const response = await fetch('/api/git/branch/merge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: this.selectedRepo.path,
                        source: this.branchForm.mergeFrom
                    })
                });
                if (!response.ok) throw new Error('Failed to merge branch');
                toast.success('合并分支成功');
                this.loadRepositories();
            } catch (error) {
                console.error('Error merging branch:', error);
                toast.error('合并分支失败');
            }
        },

        async manageStash(repo) {
            this.selectedRepo = repo;
            this.showStashModal = true;
        },

        async stashChanges() {
            try {
                const response = await fetch('/api/git/stash/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: this.selectedRepo.path })
                });
                if (!response.ok) throw new Error('Failed to stash changes');
                toast.success('暂存更改成功');
                this.loadRepositories();
            } catch (error) {
                console.error('Error stashing changes:', error);
                toast.error('暂存更改失败');
            }
        },

        async popStash() {
            try {
                const response = await fetch('/api/git/stash/pop', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ path: this.selectedRepo.path })
                });
                if (!response.ok) throw new Error('Failed to pop stash');
                toast.success('恢复暂存成功');
                this.loadRepositories();
            } catch (error) {
                console.error('Error popping stash:', error);
                toast.error('恢复暂存失败');
            }
        }
    };
} 