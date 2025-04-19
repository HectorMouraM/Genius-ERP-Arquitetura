// Função para adicionar etapa diretamente a partir do card do projeto
const setupAddStageFromCard = () => {
    // Os eventos já foram configurados na função renderProjects
    // Esta função serve para garantir que qualquer configuração adicional seja feita
    
    // Verificar se há botões de adicionar etapa existentes e configurá-los
    document.querySelectorAll('.add-stage-to-project').forEach(button => {
        if (!button.hasAttribute('data-configured')) {
            button.setAttribute('data-configured', 'true');
            button.addEventListener('click', function(e) {
                e.stopPropagation(); // Impede que o evento de clique se propague para o card
                const projectId = this.getAttribute('data-project-id');
                currentProjectId = projectId;
                document.getElementById('stage-project-id').value = projectId;
                document.getElementById('new-stage-modal').style.display = 'block';
                document.getElementById('new-stage-form').reset();
            });
        }
    });
};

// Função para atualizar o status de uma etapa
const updateStageStatus = async (stageId, newStatus) => {
    try {
        const response = await fetch(`/api/stages/${stageId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: newStatus
            })
        });
        
        if (!response.ok) {
            throw new Error('Falha ao atualizar status da etapa');
        }
        
        // Atualiza a visualização dependendo de onde estamos
        if (document.getElementById('stage-details-page').style.display === 'flex') {
            showStageDetails(stageId);
        } else if (document.getElementById('project-details-page').style.display === 'flex') {
            showProjectDetails(currentProjectId);
        } else {
            loadProjects(); // Recarrega a lista de projetos
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao atualizar status da etapa:', error);
        alert('Erro ao atualizar o status da etapa. Por favor, tente novamente.');
        return false;
    }
};

// Adicionar menu de status para etapas
const setupStageStatusMenu = () => {
    // Criar o menu de status se não existir
    if (!document.getElementById('stage-status-menu')) {
        const menu = document.createElement('div');
        menu.id = 'stage-status-menu';
        menu.className = 'project-actions-menu';
        menu.style.display = 'none';
        menu.innerHTML = `
            <ul>
                <li data-status="pendente">Pendente</li>
                <li data-status="em_andamento">Em Andamento</li>
                <li data-status="aguardando_cliente">Aguardando Cliente</li>
                <li data-status="concluida">Concluída</li>
            </ul>
        `;
        document.body.appendChild(menu);
        
        // Adicionar eventos aos itens do menu
        menu.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', async function() {
                const stageId = menu.getAttribute('data-stage-id');
                const newStatus = this.getAttribute('data-status');
                
                const success = await updateStageStatus(stageId, newStatus);
                if (success) {
                    menu.style.display = 'none';
                }
            });
        });
        
        // Fechar o menu quando clicar fora dele
        document.addEventListener('click', (event) => {
            if (!menu.contains(event.target) && !event.target.classList.contains('stage-item-status')) {
                menu.style.display = 'none';
            }
        });
    }
};

// Função para abrir o menu de status de uma etapa
const openStageStatusMenu = (stageId, x, y) => {
    const menu = document.getElementById('stage-status-menu');
    menu.setAttribute('data-stage-id', stageId);
    
    // Posiciona o menu nas coordenadas do clique
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    // Exibe o menu
    menu.style.display = 'block';
};

// Modificação na função renderStages para incluir menu de status
const enhanceRenderStages = () => {
    // Verificar se a função original já foi modificada
    if (window.originalRenderStages) return;
    
    // Guardar referência à função original
    window.originalRenderStages = window.renderStages;
    
    // Sobrescrever a função
    window.renderStages = function(stages) {
        // Chamar a função original primeiro
        window.originalRenderStages(stages);
        
        // Adicionar funcionalidade de clique no status para mudar
        document.querySelectorAll('.stage-item-status').forEach(statusElement => {
            statusElement.style.cursor = 'pointer';
            statusElement.addEventListener('click', function(e) {
                e.stopPropagation(); // Impede que o evento de clique se propague
                const stageItem = this.closest('.stage-item');
                const stageId = stageItem.getAttribute('data-stage-id');
                const rect = this.getBoundingClientRect();
                openStageStatusMenu(stageId, rect.right, rect.bottom);
            });
        });
    };
};

// Inicialização das novas funcionalidades
document.addEventListener('DOMContentLoaded', function() {
    // Configurar o menu de status para etapas
    setupStageStatusMenu();
    
    // Melhorar a função renderStages
    enhanceRenderStages();
    
    // Configurar a adição de etapas a partir do card
    setupAddStageFromCard();
    
    // Adicionar estilos para o menu de status
    const style = document.createElement('style');
    style.textContent = `
        #stage-status-menu {
            min-width: 200px;
        }
        #stage-status-menu li {
            padding: 10px 15px;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        #stage-status-menu li:hover {
            background-color: #f5f5f5;
        }
        #stage-status-menu li[data-status="pendente"] {
            color: #ff8f00;
        }
        #stage-status-menu li[data-status="em_andamento"] {
            color: #0277bd;
        }
        #stage-status-menu li[data-status="aguardando_cliente"] {
            color: #7b1fa2;
        }
        #stage-status-menu li[data-status="concluida"] {
            color: #2e7d32;
        }
    `;
    document.head.appendChild(style);
});
