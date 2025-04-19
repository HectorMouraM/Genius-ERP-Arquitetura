// Funções para edição de projetos
const setupEditProjectModal = () => {
    const modal = document.getElementById('edit-project-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = document.getElementById('edit-project-form');
    
    // Fecha o modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Quando o usuário clica fora do modal, fecha-o
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Submete o formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const projectId = document.getElementById('edit-project-id').value;
        const formData = new FormData(form);
        const projectData = {
            client_name: formData.get('client_name'),
            description: formData.get('description'),
            project_type: formData.get('project_type'),
            project_subtype: formData.get('project_subtype'),
            hourly_rate: parseFloat(formData.get('hourly_rate'))
        };
        
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(projectData)
            });
            
            if (!response.ok) {
                throw new Error('Falha ao atualizar projeto');
            }
            
            modal.style.display = 'none';
            loadProjects(); // Recarrega a lista de projetos
        } catch (error) {
            console.error('Erro ao atualizar projeto:', error);
            alert('Erro ao atualizar o projeto. Por favor, tente novamente.');
        }
    });
};

// Função para abrir o modal de edição de projeto
const openEditProjectModal = (project) => {
    const modal = document.getElementById('edit-project-modal');
    
    // Preenche o formulário com os dados do projeto
    document.getElementById('edit-project-id').value = project.id;
    document.getElementById('edit-client-name').value = project.client_name;
    document.getElementById('edit-project-description').value = project.description || '';
    document.getElementById('edit-project-type').value = project.project_type;
    document.getElementById('edit-project-subtype').value = project.project_subtype || '';
    document.getElementById('edit-hourly-rate').value = project.hourly_rate;
    
    // Exibe o modal
    modal.style.display = 'block';
};

// Funções para o menu de ações do projeto
const setupProjectActionsMenu = () => {
    const menu = document.getElementById('project-actions-menu');
    
    // Ação de editar projeto
    document.getElementById('edit-project-action').addEventListener('click', async () => {
        try {
            const projectId = menu.getAttribute('data-project-id');
            const response = await fetch(`/api/projects/${projectId}`);
            const project = await response.json();
            
            openEditProjectModal(project);
            menu.style.display = 'none';
        } catch (error) {
            console.error('Erro ao carregar projeto para edição:', error);
            alert('Erro ao carregar dados do projeto. Por favor, tente novamente.');
        }
    });
    
    // Ação de duplicar projeto
    document.getElementById('duplicate-project-action').addEventListener('click', async () => {
        try {
            const projectId = menu.getAttribute('data-project-id');
            const response = await fetch(`/api/projects/${projectId}`);
            const project = await response.json();
            
            // Remove o ID e adiciona "(Cópia)" ao nome do cliente
            delete project.id;
            project.client_name = `${project.client_name} (Cópia)`;
            
            // Cria um novo projeto com os mesmos dados
            const createResponse = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(project)
            });
            
            if (!createResponse.ok) {
                throw new Error('Falha ao duplicar projeto');
            }
            
            menu.style.display = 'none';
            loadProjects(); // Recarrega a lista de projetos
        } catch (error) {
            console.error('Erro ao duplicar projeto:', error);
            alert('Erro ao duplicar o projeto. Por favor, tente novamente.');
        }
    });
    
    // Ação de excluir projeto
    document.getElementById('delete-project-action').addEventListener('click', () => {
        const projectId = menu.getAttribute('data-project-id');
        openDeleteConfirmationModal(projectId);
        menu.style.display = 'none';
    });
};

// Função para abrir o menu de ações do projeto
const openProjectActionsMenu = (projectId, x, y) => {
    const menu = document.getElementById('project-actions-menu');
    menu.setAttribute('data-project-id', projectId);
    
    // Posiciona o menu nas coordenadas do clique
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    // Exibe o menu
    menu.style.display = 'block';
    
    // Adiciona um evento de clique no documento para fechar o menu quando clicar fora dele
    document.addEventListener('click', closeProjectActionsMenu);
};

// Função para fechar o menu de ações do projeto
const closeProjectActionsMenu = (event) => {
    const menu = document.getElementById('project-actions-menu');
    
    // Verifica se o clique foi fora do menu
    if (!menu.contains(event.target) && event.target.className !== 'project-btn-more') {
        menu.style.display = 'none';
        document.removeEventListener('click', closeProjectActionsMenu);
    }
};

// Funções para o modal de confirmação de exclusão
const setupDeleteConfirmationModal = () => {
    const modal = document.getElementById('delete-confirmation-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const deleteBtn = modal.querySelector('.delete-btn');
    
    // Fecha o modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Quando o usuário clica fora do modal, fecha-o
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Ação de excluir
    deleteBtn.addEventListener('click', async () => {
        const projectId = modal.getAttribute('data-project-id');
        
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Falha ao excluir projeto');
            }
            
            modal.style.display = 'none';
            loadProjects(); // Recarrega a lista de projetos
        } catch (error) {
            console.error('Erro ao excluir projeto:', error);
            alert('Erro ao excluir o projeto. Por favor, tente novamente.');
        }
    });
};

