document.addEventListener('DOMContentLoaded', () => {
    fetch('https://auth.liaa.app/guilds', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const serverNames = data.map(guild => guild.name);
            let currentIndex = 0;

            // Start of Ad

            const updateServerName = () => {
                document.getElementById('hyperlink_ad_extension').textContent = serverNames[currentIndex].toLowerCase().replace(' ', '_');
                currentIndex = (currentIndex + 1) % serverNames.length;
            };
            updateServerName();
            setInterval(updateServerName, 3000);

            // End of Ad

            data.forEach((guild, index) => {
                const guildElement = document.createElement('div');
                guildElement.className = 'guild';
                if (guild.image === null) {
                    guild.image = 'https://cdn.discordapp.com/embed/avatars/0.png';
                }
                guildElement.innerHTML = `
                <img src="${guild.image}" alt="${guild.name} icon" class="icon pop_in_fast">
                <a href="https://liaa.app/guild/${guild.id}" class="guild_href">
                <h3 class="guild_name guild_href pop_in_fast inline_block">${guild.name}<img class="guild_decoration" alt="decor" src="https://liaa.app/icons/premium.png"></h3>
                </a>
            `;
                document.querySelector('.guilds').appendChild(guildElement);
                if (index < data.length - 1) {
                    const separator = document.createElement('hr');
                    separator.className = 'guild-separator';
                    document.querySelector('.guilds').appendChild(separator);
                }

            });


        })
        .catch(error => {
            console.error('Error fetching guilds:', error);
        });
});