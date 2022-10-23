import { test, expect } from '@playwright/test';
import config from '../config';

const todoName = 'Present @ Test Month';

const initialData = []

const createdTodoGetResponse = [{
  _id: '635537a76e019891968bd804',
  description: todoName,
  completed: false,
  __v: 0,
  id: '635537a76e019891968bd804'
}]

const updatedTodoGetResponse = [{
  _id: '635537a76e019891968bd804',
  description: todoName,
  completed: true,
  __v: 0,
  id: '635537a76e019891968bd804'
}]

const mockPageLoadGetRequests = async (page) => {
  await page.route('http://localhost:8080/todo/**', route => {
    // get all initial request
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        body: JSON.stringify(initialData)
      })
    }
  });
}

const mockCreateToDoRequests = async (page) => {
  await page.route('http://localhost:8080/todo/**', route => {
    // create todo
    if (route.request().method() === 'POST') {
      return route.fulfill({
        status: 201,
        body: JSON.stringify({
          description: 'New ToDo'
        })
      })
    }

    // get all request after post
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        body: JSON.stringify(createdTodoGetResponse)
      })
    }
  });
}

const mockUpdateRequest = async (page) => {
  await page.route('http://localhost:8080/todo/**', route => {
    // update todo
    if (route.request().method() === 'PATCH') {
      return route.fulfill({
        status: 200,
        body: JSON.stringify(updatedTodoGetResponse[0])
      })
    }

    // get all initial request
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        body: JSON.stringify(updatedTodoGetResponse)
      })
    }
  });
}

const mockUndoUpdateRequest = async (page) => {
  await page.route('http://localhost:8080/todo/**', route => {
    // update todo
    if (route.request().method() === 'PATCH') {
      return route.fulfill({
        status: 200,
        body: JSON.stringify(createdTodoGetResponse[0])
      })
    }

    // get all initial request
    if (route.request().method() === 'GET') {
      return route.fulfill({
        status: 200,
        body: JSON.stringify(createdTodoGetResponse)
      })
    }
  });
}

test.beforeEach(async ({ page }) => {
  await mockPageLoadGetRequests(page);

  // navigate to page
  await page.goto(config.baseUrl);

  await page.waitForTimeout(2000); // to show
});

const TODO_ITEMS = [ todoName ];

test.describe('Adding todo items', () => {
  test('should allow a user to add todo items', async ({ page }) => {
    await mockCreateToDoRequests(page);

    // Create 1st todo.
    await page.locator('.todo-input').fill(TODO_ITEMS[0]);
    await page.waitForTimeout(2000); // to show
    await page.locator('.todo-input').press('Enter');
    await page.waitForTimeout(2000); // to show

    // Make sure the list only has one todo item.
    await expect(page.locator('.todo-row').nth(0)).toHaveText([
      TODO_ITEMS[0]
    ]);
    await expect(page.locator('.todo-input')).toBeEmpty(); // assert input empty
  });
});
//   test.beforeEach(async ({ page }) => {
//     await createDefaultTodos(page);
//     await checkNumberOfTodosInLocalStorage(page, 3);
//   });

//   test.afterEach(async ({ page }) => {
//     await checkNumberOfTodosInLocalStorage(page, 3);
//   });

//   test('should allow me to mark all items as completed', async ({ page }) => {
//     // Complete all todos.
//     await page.locator('.toggle-all').check();

//     // Ensure all todos have 'completed' class.
//     await expect(page.locator('.todo-list li')).toHaveClass(['completed', 'completed', 'completed']);
//     await checkNumberOfCompletedTodosInLocalStorage(page, 3);
//   });

//   test('should allow me to clear the complete state of all items', async ({ page }) => {
//     // Check and then immediately uncheck.
//     await page.locator('.toggle-all').check();
//     await page.locator('.toggle-all').uncheck();

//     // Should be no completed classes.
//     await expect(page.locator('.todo-list li')).toHaveClass(['', '', '']);
//   });

//   test('complete all checkbox should update state when items are completed / cleared', async ({ page }) => {
//     const toggleAll = page.locator('.toggle-all');
//     await toggleAll.check();
//     await expect(toggleAll).toBeChecked();
//     await checkNumberOfCompletedTodosInLocalStorage(page, 3);

//     // Uncheck first todo.
//     const firstTodo = page.locator('.todo-list li').nth(0);
//     await firstTodo.locator('.toggle').uncheck();

//     // Reuse toggleAll locator and make sure its not checked.
//     await expect(toggleAll).not.toBeChecked();

//     await firstTodo.locator('.toggle').check();
//     await checkNumberOfCompletedTodosInLocalStorage(page, 3);

//     // Assert the toggle all is checked again.
//     await expect(toggleAll).toBeChecked();
//   });
// });

test.describe('Completing todo items', () => {
  test('should allow a user to mark items as complete & undo', async ({ page }) => {
    await mockCreateToDoRequests(page);

    // Create 1st todo.
    await page.locator('.todo-input').fill(TODO_ITEMS[0]);
    await page.waitForTimeout(2000); // to show
    await page.locator('.todo-input').press('Enter');
    await page.waitForTimeout(2000); // to show

    await mockUpdateRequest(page);

    // complete first todo
    page.click(':nth-match(div.todo-row > div.todo-title, 1)');
    await page.waitForTimeout(2000); // to show

    // assert item completed
    await expect(await page.locator(':nth-match(div.todo-row, 1)')).toHaveClass('todo-row complete');

    await mockUndoUpdateRequest(page);

    // undo first todo complete
    page.click(':nth-match(div.todo-row > div.todo-title, 1)');
    await page.waitForTimeout(2000); // to show

    // assert item completed
    await expect(await page.locator(':nth-match(div.todo-row, 1)')).toHaveClass('todo-row');
  });
});

test.describe.skip('Editing todo items', () => {
  test('should allow a user to edit a todo list item title', async () => {});
});

test.describe.skip('Deleting todo items', () => {
  test('should allow a user to delete a todo list item', async () => {});
});
