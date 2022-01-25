/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable'
import 'regenerator-runtime/runtime'
import path from 'path'
import { app, Tray, BrowserWindow, shell, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'
import log from 'electron-log'
import { watch } from 'fs'
import { settingsFilename, getSettings } from './utils/settings'
import { enabledPlugins } from './plugins'
import Plugin from '../types/Plugin'
import Project from '../types/Project'

import generateMenu from './tray-menu'

// import { markdown } from 'markdown';
// import Store from 'electron-store';

// import createMenuItem from './create-menu-item';
// import Project from './Project';

import MenuBuilder from './menu'
import { resolveHtmlPath } from './util'

const icon = path.join(__dirname, '../../assets/icons/24x24.png')

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info'
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

let mainWindow: BrowserWindow | null = null

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`
  console.log(msgTemplate(arg))
  event.reply('ipc-example', msgTemplate('pong'))
})

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support')
  sourceMapSupport.install()
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true'

if (isDevelopment) {
  require('electron-debug')()
}

// const installExtensions = async () => {
//   const installer = require('electron-devtools-installer')
//   const forceDownload = !!process.env.UPGRADE_EXTENSIONS
//   const extensions = ['REACT_DEVELOPER_TOOLS']

//   return installer
//     .default(
//       extensions.map((name) => installer[name]),
//       forceDownload
//     )
//     .catch(console.log)
// }

const createWindow = async () => {
  // if (isDevelopment) {
  //   await installExtensions()
  // }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths)
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hidden',
  })

  mainWindow.loadURL(resolveHtmlPath(''))

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined')
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize()
    } else {
      mainWindow.show()
    }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  const menuBuilder = new MenuBuilder(mainWindow)
  menuBuilder.buildMenu()

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
  })

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater()
}

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

let tray: Tray | null = null

const createTrayIcon = async () => {
  try {
    const settings = await getSettings()

    const projects: Array<Project> = enabledPlugins(settings)
      .filter(Plugin.onlyScope('loader'))
      .reduce(
        (acc: Array<Project>, plugin: Plugin) => [
          ...acc,
          ...plugin.getProjects(),
        ],
        []
      )

    const { menu, title } = await generateMenu(
      createTrayIcon,
      projects,
      createWindow,
      enabledPlugins(settings)
    )

    if (!tray) {
      tray = new Tray(icon)
    }

    tray?.setContextMenu(menu)
    tray?.setTitle(title)
  } catch (e) {
    console.error(e)
    console.log('error managed')
  }
}

app
  .whenReady()
  // .then(() => {
  //   createWindow()
  //   app.on('activate', () => {
  //     // On macOS it's common to re-create a window in the app when the
  //     // dock icon is clicked and there are no other windows open.
  //     if (mainWindow === null) createWindow()
  //   })
  // })
  .then(getSettings)
  .then((settings) => {
    enabledPlugins(settings).forEach((plugin: Plugin) => {
      plugin.on('reload-tray', () => {
        createTrayIcon()
      })

      plugin.init(settings)
    })
    return settings
  })
  .then(() => createTrayIcon())
  .then(() => {
    watch(settingsFilename, (eventType /* , filename */) => {
      if (eventType === 'change') {
        console.log('settings updated')
        createTrayIcon()
      }
    })
  })

  .catch(console.log)
