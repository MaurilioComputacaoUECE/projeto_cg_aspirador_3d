function init() {
    try {
        if (typeof math === 'undefined') {
            document.getElementById('menu-panel').innerHTML =
                '<p style="color:#f88;padding:20px">Erro: Math.js nao carregou. ' +
                'Verifique sua conexao com a internet ou execute <code>INICIAR.bat</code>.</p>';
            return;
        }
        new AppController();
    } catch (err) {
        console.error(err);
        alert('Erro ao iniciar: ' + err.message);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
