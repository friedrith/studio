import GlobalSettings from './GlobalSettings'

interface Settings extends GlobalSettings {
  plugins: { [id: string]: any }
}

export default Settings
