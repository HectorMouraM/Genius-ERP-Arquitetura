# Documentação do Genius ERP Arquitetura

## Visão Geral

O Genius ERP Arquitetura é um sistema de gerenciamento de projetos arquitetônicos desenvolvido para otimizar o fluxo de trabalho de arquitetos. O sistema permite o cadastro detalhado de projetos, acompanhamento de etapas com controle de tempo, upload de fotos, geração de relatórios e outras funcionalidades para facilitar o gerenciamento de projetos de arquitetura.

## Requisitos do Sistema

- Python 3.6 ou superior
- SQLite 3
- Navegador web moderno (Chrome, Firefox, Edge, Safari)

## Estrutura do Projeto

```
genius_erp_arquitetura/
├── database/
│   ├── genius_erp.db
│   ├── init_db.py
│   └── schema.py
├── static/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── script.js
│   ├── img/
│   └── uploads/
├── templates/
│   └── index.html
├── app.py
└── run.py
```

## Instalação e Configuração

1. Clone o repositório ou copie todos os arquivos para o seu computador:

```bash
git clone <url-do-repositorio>
```

2. Navegue até o diretório do projeto:

```bash
cd genius_erp_arquitetura
```

3. Instale as dependências necessárias:

```bash
pip install flask
```

4. Inicialize o banco de dados:

```bash
python -m database.init_db
```

5. Execute a aplicação:

```bash
python run.py
```

6. Acesse a aplicação no navegador:

```
http://localhost:5000
```

## Funcionalidades Principais

### Gerenciamento de Projetos

- **Cadastro de Projetos**: Permite cadastrar novos projetos com informações como nome do cliente, descrição, tipo de projeto (comercial ou residencial), subtipo e valor da hora de trabalho.
- **Listagem de Projetos**: Exibe todos os projetos cadastrados em formato de grade ou lista.
- **Detalhes do Projeto**: Mostra informações detalhadas sobre um projeto específico.

### Gerenciamento de Etapas

- **Cadastro de Etapas**: Permite adicionar etapas a um projeto, com nome, descrição e prazo.
- **Acompanhamento de Etapas**: Visualiza o status de cada etapa (pendente, em andamento, concluída).
- **Detalhes da Etapa**: Mostra informações detalhadas sobre uma etapa específica.

### Controle de Tempo

- **Timer**: Permite iniciar, pausar e finalizar o controle de tempo para cada etapa.
- **Histórico de Tempo**: Registra todos os períodos de trabalho em cada etapa.
- **Cálculo de Horas**: Calcula automaticamente o tempo total gasto em cada etapa e projeto.

### Upload de Fotos

- **Upload de Imagens**: Permite adicionar fotos a cada etapa do projeto.
- **Galeria de Fotos**: Exibe todas as fotos associadas a uma etapa.

### Geração de Relatórios

- **Relatórios de Projeto**: Gera relatórios detalhados sobre um projeto, incluindo etapas, tempo gasto e fotos.
- **Cálculo de Custos**: Calcula automaticamente o custo do projeto com base no tempo gasto e no valor da hora de trabalho.

## Guia de Uso

### Página Inicial

A página inicial exibe todos os projetos cadastrados. Você pode alternar entre a visualização em grade e lista usando os botões no canto superior direito.

### Criação de Projetos

1. Clique no botão "+" no cabeçalho da aplicação.
2. Preencha o formulário com as informações do projeto.
3. Clique em "Salvar" para criar o projeto.

### Gerenciamento de Etapas

1. Clique em um projeto para ver seus detalhes.
2. Na seção "Etapas do Projeto", clique em "Adicionar Etapa".
3. Preencha o formulário com as informações da etapa.
4. Clique em "Salvar" para criar a etapa.

### Controle de Tempo

1. Clique em uma etapa para ver seus detalhes.
2. Use os botões "Iniciar", "Pausar" e "Finalizar" para controlar o tempo de trabalho.
3. O tempo será registrado automaticamente no histórico da etapa.

### Upload de Fotos

1. Na página de detalhes da etapa, clique em "Adicionar Foto".
2. Selecione uma imagem do seu computador.
3. Adicione uma descrição (opcional).
4. Clique em "Enviar" para fazer o upload da foto.

### Geração de Relatórios

1. Clique no ícone de gráfico na barra lateral para acessar a seção de relatórios.
2. Selecione um projeto no filtro.
3. Clique em "Gerar Relatório" para visualizar o relatório detalhado.

## Personalização

### Alteração de Cores e Estilos

Você pode personalizar as cores e estilos da aplicação editando o arquivo `static/css/style.css`. As principais variáveis de cores estão definidas no início do arquivo:

```css
:root {
    --app-container: #f3f6fd;
    --main-color: #1f1c2e;
    --secondary-color: #4a4a4a;
    --link-color: #1f1c2e;
    --link-color-hover: #c3cff4;
    --link-color-active: #fff;
    --link-color-active-bg: #1f1c2e;
    --projects-section: #fff;
    /* ... outras variáveis ... */
}
```

### Adição de Novas Funcionalidades

Para adicionar novas funcionalidades, você precisará modificar os seguintes arquivos:

- `app.py`: Para adicionar novas rotas e APIs.
- `database/schema.py`: Para modificar o esquema do banco de dados.
- `templates/index.html`: Para adicionar novos elementos à interface.
- `static/js/script.js`: Para adicionar novas interações e funcionalidades no frontend.

## Solução de Problemas

### Banco de Dados

Se encontrar problemas com o banco de dados, você pode reinicializá-lo executando:

```bash
python -m database.init_db
```

### Servidor Flask

Se o servidor Flask não iniciar corretamente, verifique:

1. Se todas as dependências estão instaladas.
2. Se não há outro processo usando a porta 5000.
3. Se o arquivo `app.py` está correto e sem erros de sintaxe.

### Upload de Fotos

Se encontrar problemas com o upload de fotos, verifique:

1. Se o diretório `static/uploads` existe e tem permissões de escrita.
2. Se o tamanho da foto não excede o limite permitido pelo servidor.

## Desenvolvimento Futuro

O Genius ERP Arquitetura foi projetado para ser expandido com novas funcionalidades no futuro, como:

- Gerenciamento de documentos
- Integração com calendários externos
- Controle de pagamentos e faturamento
- Comunicação com o cliente
- Modelos de etapas
- Controle de versões de documentos

Para implementar essas funcionalidades, será necessário modificar o esquema do banco de dados, adicionar novas APIs no backend e expandir a interface do usuário.

## Suporte

Para obter suporte ou relatar problemas, entre em contato com o desenvolvedor através do email ou telefone fornecidos.

---

Desenvolvido com ❤️ para otimizar o fluxo de trabalho de arquitetos.
