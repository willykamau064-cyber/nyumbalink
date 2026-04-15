window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const uName = localStorage.getItem('user_name');
    const authBtn = document.getElementById('auth-btn') || document.querySelector('a[href="join.html"]');
    const listBtn = document.querySelector('a[href="sell.html"].bp');

    if (token && uName) {
        if (authBtn) {
            authBtn.href = "user-dashboard.html";
            authBtn.innerHTML = `<i class="fas fa-home"></i> ${uName.split(' ')[0]}'s Dashboard`;
            authBtn.id = 'auth-btn'; 
            authBtn.style.color = "var(--primary)";
            authBtn.style.borderColor = "var(--primary)";
        }
    } else {
        // Not logged in and on Mobile
        if (window.innerWidth < 768 && listBtn) {
            listBtn.href = "join.html";
            listBtn.innerHTML = `<i class="fas fa-user-plus"></i> Join to List`;
            listBtn.style.background = "#10b981"; 
            listBtn.style.boxShadow = "0 4px 15px rgba(16,185,129,0.3)";
        }
    }
});
