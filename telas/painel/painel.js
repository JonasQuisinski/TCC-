document.addEventListener('DOMContentLoaded', function () {
    // Seleciona todos os itens do menu
    const btnInfoRegConsumo = document.getElementById('infoRegConsumo');
    const menuItems = document.querySelectorAll('.sidebar li');

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove a classe 'active'
            menuItems.forEach(i => i.classList.remove('active'));

            this.classList.add('active');


            // baseado no item clicado
            console.log(`Item clicado: ${this.textContent.trim()}`);
        });
    });

    btnInfoRegConsumo.addEventListener("click", () => {
        alert("Você sera redirecionado para a pagina de Alimentos e nessa página no canto inferior direito possui um botão redondo, clique e registre o consumo");
    })
























    /*  // Simulação de dados dinâmicos (poderia ser substituído por chamadas API)
    function updateStats() {
        // Atualiza os valores dos cards de estatísticas
        const membersValue = document.querySelector('.stat-card:nth-child(1) .stat-value');
        const categoriesValue = document.querySelector('.stat-card:nth-child(2) .stat-value');
        const foodsValue = document.querySelector('.stat-card:nth-child(3) .stat-value');
        
        // Simula mudanças nos valores
        setInterval(() => {
            // Membros (pode variar entre 6 e 8)
            const randomMembers = Math.floor(Math.random() * 3) + 6;
            membersValue.textContent = randomMembers;
            
            // Categorias (pequenas variações)
            const randomCategories = (31.35 + (Math.random() * 0.5 - 0.25)).toFixed(2);
            const randomMultiplier = (1.41 + (Math.random() * 0.1 - 0.05)).toFixed(2);
            categoriesValue.innerHTML = `${randomCategories} <span class="stat-change">× ${randomMultiplier}</span>`;
            
            // Alimentos (pode variar entre 24 e 26)
            const randomFoods = Math.floor(Math.random() * 3) + 24;
            foodsValue.textContent = randomFoods;
        }, 5000);
    }
    */
    updateStats();



});