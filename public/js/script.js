// Use this file for frontend interactivity.
const form = document.querySelector('form');
form.addEventListener('submit', (e) => {
    const input = document.querySelector('input[name="city"]').value.trim();
    if(!input){
        e.preventDefault();
        alert('Please enter a city name.');
    }
});

function toggleTheme() {
  // Your theme toggling logic here
}

function handleLanguageSwitch(e, lang) {
  e.preventDefault();
  // Switch to `lang` logic here
}