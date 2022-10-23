import { test, expect } from '@playwright/test';
import config from '../config';

import { readTodo, deleteAllTodos } from '../data-source/mongodb'

const todoName = 'Present @ Test Month';

test.beforeEach(async ({ page }) => {
  await deleteAllTodos();

  // navigate to page
  await page.goto(config.baseUrl);

  await page.waitForTimeout(2000); // to show
});

test.afterAll(async () => {
  await deleteAllTodos();
});

const TODO_ITEMS = [ todoName ];

test.describe('Adding todo items', () => {
  test('should allow a user to add todo items', async ({ page }) => {
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

    // check DB item
    const dbTodo = await readTodo();
    expect(dbTodo.description).toEqual(TODO_ITEMS[0]);
    expect(dbTodo.completed).toEqual(false);
  });
});

test.describe('Completing todo items', () => {
  test('should allow a user to mark items as complete', async ({ page }) => {
    // Create 1st todo.
    await page.locator('.todo-input').fill(TODO_ITEMS[0]);
    await page.waitForTimeout(2000); // to show
    await page.locator('.todo-input').press('Enter');
    await page.waitForTimeout(2000); // to show

    // complete first todo
    page.click(':nth-match(div.todo-row > div.todo-title, 1)');
    await page.waitForTimeout(2000); // to show

    // assert item completed
    await expect(await page.locator(':nth-match(div.todo-row, 1)')).toHaveClass('todo-row complete');

    // check DB item
    const dbTodo = await readTodo();
    expect(dbTodo.description).toEqual(TODO_ITEMS[0]);
    expect(dbTodo.completed).toEqual(true);
  });
});

test.describe.skip('Editing todo items', () => {
  test('should allow a user to edit a todo list item title', async () => {});
});

test.describe.skip('Deleting todo items', () => {
  test('should allow a user to delete a todo list item', async () => {});
});
