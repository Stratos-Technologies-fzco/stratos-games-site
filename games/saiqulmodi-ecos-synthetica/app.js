
// --- Quit Button Handler ---
const btnQuit = document.getElementById('btn-quit');
if (btnQuit) {
  btnQuit.addEventListener('click', () => {
    if (confirm('Exit game and return to main screen?')) {
      window.location.reload();
    }
  });
}
