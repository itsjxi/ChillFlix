export class ThemeToggle {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.init();
  }

  init() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.bindToggleButton();
  }

  bindToggleButton() {
    const button = document.getElementById('themeToggle');
    if (button) {
      button.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
      button.addEventListener('click', () => this.toggle());
    }
  }

  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
    
    const button = document.getElementById('themeToggle');
    if (button) {
      button.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
    }
  }
}