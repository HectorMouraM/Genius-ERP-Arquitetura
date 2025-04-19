document.addEventListener('DOMContentLoaded', function () {
    // Variáveis globais
    let currentProjectId = null;
    let currentStageId = null;
    let timerInterval = null;
    let timerStartTime = null;
    let timerRunning = false;
    let currentTimeRecordId = null;

    // Formatação de data
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    // Formatação de tempo (segundos para HH:MM:SS)
    const formatTime = (seconds) => {
        if (!seconds) return '00:00:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Atualiza a data atual no cabeçalho
    const updateCurrentDate = () => {
        const now = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        document.getElementById('current-date').textContent = now.toLocaleDateString('pt-BR', options);
    };

    // Alterna entre visualização em grade e lista
    const setupViewToggle = () => {
        const listView = document.querySelector('.list-view');
        const gridView = document.querySelector('.grid-view');
        const projectsList = document.querySelector('.project-boxes');

        listView.addEventListener('click', function () {
            gridView.classList.remove('active');
            listView.classList.add('active');
            projectsList.classList.remove('jsGridView');
            projectsList.classList.add('jsListView');
        });

        gridView.addEventListener('click', function () {
            gridView.classList.add('active');
            listView.classList.remove('active');
            projectsList.classList.remove('jsListView');
            projectsList.classList.add('jsGridView');
        });
    };

    // Alterna entre modo claro e escuro
    const setupThemeToggle = () => {
        const modeSwitch = document.querySelector('.mode-switch');
        modeSwitch.addEventListener('click', function () {
            document.documentElement.classList.toggle('dark');
            modeSwitch.classList.toggle('active');
        });
    };

    // Navegação entre páginas
    const setupNavigation = () => {
        // Links da barra lateral
        document.querySelectorAll('.app-sidebar-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const page = this.getAttribute('data-page');
                showPage(page);
                
                // Atualiza a classe active
                document.querySelectorAll('.app-sidebar-link').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Botão de voltar para projetos
        document.getElementById('back-to-projects').addEventListener('click', function() {
            showPage('projects');
        });

        // Botão de voltar para detalhes do projeto
        document.getElementById('back-to-project-details').addEventListener('click', function() {
            showProjectDetails(currentProjectId);
        });
    };

    // Mostra uma página específica e esconde as outras
    const showPage = (pageId) => {
        const pages = ['projects-page', 'project-details-page', 'stage-details-page', 'reports-page'];
        pages.forEach(page => {
            document.getElementById(page).style.display = page === pageId + '-page' ? 'flex' : 'none';
        });

        // Ações específicas para cada página
        if (pageId === 'projects') {
            loadProjects();
        } else if (pageId === 'reports') {
            loadProjectsForReports();
        }
    };

    // Carrega a lista de projetos
    const loadProjects = async () => {
        try {
            const response = await fetch('/api/projects');
            const projects = await response.json();
            
            renderProjects(projects);
            updateProjectCounts(projects);
        } catch (error) {
            console.error('Erro ao carregar projetos:', error);
            alert('Erro ao carregar projetos. Por favor, tente novamente.');
        }
    };

    // Renderiza a lista de projetos
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
            
            const projectBox = document.createElement('div');
            projectBox.className = 'project-box-wrapper';
            projectBox.innerHTML = `
                <div class="project-box" style="background-color: ${randomColor};" data-project-id="${project.id}">
                    <div class="project-box-header">
                        <span>${formatDate(project.created_at)}</span>
                        <div class="more-wrapper">
                            <button class="project-btn-more">
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
                        <p class="box-progress-header">Valor/Hora</p>
                        <div class="box-progress-bar">
                            <span class="box-progress" style="width: 100%; background-color: #4f3ff0"></span>
                        </div>
                        <p class="box-progress-percentage">R$ ${project.hourly_rate.toFixed(2)}</p>
                    </div>
                    <div class="project-box-footer">
                        <div class="participants">
                            <button class="add-participant" style="color: #4f3ff0;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus">
                                    <path d="M12 5v14M5 12h14" />
                                </svg>
                            </button>
                        </div>
                        <div class="days-left" style="color: #4f3ff0;">
                            Ver Detalhes
                        </div>
                    </div>
                </div>
            `;

            projectList.appendChild(projectBox);

            // Adiciona evento de clique para abrir detalhes do projeto
            projectBox.querySelector('.project-box').addEventListener('click', function() {
                const projectId = this.getAttribute('data-project-id');
                showProjectDetails(projectId);
            });
        });
    };

    // Atualiza os contadores de projetos
    const updateProjectCounts = (projects) => {
        const inProgressCount = projects.filter(p => {
            // Um projeto está em andamento se tiver pelo menos uma etapa em andamento
            return p.stages && p.stages.some(s => s.status === 'em_andamento');
        }).length;
        
        const pendingCount = projects.filter(p => {
            // Um projeto está pendente se não tiver etapas ou se todas estiverem pendentes
            return !p.stages || p.stages.every(s => s.status === 'pendente');
        }).length;
        
        document.getElementById('in-progress-count').textContent = inProgressCount;
        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('total-count').textContent = projects.length;
    };

    // Mostra os detalhes de um projeto específico
    const showProjectDetails = async (projectId) => {
        currentProjectId = projectId;
        
        try {
            const response = await fetch(`/api/projects/${projectId}`);
            const project = await response.json();
            
            // Preenche os detalhes do projeto
            document.getElementById('project-details-title').textContent = `Projeto: ${project.client_name}`;
            document.getElementById('project-name').textContent = project.client_name;
            document.getElementById('project-description').textContent = project.description || 'Sem descrição';
            document.getElementById('project-client').textContent = project.client_name;
            document.getElementById('project-type').textContent = project.project_type;
            document.getElementById('project-subtype').textContent = project.project_subtype || 'Não especificado';
            document.getElementById('project-hourly-rate').textContent = `R$ ${project.hourly_rate.toFixed(2)}`;
            
            // Renderiza as etapas do projeto
            renderStages(project.stages || []);
            
            // Mostra a página de detalhes do projeto
            showPage('project-details');
        } catch (error) {
            console.error('Erro ao carregar detalhes do projeto:', error);
            alert('Erro ao carregar detalhes do projeto. Por favor, tente novamente.');
        }
    };

    // Renderiza as etapas de um projeto
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
                'concluida': 'Concluída'
            }[stage.status] || 'Pendente';
            
            stageItem.innerHTML = `
                <div class="stage-item-header">
                    <span class="stage-item-name">${stage.name}</span>
                    <span class="stage-item-status ${statusClass}">${statusText}</span>
                </div>
                <p class="stage-item-description">${stage.description || 'Sem descrição'}</p>
                <div class="stage-item-footer">
                    <span class="stage-item-deadline">Prazo: ${formatDate(stage.deadline) || 'Não definido'}</span>
                </div>
            `;

            stagesList.appendChild(stageItem);

            // Adiciona evento de clique para abrir detalhes da etapa
            stageItem.addEventListener('click', function() {
                const stageId = this.getAttribute('data-stage-id');
                showStageDetails(stageId);
            });
        });
    };

    // Mostra os detalhes de uma etapa específica
    const showStageDetails = async (stageId) => {
        currentStageId = stageId;
        
        try {
            const response = await fetch(`/api/stages/${stageId}`);
            const stage = await response.json();
            
            // Preenche os detalhes da etapa
            document.getElementById('stage-details-title').textContent = `Etapa: ${stage.name}`;
            document.getElementById('stage-name').textContent = stage.name;
            document.getElementById('stage-description').textContent = stage.description || 'Sem descrição';
            document.getElementById('stage-deadline').textContent = formatDate(stage.deadline) || 'Não definido';
            
            const statusText = {
                'pendente': 'Pendente',
                'em_andamento': 'Em Andamento',
                'concluida': 'Concluída'
            }[stage.status] || 'Pendente';
            
            document.getElementById('stage-status').textContent = statusText;
            
            // Renderiza os registros de tempo
            renderTimeRecords(stage.time_records || []);
            
            // Renderiza as fotos
            renderPhotos(stage.photos || []);
            
            // Configura os botões do timer
            setupTimerButtons(stage);
            
            // Mostra a página de detalhes da etapa
            showPage('stage-details');
        } catch (error) {
            console.error('Erro ao carregar detalhes da etapa:', error);
            alert('Erro ao carregar detalhes da etapa. Por favor, tente novamente.');
        }
    };

    // Renderiza os registros de tempo de uma etapa
    const renderTimeRecords = (timeRecords) => {
        const timeRecordsList = document.getElementById('time-records-list');
        timeRecordsList.innerHTML = '';

        if (timeRecords.length === 0) {
            timeRecordsList.innerHTML = '<p class="no-time-records">Nenhum registro de tempo. Use os controles acima para iniciar o timer.</p>';
            return;
        }

        timeRecords.forEach(record => {
            const timeRecordItem = document.createElement('div');
            timeRecordItem.className = 'time-record-item';
            
            const startTime = new Date(record.start_time);
            const endTime = record.end_time ? new Date(record.end_time) : null;
            
            timeRecordItem.innerHTML = `
                <div class="time-record-info">
                    <div class="time-record-date">
                        <span>Início: ${startTime.toLocaleString('pt-BR')}</span>
                        ${endTime ? `<span>Fim: ${endTime.toLocaleString('pt-BR')}</span>` : '<span>Em andamento</span>'}
                    </div>
                    <div class="time-record-notes">${record.notes || ''}</div>
                </div>
                <div class="time-record-duration">
                    ${record.duration ? formatTime(record.duration) : 'Em andamento'}
                </div>
            `;

            timeRecordsList.appendChild(timeRecordItem);
        });
    };

    // Renderiza as fotos de uma etapa
    const renderPhotos = (photos) => {
        const photosGallery = document.getElementById('photos-gallery');
        photosGallery.innerHTML = '';

        if (photos.length === 0) {
            photosGallery.innerHTML = '<p class="no-photos">Nenhuma foto adicionada. Clique em "Adicionar Foto" para começar.</p>';
            return;
        }

        photos.forEach(photo => {
            const photoItem = document.createElement('div');
            photoItem.className = 'photo-item';
            
            photoItem.innerHTML = `
                <img src="/static/${photo.file_path}" alt="${photo.description || 'Foto da etapa'}">
                <div class="photo-item-description">${photo.description || 'Sem descrição'}</div>
            `;

            photosGallery.appendChild(photoItem);
        });
    };

    // Configura os botões do timer
    const setupTimerButtons = (stage) => {
        const startBtn = document.getElementById('start-timer');
        const pauseBtn = document.getElementById('pause-timer');
        const stopBtn = document.getElementById('stop-timer');
        
        // Verifica se já existe um registro de tempo em aberto
        const openTimeRecord = stage.time_records && stage.time_records.find(record => !record.end_time);
        
        if (openTimeRecord) {
            // Já existe um timer em andamento
            currentTimeRecordId = openTimeRecord.id;
            startTimer(new Date(openTimeRecord.start_time));
            
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            stopBtn.disabled = false;
        } else {
            // Não há timer em andamento
            resetTimer();
            
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            stopBtn.disabled = true;
        }
        
        // Configura os eventos dos botões
        startBtn.addEventListener('click', handleStartTimer);
        pauseBtn.addEventListener('click', handlePauseTimer);
        stopBtn.addEventListener('click', handleStopTimer);
    };

    // Inicia o timer
    const startTimer = (startTime) => {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        
        timerStartTime = startTime || new Date();
        timerRunning = true;
        
        timerInterval = setInterval(() => {
            const now = new Date();
            const elapsedSeconds = Math.floor((now - timerStartTime) / 1000);
            document.getElementById('timer-display').textContent = formatTime(elapsedSeconds);
        }, 1000);
    };

    // Pausa o timer
    const pauseTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerRunning = false;
    };

    // Reseta o timer
    const resetTimer = () => {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        timerStartTime = null;
        timerRunning = false;
        document.getElementById('timer-display').textContent = '00:00:00';
    };

    // Manipulador para iniciar o timer
    const handleStartTimer = async () => {
        try {
            const response = await fetch(`/api/stages/${currentStageId}/time`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notes: ''
                })
            });
            
            if (!response.ok) {
                throw new Error('Falha ao iniciar o timer');
            }
            
            const data = await response.json();
            currentTimeRecordId = data.id;
            
            startTimer(new Date(data.start_time));
            
            document.getElementById('start-timer').disabled = true;
            document.getElementById('pause-timer').disabled = false;
            document.getElementById('stop-timer').disabled = false;
            
            // Atualiza os detalhes da etapa para mostrar o novo status
            showStageDetails(currentStageId);
        } catch (error) {
            console.error('Erro ao iniciar timer:', error);
            alert('Erro ao iniciar o timer. Por favor, tente novamente.');
        }
    };

    // Manipulador para pausar o timer
    const handlePauseTimer = () => {
        if (timerRunning) {
            pauseTimer();
            document.getElementById('pause-timer').textContent = 'Continuar';
        } else {
            startTimer(timerStartTime);
            document.getElementById('pause-timer').textContent = 'Pausar';
        }
    };

    // Manipulador para parar o timer
    const handleStopTimer = async () => {
        if (!currentTimeRecordId) return;
        
        try {
            const response = await fetch(`/api/time/${currentTimeRecordId}/stop`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    notes: ''
                })
            });
            
            if (!response.ok) {
                throw new Error('Falha ao parar o timer');
            }
            
            resetTimer();
            currentTimeRecordId = null;
            
            document.getElementById('start-timer').disabled = false;
            document.getElementById('pause-timer').disabled = true;
            document.getElementById('stop-timer').disabled = true;
            document.getElementById('pause-timer').textContent = 'Pausar';
            
            // Atualiza os detalhes da etapa para mostrar o novo registro de tempo
            showStageDetails(currentStageId);
        } catch (error) {
            console.error('Erro ao parar timer:', error);
            alert('Erro ao finalizar o timer. Por favor, tente novamente.');
        }
    };

    // Configura o modal de novo projeto
    const setupNewProjectModal = () => {
        const modal = document.getElementById('new-project-modal');
        const addBtn = document.getElementById('add-project-btn');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = document.getElementById('new-project-form');
        
        // Abre o modal
        addBtn.addEventListener('click', () => {
            modal.style.display = 'block';
            form.reset();
        });
        
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
            
            const formData = new FormData(form);
            const projectData = {
                client_name: formData.get('client_name'),
                description: formData.get('description'),
                project_type: formData.get('project_type'),
                project_subtype: formData.get('project_subtype'),
                hourly_rate: parseFloat(formData.get('hourly_rate'))
            };
            
            try {
                const response = await fetch('/api/projects', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(projectData)
                });
                
                if (!response.ok) {
                    throw new Error('Falha ao criar projeto');
                }
                
                modal.style.display = 'none';
                loadProjects();
            } catch (error) {
                console.error('Erro ao criar projeto:', error);
                alert('Erro ao criar o projeto. Por favor, tente novamente.');
            }
        });
    };

    // Configura o modal de nova etapa
    const setupNewStageModal = () => {
        const modal = document.getElementById('new-stage-modal');
        const addBtn = document.getElementById('add-stage-btn');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = document.getElementById('new-stage-form');
        
        // Abre o modal
        addBtn.addEventListener('click', () => {
            document.getElementById('stage-project-id').value = currentProjectId;
            modal.style.display = 'block';
            form.reset();
        });
        
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
            
            const formData = new FormData(form);
            const stageData = {
                name: formData.get('name'),
                description: formData.get('description'),
                deadline: formData.get('deadline')
            };
            
            try {
                const response = await fetch(`/api/projects/${currentProjectId}/stages`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(stageData)
                });
                
                if (!response.ok) {
                    throw new Error('Falha ao criar etapa');
                }
                
                modal.style.display = 'none';
                showProjectDetails(currentProjectId);
            } catch (error) {
                console.error('Erro ao criar etapa:', error);
                alert('Erro ao criar a etapa. Por favor, tente novamente.');
            }
        });
    };

    // Configura o modal de upload de foto
    const setupUploadPhotoModal = () => {
        const modal = document.getElementById('upload-photo-modal');
        const addBtn = document.getElementById('add-photo-btn');
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const form = document.getElementById('upload-photo-form');
        
        // Abre o modal
        addBtn.addEventListener('click', () => {
            document.getElementById('photo-stage-id').value = currentStageId;
            modal.style.display = 'block';
            form.reset();
        });
        
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
            
            const formData = new FormData(form);
            
            try {
                const response = await fetch(`/api/stages/${currentStageId}/photos`, {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error('Falha ao enviar foto');
                }
                
                modal.style.display = 'none';
                showStageDetails(currentStageId);
            } catch (error) {
                console.error('Erro ao enviar foto:', error);
                alert('Erro ao enviar a foto. Por favor, tente novamente.');
            }
        });
    };

    // Carrega projetos para o relatório
    const loadProjectsForReports = async () => {
        try {
            const response = await fetch('/api/projects');
            const projects = await response.json();
            
            const selectElement = document.getElementById('report-project');
            selectElement.innerHTML = '<option value="">Todos os Projetos</option>';
            
            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = project.client_name;
                selectElement.appendChild(option);
            });
            
            // Configura o botão de gerar relatório
            document.getElementById('generate-report-btn').addEventListener('click', generateReport);
        } catch (error) {
            console.error('Erro ao carregar projetos para relatório:', error);
            alert('Erro ao carregar projetos. Por favor, tente novamente.');
        }
    };

    // Gera um relatório
    const generateReport = async () => {
        const projectId = document.getElementById('report-project').value;
        
        if (!projectId) {
            alert('Por favor, selecione um projeto para gerar o relatório.');
            return;
        }
        
        try {
            const response = await fetch(`/api/projects/${projectId}/report`);
            
            if (!response.ok) {
                throw new Error('Falha ao gerar relatório');
            }
            
            const data = await response.json();
            renderReport(data.report);
        } catch (error) {
            console.error('Erro ao gerar relatório:', error);
            alert('Erro ao gerar o relatório. Por favor, tente novamente.');
        }
    };

    // Renderiza um relatório
    const renderReport = (report) => {
        const reportResult = document.getElementById('report-result');
        
        // Calcula o tempo total em formato legível
        const totalTimeFormatted = formatTime(report.total_time);
        
        // Formata o custo total
        const totalCostFormatted = `R$ ${report.total_cost.toFixed(2)}`;
        
        let html = `
            <h2>Relatório do Projeto: ${report.project.client_name}</h2>
            <div class="report-summary">
                <div class="report-item">
                    <span class="report-label">Cliente:</span>
                    <span class="report-value">${report.project.client_name}</span>
                </div>
                <div class="report-item">
                    <span class="report-label">Tipo:</span>
                    <span class="report-value">${report.project.project_type} - ${report.project.project_subtype || 'Geral'}</span>
                </div>
                <div class="report-item">
                    <span class="report-label">Valor/Hora:</span>
                    <span class="report-value">R$ ${report.project.hourly_rate.toFixed(2)}</span>
                </div>
                <div class="report-item">
                    <span class="report-label">Tempo Total:</span>
                    <span class="report-value">${totalTimeFormatted}</span>
                </div>
                <div class="report-item">
                    <span class="report-label">Custo Total:</span>
                    <span class="report-value">${totalCostFormatted}</span>
                </div>
            </div>
            
            <h3>Etapas do Projeto</h3>
        `;
        
        if (report.stages.length === 0) {
            html += '<p>Nenhuma etapa cadastrada para este projeto.</p>';
        } else {
            html += '<div class="report-stages">';
            
            report.stages.forEach(stage => {
                const stageTimeFormatted = formatTime(stage.total_time);
                const statusText = {
                    'pendente': 'Pendente',
                    'em_andamento': 'Em Andamento',
                    'concluida': 'Concluída'
                }[stage.status] || 'Pendente';
                
                html += `
                    <div class="report-stage">
                        <h4>${stage.name}</h4>
                        <p>${stage.description || 'Sem descrição'}</p>
                        <div class="report-stage-details">
                            <div class="report-item">
                                <span class="report-label">Status:</span>
                                <span class="report-value">${statusText}</span>
                            </div>
                            <div class="report-item">
                                <span class="report-label">Prazo:</span>
                                <span class="report-value">${formatDate(stage.deadline) || 'Não definido'}</span>
                            </div>
                            <div class="report-item">
                                <span class="report-label">Tempo Total:</span>
                                <span class="report-value">${stageTimeFormatted}</span>
                            </div>
                        </div>
                `;
                
                // Adiciona fotos se houver
                if (stage.photos && stage.photos.length > 0) {
                    html += '<div class="report-photos"><h5>Fotos:</h5><div class="report-photos-gallery">';
                    
                    stage.photos.forEach(photo => {
                        html += `
                            <div class="report-photo">
                                <img src="/static/${photo.file_path}" alt="${photo.description || 'Foto da etapa'}">
                                <p>${photo.description || 'Sem descrição'}</p>
                            </div>
                        `;
                    });
                    
                    html += '</div></div>';
                }
                
                html += '</div>';
            });
            
            html += '</div>';
        }
        
        reportResult.innerHTML = html;
    };

    // Inicialização
    updateCurrentDate();
    setupViewToggle();
    setupThemeToggle();
    setupNavigation();
    setupNewProjectModal();
    setupNewStageModal();
    setupUploadPhotoModal();
    
    // Carrega os projetos inicialmente
    loadProjects();
});
