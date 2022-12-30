import { Page, expect } from '@playwright/test'
import { PlatformURI } from './utils'

export interface IssueProps {
  name: string
  description?: string
  status?: string
  labels?: string[]
  priority?: string
  assignee?: string
  project?: string
  sprint?: string
}

export enum ViewletSelectors {
  Table = '.tablist-container >> div.button:nth-child(1)',
  Board = '.tablist-container >> div.button:nth-child(2)'
}

export const PRIORITIES = ['No priority', 'Urgent', 'High', 'Medium', 'Low']
export const DEFAULT_STATUSES = ['Backlog', 'Todo', 'In Progress', 'Done', 'Canceled']
export const DEFAULT_USER = 'Appleseed John'

export async function navigate (page: Page): Promise<void> {
  await page.goto(`${PlatformURI}/workbench%3Acomponent%3AWorkbenchApp/sanity-ws`)
  await page.click('[id="app-tracker\\:string\\:TrackerApplication"]')
  await expect(page).toHaveURL(`${PlatformURI}/workbench%3Acomponent%3AWorkbenchApp/sanity-ws/tracker`)
}

export async function setViewGroup (page: Page, groupName: string): Promise<void> {
  await page.click('button:has-text("View")')
  await page.click('.antiCard >> button >> nth=0')
  await page.click(`.menu-item:has-text("${groupName}")`)
  await expect(page.locator('.antiCard >> button >> nth=0')).toContainText(groupName)

  await page.keyboard.press('Escape')
}

export async function setViewOrder (page: Page, orderName: string): Promise<void> {
  await page.click('button:has-text("View")')
  await page.click('.antiCard >> button >> nth=1')
  await page.click(`.menu-item:has-text("${orderName}")`)
  await expect(page.locator('.antiCard >> button >> nth=1')).toContainText(orderName)

  await page.keyboard.press('Escape')
}

export async function fillIssueForm (page: Page, props: IssueProps): Promise<void> {
  const { name, description, status, assignee, labels, priority, project, sprint } = props
  await page.fill('[placeholder="Issue\\ title"]', name)
  if (description !== undefined) {
    await page.fill('.ProseMirror', description)
  }
  if (status !== undefined) {
    await page.click('#status-editor')
    await page.click(`.menu-item:has-text("${status}")`)
  }
  if (priority !== undefined) {
    await page.click('button:has-text("No priority")')
    await page.click(`.selectPopup button:has-text("${priority}")`)
  }
  if (labels !== undefined) {
    await page.click('.button:has-text("Labels")')
    for (const label of labels) {
      await page.click(`.selectPopup button:has-text("${label}") >> nth=0`)
    }
    await page.keyboard.press('Escape')
  }
  if (assignee !== undefined) {
    await page.click('.button:has-text("Assignee")')
    await page.click(`.selectPopup button:has-text("${assignee}")`)
  }
  if (project !== undefined) {
    await page.click('form button:has-text("Project")')
    await page.click(`.selectPopup button:has-text("${project}")`)
  }
  if (sprint !== undefined) {
    await page.click('.button:has-text("No Sprint")')
    await page.click(`.selectPopup button:has-text("${sprint}")`)
  }
}

export async function createIssue (page: Page, props: IssueProps): Promise<void> {
  await page.waitForSelector('span:has-text("Default")')
  await page.click('button:has-text("New issue")')
  await fillIssueForm(page, props)
  await page.click('button:has-text("Save issue")')
  await page.waitForSelector('form.antiCard', { state: 'detached' })
}

export async function createProject (page: Page, projectName: string): Promise<void> {
  await page.click('text=Projects')
  await expect(page).toHaveURL(
    `${PlatformURI}/workbench%3Acomponent%3AWorkbenchApp/sanity-ws/tracker/tracker%3Ateam%3ADefaultTeam/projects`
  )
  await page.click('button:has-text("Project")')
  await page.click('[placeholder="Project\\ name"]')
  await page.fill('[placeholder="Project\\ name"]', projectName)
  await page.click('button:has-text("Create project")')
}

export async function createSprint (page: Page, sprintName: string): Promise<void> {
  await page.click('text=Sprints')
  await expect(page).toHaveURL(
    `${PlatformURI}/workbench%3Acomponent%3AWorkbenchApp/sanity-ws/tracker/tracker%3Ateam%3ADefaultTeam/sprints`
  )
  await page.click('button:has-text("Sprint")')
  await page.click('[placeholder="Sprint\\ name"]')
  await page.fill('[placeholder="Sprint\\ name"]', sprintName)
  await page.click('button:has-text("Create")')
}

export async function createSubissue (page: Page, props: IssueProps): Promise<void> {
  await page.click('button:has-text("Add sub-issue")')
  await fillIssueForm(page, props)
  await page.click('button:has-text("Save")')
}

export async function createLabel (page: Page, label: string): Promise<void> {
  await page.click('button:has-text("New issue")')
  await page.click('button:has-text("Labels")')
  await page.click('.buttons-group >> button >> nth=-1')
  await page.fill('[id="tags:string:AddTag"] >> input >> nth=0', label)
  await page.click('[id="tags:string:AddTag"] >> button:has-text("Create")')
  await page.waitForSelector('form.antiCard[id="tags:string:AddTag"]', { state: 'detached' })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(100)
  await page.keyboard.press('Escape')
}

export async function checkIssue (page: Page, props: IssueProps): Promise<void> {
  const { name, description, status, assignee, labels, priority, project, sprint } = props

  if (name !== undefined) {
    await expect(page.locator('.popupPanel')).toContainText(name)
  }
  if (description !== undefined) {
    await expect(page.locator('.popupPanel')).toContainText(description)
  }
  const asideLocator = page.locator('.popupPanel-body__aside')
  if (status !== undefined) {
    await expect(asideLocator).toContainText(status)
  }
  if (labels !== undefined) {
    await expect(asideLocator).toContainText(labels)
  }
  if (priority !== undefined) {
    await expect(asideLocator).toContainText(priority)
  }
  if (assignee !== undefined) {
    await expect(asideLocator).toContainText(assignee)
  }
  if (project !== undefined) {
    await expect(asideLocator).toContainText(project)
  }
  if (sprint !== undefined) {
    await expect(asideLocator).toContainText(sprint)
  }
}

export async function checkIssueFromList (page: Page, issueName: string): Promise<void> {
  await page.click(ViewletSelectors.Board)
  await expect(page.locator(`.panel-container:has-text("${issueName}")`)).toContainText(issueName)
}

export async function openIssue (page: Page, name: string): Promise<void> {
  await page.click(`.antiList__row:has-text("${name}") .issuePresenterRoot`)
}