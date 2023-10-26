export const checkDefaultTheme = () => {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true'
  document.body.classList.toggle('dark-theme', isDarkTheme)
  if (isDarkTheme) {
    document.querySelector('html').dataset.bsTheme = 'dark'
  } else {
    delete document.querySelector('html').dataset.bsTheme
  }

  return isDarkTheme
}
