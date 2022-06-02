interface Shortcut {
  label: string
  enabled?: boolean
  click?: () => void
  oneShot?: boolean
}

export default Shortcut
