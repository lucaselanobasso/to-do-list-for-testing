const { test, expect } = require('@playwright/test');

test.describe('To-Do App', () => {
  test.beforeEach(async ({ page }) => {
    // Navegue para a página da aplicação
    await page.goto('https://to-do-list-for-testing.vercel.app/'); // Ajuste a URL conforme necessário
  });

  test('deve carregar a página corretamente', async ({ page }) => {
    // Verificar se o título está correto
    await expect(page).toHaveTitle('To-Do-List');
    
    // Verificar se os elementos principais estão visíveis
    await expect(page.locator('h1')).toContainText('📝 Minha Lista de Tarefas');
    await expect(page.locator('#taskInput')).toBeVisible();
    await expect(page.locator('#addButton')).toBeVisible();
    
    // Verificar estado inicial dos contadores
    await expect(page.locator('#totalTasks')).toContainText('Total: 0');
    await expect(page.locator('#completedTasks')).toContainText('Concluídas: 0');
  });

  test('deve adicionar uma nova tarefa', async ({ page }) => {
    const taskText = 'Minha primeira tarefa';
    
    // Adicionar uma tarefa
    await page.locator('#taskInput').fill(taskText);
    await page.locator('#addButton').click();
    
    // Verificar se a tarefa foi adicionada
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toContainText(taskText);
    
    // Verificar se os contadores foram atualizados
    await expect(page.locator('#totalTasks')).toContainText('Total: 1');
    await expect(page.locator('#completedTasks')).toContainText('Concluídas: 0');
  });

  test('deve adicionar tarefa pressionando Enter', async ({ page }) => {
    const taskText = 'Tarefa com Enter';
    
    await page.locator('#taskInput').fill(taskText);
    await page.locator('#taskInput').press('Enter');
    
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toContainText(taskText);
  });

  test('deve exibir alerta ao tentar adicionar tarefa vazia', async ({ page }) => {
    // Configurar listener para o alerta
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Por favor, digite uma tarefa!');
      await dialog.accept();
    });
    
    // Tentar adicionar tarefa vazia
    await page.locator('#addButton').click();
  });

  test('deve marcar tarefa como concluída', async ({ page }) => {
    const taskText = 'Tarefa para completar';
    
    // Adicionar uma tarefa
    await page.locator('#taskInput').fill(taskText);
    await page.locator('#addButton').click();
    
    // Marcar como concluída
    await page.locator('.task-checkbox').check();
    
    // Verificar se a tarefa foi marcada como concluída
    await expect(page.locator('.task-item')).toHaveClass(/completed/);
    await expect(page.locator('.task-text')).toHaveClass(/completed/);
    await expect(page.locator('.task-checkbox')).toBeChecked();
    
    // Verificar contadores
    await expect(page.locator('#totalTasks')).toContainText('Total: 1');
    await expect(page.locator('#completedTasks')).toContainText('Concluídas: 1');
  });

  test('deve desmarcar tarefa concluída', async ({ page }) => {
    const taskText = 'Tarefa para desmarcar';
    
    // Adicionar e completar uma tarefa
    await page.locator('#taskInput').fill(taskText);
    await page.locator('#addButton').click();
    await page.locator('.task-checkbox').check();
    
    // Desmarcar a tarefa
    await page.locator('.task-checkbox').uncheck();
    
    // Verificar se a tarefa foi desmarcada
    await expect(page.locator('.task-item')).not.toHaveClass(/completed/);
    await expect(page.locator('.task-text')).not.toHaveClass(/completed/);
    await expect(page.locator('.task-checkbox')).not.toBeChecked();
    
    // Verificar contadores
    await expect(page.locator('#completedTasks')).toContainText('Concluídas: 0');
  });

  test('deve excluir uma tarefa', async ({ page }) => {
    const taskText = 'Tarefa para excluir';
    
    // Adicionar uma tarefa
    await page.locator('#taskInput').fill(taskText);
    await page.locator('#addButton').click();
    
    // Excluir a tarefa
    await page.locator('.delete-btn').click();
    
    // Verificar se a tarefa foi excluída
    await expect(page.locator('.task-item')).toHaveCount(0);
    await expect(page.locator('.empty-state')).toContainText('Nenhuma tarefa encontrada');
    
    // Verificar contadores
    await expect(page.locator('#totalTasks')).toContainText('Total: 0');
  });

  test('deve filtrar tarefas pendentes', async ({ page }) => {
    // Adicionar tarefas
    await page.locator('#taskInput').fill('Tarefa pendente');
    await page.locator('#addButton').click();
    
    await page.locator('#taskInput').fill('Tarefa concluída');
    await page.locator('#addButton').click();
    
    // Marcar segunda tarefa como concluída
    await page.locator('.task-checkbox').nth(1).check();
    
    // Filtrar por pendentes
    await page.locator('#filterPending').click();
    
    // Verificar se apenas tarefas pendentes são exibidas
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toContainText('Tarefa pendente');
    await expect(page.locator('#filterPending')).toHaveClass(/active/);
  });

  test('deve filtrar tarefas concluídas', async ({ page }) => {
    // Adicionar tarefas
    await page.locator('#taskInput').fill('Tarefa pendente');
    await page.locator('#addButton').click();
    
    await page.locator('#taskInput').fill('Tarefa concluída');
    await page.locator('#addButton').click();
    
    // Marcar segunda tarefa como concluída
    await page.locator('.task-checkbox').nth(1).check();
    
    // Filtrar por concluídas
    await page.locator('#filterCompleted').click();
    
    // Verificar se apenas tarefas concluídas são exibidas
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toContainText('Tarefa concluída');
    await expect(page.locator('#filterCompleted')).toHaveClass(/active/);
  });

  test('deve mostrar todas as tarefas no filtro "Todas"', async ({ page }) => {
    // Adicionar tarefas
    await page.locator('#taskInput').fill('Tarefa 1');
    await page.locator('#addButton').click();
    
    await page.locator('#taskInput').fill('Tarefa 2');
    await page.locator('#addButton').click();
    
    // Marcar uma como concluída
    await page.locator('.task-checkbox').first().check();
    
    // Filtrar por concluídas primeiro
    await page.locator('#filterCompleted').click();
    await expect(page.locator('.task-item')).toHaveCount(1);
    
    // Voltar para todas
    await page.locator('#filterAll').click();
    
    // Verificar se todas as tarefas são exibidas
    await expect(page.locator('.task-item')).toHaveCount(2);
    await expect(page.locator('#filterAll')).toHaveClass(/active/);
  });

  test('deve limpar tarefas concluídas', async ({ page }) => {
    // Adicionar múltiplas tarefas
    await page.locator('#taskInput').fill('Tarefa pendente');
    await page.locator('#addButton').click();
    
    await page.locator('#taskInput').fill('Tarefa concluída 1');
    await page.locator('#addButton').click();
    
    await page.locator('#taskInput').fill('Tarefa concluída 2');
    await page.locator('#addButton').click();
    
    // Marcar duas como concluídas
    await page.locator('.task-checkbox').nth(1).check();
    await page.locator('.task-checkbox').nth(2).check();
    
    // Configurar listener para confirmar o dialog
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Tem certeza que deseja excluir 2 tarefa(s) concluída(s)?');
      await dialog.accept();
    });
    
    // Limpar tarefas concluídas
    await page.locator('#clearCompleted').click();
    
    // Verificar se apenas a tarefa pendente permanece
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toContainText('Tarefa pendente');
    await expect(page.locator('#completedTasks')).toContainText('Concluídas: 0');
  });

  test('deve exibir alerta ao tentar limpar sem tarefas concluídas', async ({ page }) => {
    // Adicionar apenas tarefa pendente
    await page.locator('#taskInput').fill('Tarefa pendente');
    await page.locator('#addButton').click();
    
    // Configurar listener para o alerta
    page.on('dialog', async dialog => {
      expect(dialog.message()).toBe('Não há tarefas concluídas para limpar!');
      await dialog.accept();
    });
    
    // Tentar limpar tarefas concluídas
    await page.locator('#clearCompleted').click();
  });

  test('deve validar limite máximo de caracteres no input', async ({ page }) => {
    const longText = 'a'.repeat(101); // Mais que o limite de 100 caracteres
    
    await page.locator('#taskInput').fill(longText);
    
    // Verificar se o input respeitou o maxlength
    const inputValue = await page.locator('#taskInput').inputValue();
    expect(inputValue.length).toBe(100);
  });

  test('deve manter estado dos filtros após adicionar nova tarefa', async ({ page }) => {
    // Adicionar uma tarefa e marcá-la como concluída
    await page.locator('#taskInput').fill('Tarefa concluída');
    await page.locator('#addButton').click();
    await page.locator('.task-checkbox').check();
    
    // Filtrar por concluídas
    await page.locator('#filterCompleted').click();
    await expect(page.locator('.task-item')).toHaveCount(1);
    
    // Adicionar nova tarefa (que será pendente)
    await page.locator('#taskInput').fill('Nova tarefa');
    await page.locator('#addButton').click();
    
    // Verificar se ainda está no filtro de concluídas e só mostra a tarefa concluída
    await expect(page.locator('.task-item')).toHaveCount(1);
    await expect(page.locator('.task-text')).toContainText('Tarefa concluída');
  });

  test('deve funcionar corretamente com múltiplas tarefas', async ({ page }) => {
    const tasks = ['Primeira tarefa', 'Segunda tarefa', 'Terceira tarefa'];
    
    // Adicionar múltiplas tarefas
    for (const task of tasks) {
      await page.locator('#taskInput').fill(task);
      await page.locator('#addButton').click();
    }
    
    // Verificar se todas foram adicionadas
    await expect(page.locator('.task-item')).toHaveCount(3);
    await expect(page.locator('#totalTasks')).toContainText('Total: 3');
    
    // Marcar a primeira e terceira como concluídas
    await page.locator('.task-checkbox').first().check();
    await page.locator('.task-checkbox').nth(2).check();
    
    // Verificar contadores
    await expect(page.locator('#completedTasks')).toContainText('Concluídas: 2');
    
    // Excluir a segunda tarefa (pendente)
    await page.locator('.delete-btn').nth(1).click();
    
    // Verificar estado final
    await expect(page.locator('.task-item')).toHaveCount(2);
    await expect(page.locator('#totalTasks')).toContainText('Total: 2');
    await expect(page.locator('#completedTasks')).toContainText('Concluídas: 2');
  });

  test('deve limpar o campo input após adicionar tarefa', async ({ page }) => {
    await page.locator('#taskInput').fill('Nova tarefa');
    await page.locator('#addButton').click();
    
    // Verificar se o input foi limpo
    await expect(page.locator('#taskInput')).toHaveValue('');
  });
});