// Função para abrir o modal de confirmação de exclusão
const openDeleteConfirmationModal = (projectId) => {
    const modal = document.getElementById('delete-confirmation-modal');
    modal.setAttribute('data-project-id', projectId);
    
    // Exibe o modal
    modal.style.display = 'block';
};

// Funções para edição de etapas
const setupEditStageModal = () => {
    const modal = document.getElementById('edit-stage-modal');
    const closeBtn = modal.querySelector('.close-modal');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const form = document.getElementById('edit-stage-form');
    
    // Fecha o modal
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Quando o usuário clica fora do modal, fecha-o
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Submete o formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const stageId = document.getElementById('edit-stage-id').value;
        const formData = new FormData(form);
        const stageData = {
            name: formData.get('name'),
            description: formData.get('description'),
            deadline: formData.get('deadline'),
            status: formData.get('status')
        };
        
        try {
            const response = await fetch(`/api/stages/${stageId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(stageData)
            });
            
            if (!response.ok) {
                throw new Error('Falha ao atualizar etapa');
            }
            
            modal.style.display = 'none';
            
            // Atualiza a visualização dependendo de onde estamos
            if (document.getElementById('stage-details-page').style.display === 'flex') {
                showStageDetails(stageId);
            } else {
                showProjectDetails(currentProjectId);
            }
        } catch (error) {
            console.error('Erro ao atualizar etapa:', error);
            alert('Erro ao atualizar a etapa. Por favor, tente novamente.');
        }
    });
};

// Função para abrir o modal de edição de etapa
const openEditStageModal = async (stageId) => {
    try {
        const response = await fetch(`/api/stages/${stageId}`);
        const stage = await response.json();
        
        const modal = document.getElementById('edit-stage-modal');
        
        // Preenche o formulário com os dados da etapa
        document.getElementById('edit-stage-id').value = stage.id;
        document.getElementById('edit-stage-name').value = stage.name;
        document.getElementById('edit-stage-description').value = stage.description || '';
        document.getElementById('edit-stage-deadline').value = stage.deadline ? stage.deadline.split('T')[0] : '';
        document.getElementById('edit-stage-status').value = stage.status;
        
        // Exibe o modal
        modal.style.display = 'block';
    } catch (error) {
        console.error('Erro ao carregar etapa para edição:', error);
        alert('Erro ao carregar dados da etapa. Por favor, tente novamente.');
    }
};

// Modificação na função renderProjects para incluir o menu de ações e a barra de progresso
const renderProjects = (projects) => {
    const projectList = document.getElementById('project-list');
    projectList.innerHTML = '';

    if (projects.length === 0) {
        projectList.innerHTML = '<p class="no-projects">Nenhum projeto encontrado. Clique no botão "+" para adicionar um novo projeto.</p>';
        return;
    }

    projects.forEach(project => {
        // Cores aleatórias para os cards de projetos
        const colors = ['#fee4cb', '#e9e7fd', '#dbf6fd', '#ffd3e2', '#c8f7dc', '#d5deff'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Calcula o progresso do projeto
        let progress = 0;
        let completedStages = 0;
        
        if (project.stages && project.stages.length > 0) {
            project.stages.forEach(stage => {
                if (stage.status === 'concluida') {
                    completedStages++;
                }
            });
            progress = (completedStages / project.stages.length) * 100;
        }
        
        const projectBox = document.createElement('div');
        projectBox.className = 'project-box-wrapper';
        projectBox.innerHTML = `
            <div class="project-box" style="background-color: ${randomColor};" data-project-id="${project.id}">
                <div class="project-box-header">
                    <span>${formatDate(project.created_at)}</span>
                    <div class="more-wrapper">
                        <button class="project-btn-more" data-project-id="${project.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-more-vertical">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="12" cy="5" r="1" />
                                <circle cx="12" cy="19" r="1" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="project-box-content-header">
                    <p class="box-content-header">${project.client_name}</p>
                    <p class="box-content-subheader">${project.project_type} - ${project.project_subtype || 'Geral'}</p>
                </div>
                <div class="box-progress-wrapper">
                    <p class="box-progress-header">Progresso</p>
                    <div class="box-progress-bar">
                        <span class="box-progress" style="width: ${progress}%; background-color: #4f3ff0"></span>
                    </div>
                    <p class="box-progress-percentage">${Math.round(progress)}%</p>
                </div>
                <div class="project-box-footer">
                    <div class="participants">
                        <button class="add-participant add-stage-to-project" data-project-id="${project.id}" title="Adicionar Etapa">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </button>
                    </div>
                    <div class="days-left view-details" style="color: #4f3ff0;" data-project-id="${project.id}">
                        Ver Detalhes
                    </div>
                </div>
                <div class="project-stages-preview">
                    <div class="stages-preview-list">
                        ${project.stages && project.stages.length > 0 
                            ? project.stages.map(stage => `
                                <div class="stage-preview-item" data-stage-id="${stage.id}">
                                    <span class="stage-preview-name">${stage.name}</span>
                                    <span class="stage-preview-status status-${stage.status}">${
                                        {
                                            'pendente': 'Pendente',
                                            'em_andamento': 'Em Andamento',
                                            'aguardando_cliente': 'Aguardando Cliente',
                                            'concluida': 'Concluída'
                                        }[stage.status] || 'Pendente'
                                    }</span>
                                </div>
                            `).join('')
                            : '<p>Nenhuma etapa cadastrada.</p>'
                        }
                    </div>
                </div>
            </div>
        `;

        projectList.appendChild(projectBox);

        // Adiciona evento de clique para o botão de mais opções
        projectBox.querySelector('.project-btn-more').addEventListener('click', function(e) {
            e.stopPropagation(); // Impede que o evento de clique se propague para o card
            const projectId = this.getAttribute('data-project-id');
            const rect = this.getBoundingClientRect();
            openProjectActionsMenu(projectId, rect.right, rect.bottom);
        });

        // Adiciona evento de clique para o botão de adicionar etapa
        projectBox.querySelector('.add-stage-to-project').addEventListener('click', function(e) {
            e.stopPropagation(); // Impede que o evento de clique se propague para o card
            const projectId = this.getAttribute('data-project-id');
            currentProjectId = projectId;
            document.getElementById('stage-project-id').value = projectId;
            document.getElementById('new-stage-modal').style.display = 'block';
            document.getElementById('new-stage-form').reset();
        });

        // Adiciona evento de clique para ver detalhes
        projectBox.querySelector('.view-details').addEventListener('click', function(e) {
            e.stopPropagation(); // Impede que o evento de clique se propague para o card
            const projectId = this.getAttribute('data-project-id');
            showProjectDetails(projectId);
        });

        // Adiciona evento de clique para expandir/colapsar o card
        projectBox.querySelector('.project-box').addEventListener('click', function() {
            this.classList.toggle('expanded');
        });

        // Adiciona evento de clique para as etapas na prévia
        if (project.stages && project.stages.length > 0) {
            projectBox.querySelectorAll('.stage-preview-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.stopPropagation(); // Impede que o evento de clique se propague para o card
                    const stageId = this.getAttribute('data-stage-id');
                    showStageDetails(stageId);
                });
            });
        }
    });
};

// Modificação na função renderStages para incluir opção de editar
const renderStages = (stages) => {
    const stagesList = document.getElementById('stages-list');
    stagesList.innerHTML = '';

    if (stages.length === 0) {
        stagesList.innerHTML = '<p class="no-stages">Nenhuma etapa cadastrada. Clique em "Adicionar Etapa" para começar.</p>';
        return;
    }

    stages.forEach(stage => {
        const stageItem = document.createElement('div');
        stageItem.className = 'stage-item';
        stageItem.setAttribute('data-stage-id', stage.id);
        
        // Define a classe de status
        const statusClass = `status-${stage.status}`;
        const statusText = {
            'pendente': 'Pendente',
            'em_andamento': 'Em Andamento',
            'aguardando_cliente': 'Aguardando Cliente',
            'concluida': 'Concluída'
        }[stage.status] || 'Pendente';
        
        stageItem.innerHTML = `
            <div class="stage-item-header">
                <span class="stage-item-name">${stage.name}</span>
                <span class="stage-item-status ${statusClass}">${statusText}</span>
                <button class="edit-stage-btn" data-stage-id="${stage.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit-2">
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                </button>
            </div>
            <p class="stage-item-description">${stage.description || 'Sem descrição'}</p>
            <div class="stage-item-footer">
                <span class="stage-item-deadline">Prazo: ${formatDate(stage.deadline) || 'Não definido'}</span>
            </div>
        `;

        stagesList.appendChild(stageItem);

        // Adiciona evento de clique para abrir detalhes da etapa
        stageItem.addEventListener('click', function(e) {
            // Verifica se o clique não foi no botão de editar
            if (!e.target.closest('.edit-stage-btn')) {
                const stageId = this.getAttribute('data-stage-id');
                showStageDetails(stageId);
            }
        });

        // Adiciona evento de clique para o botão de editar
        stageItem.querySelector('.edit-stage-btn').addEventListener('click', function(e) {
            e.stopPropagation(); // Impede que o evento de clique se propague para o item da etapa
            const stageId = this.getAttribute('data-stage-id');
            openEditStageModal(stageId);
        });
    });
};

// Inicialização dos novos componentes
document.addEventListener('DOMContentLoaded', function () {
    // Inicialização original
    updateCurrentDate();
    setupViewToggle();
    setupThemeToggle();
    setupNavigation();
    setupNewProjectModal();
    setupNewStageModal();
    setupUploadPhotoModal();
    
    // Inicialização dos novos componentes
    setupEditProjectModal();
    setupProjectActionsMenu();
    setupDeleteConfirmationModal();
    setupEditStageModal();
    
    // Carrega os projetos inicialmente
    loadProjects();
});
