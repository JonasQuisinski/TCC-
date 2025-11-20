document.addEventListener('DOMContentLoaded', function () {
    const btnInfoRegConsumo = document.getElementById('infoRegConsumo');
    const menuItems = document.querySelectorAll('.sidebar li');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            console.log(`Item clicado: ${this.textContent.trim()}`);
        });
    });

    btnInfoRegConsumo.addEventListener("click", () => {
        alert("Você sera redirecionado para a pagina de Alimentos e nessa página no canto inferior direito possui um botão redondo, clique e registre o consumo");
    })
























  
    // updateStats();



});