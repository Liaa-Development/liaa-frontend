document.addEventListener('DOMContentLoaded', () => {
    guild_id = window.location.pathname.split('/')[2];
    const guild_name_title = document.getElementById('guild_name_title');
    const guild_icon = document.getElementById('guild_icon');
    if (!guild_id) {
        console.error('No guild ID found in URL');
        guild_name_title.innerHTML = 'Guild not found';
        return;
    }
    fetch(`https://auth.liaa.app/guild/${guild_id}`, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (!data.guild || !data.settings) {
                guild_name_title.innerHTML = 'Guild not found';
            } else {
                const guild = data.guild;
                const settings = data.settings;
                const setting_values = data.setting_values;
                guild_name_title.innerHTML = guild.name;
                const settings_block = document.getElementById('settings');
                const tabs_div = document.getElementById('tabs');

                const createTabs = (id, options, selectedValue, active = false) => {
                    const tabContainer = document.createElement('div');
                    tabContainer.id = id;
                    tabContainer.classList.add('tab-container');
                    options.forEach(option => {
                        const tab = document.createElement('div');
                        tab.classList.add('tab');
                        tab.dataset.value = option.code;
                        tab.textContent = option.name;
                        if (option.code === selectedValue) {
                            tab.classList.add('active');
                            tab.style.animation = 'color_in 0.5s forwards';
                        }
                        tab.addEventListener('click', () => {
                            document.querySelectorAll('.tab.active').forEach(t => {
                                t.classList.remove('active');
                                t.style.animation = 'color_out 0.2s forwards';
                            });
                            tab.classList.add('active');
                            tab.style.animation = 'color_in 0.5s forwards';
                            document.querySelectorAll('.section').forEach(section => section.style.display = 'none');
                            document.getElementById(option.code).style.display = 'flex';
                            window.location.hash = option.code; // Set URL fragment
                            setTimeout(() => {
                                window.scrollTo(0, 0); // Scroll to top with delay
                            }, 1);
                        });
                        tabContainer.appendChild(tab);
                    });
                    return tabContainer;
                };

                const createSelect = (id, options, selectedValue, multiple = false, className = '') => {
                    const select = document.createElement('select');
                    select.id = id;
                    select.classList.add('pop_in_fast');
                    if (className) {
                        select.classList.add(className);
                    }
                    if (multiple) {
                        select.multiple = true;
                    }
                    options.forEach(option => {
                        const optionElement = document.createElement('option');
                        optionElement.value = option.code;
                        optionElement.text = option.name;
                        if (Array.isArray(selectedValue) && selectedValue.includes(option.code)) {
                            optionElement.selected = true;
                        } else if (option.code === selectedValue) {
                            optionElement.selected = true;
                        }
                        select.appendChild(optionElement);
                    });
                    return select;
                };

                const addSetting = (labelText, selectElement) => {
                    const label = document.createElement('label');
                    label.classList.add('label');
                    label.textContent = labelText;
                    settings_section.appendChild(label);
                    settings_section.appendChild(selectElement);
                };

                const section_options = [
                    {code: 'options', name: 'Settings'},
                    {code: 'members', name: 'Members'},
                    {code: 'information', name: 'Information'},
                    {code: 'backup', name: 'Backup'}
                ];

                const activeTab = window.location.hash.substring(1) || 'options'; // Read URL fragment
                const section_tabs = createTabs('section_tabs', section_options, activeTab);
                tabs_div.appendChild(section_tabs);

                // Create sections
                const createSection = (id) => {
                    const section = document.createElement('div');
                    section.id = id;
                    section.classList.add('section');
                    section.style.display = 'none';
                    settings_block.appendChild(section);
                    return section;
                };

                const settings_section = createSection('options');
                const information_section = createSection('information');
                const members_section = createSection('members');
                const backup_section = createSection('backup');

                // Show settings section by default
                document.getElementById(activeTab).style.display = 'flex';
                window.scrollTo(0, 0);

                // Add settings to settings section
                const language_select = createSelect('language_select', setting_values.language, settings.language);
                addSetting('Language', language_select);

                const raid_protection_select = createSelect('raid_protection_select', setting_values.raid_protection, settings.raid_protection);
                addSetting('Raid Protection', raid_protection_select);

                const image_reaction_select = createSelect('image_reaction_select', setting_values.image_reaction, settings.image_reaction);
                addSetting('Image Reaction', image_reaction_select);

                const image_content_filter_state_select = createSelect('image_content_filter_state_select', setting_values.image_content_filter_state, settings.image_content_filter_state);
                addSetting('Image Content Filtering', image_content_filter_state_select);

                const image_content_filters_select = createSelect('image_content_filters_select', setting_values.image_content_filters, settings.image_content_filters, true, 'long_select');
                addSetting('Content Filters', image_content_filters_select);

                // Fetch server image
                fetch(`https://auth.liaa.app/guilds`, {
                    method: 'GET',
                    credentials: 'include'
                })
                    .then(response => response.json())
                    .then(imageData => {
                        const guildImage = imageData.find(g => g.id === guild_id)?.image || 'https://cdn.discordapp.com/embed/avatars/0.png';
                        // Set the icon in the new div
                        guild_icon.innerHTML = `<img src="${guildImage}" alt="Server Icon">`;
                        // Information section placeholder
                        information_section.innerHTML = `
                            <p class="pop_in_fast">Name: ${guild.name}</p>
                            <p class="pop_in_fast">Invitation URL: ${guild.invitation_url}</p>
                            <p class="pop_in_fast">Owner ID: ${guild.owner_id}</p>
                            <p class="pop_in_fast">Protected since: ${new Date(guild.creation_date).toLocaleDateString()}</p>
                            <p class="pop_in_fast">Attacs defended : ${guild.attacs_defended}</p>
                            <p class="pop_in_fast">Hyperlink : ${guild.hyperlink}</p>
                        `;
                    })
                    .catch(error => {
                        console.error('Error fetching guild image:', error);
                    });

                // Fetch members
                fetch(`https://auth.liaa.app/guild/${guild_id}/users`, {
                    method: 'GET',
                    credentials: 'include'
                })
                    .then(response => response.json())
                    .then(members => {
                        const truncateName = (name, maxLength = 20) => {
                            return name.length > maxLength ? name.slice(0, maxLength) + '...' : name;
                        };
                        const members_list = document.createElement('ul');
                        members_list.style.maxHeight = '300px';
                        members_list.style.overflowY = 'auto';
                        members.forEach((member, index) => {
                            const member_item = document.createElement('li');
                            member_item.classList.add('member-item');
                            member_item.dataset.fullName = member.name.toLowerCase();
                            member_item.dataset.userId = member.user_id;
                            member_item.innerHTML = `
                                <img src="${member.image || 'https://cdn.discordapp.com/embed/avatars/0.png'}" alt="User Image" class="member-image pop_in_fast">
                                <span class="pop_in_fast">${truncateName(member.name)}</span>
                                <div class="action-btn-div">
                                    <button id="user_action_left" class="action-btn pop_in_fast" data-action="ban" data-user-id="${member.user_id}"><img class="user_action" src="https://liaa.app/icons/ban-new.png" alt="ban"></button>
                                    <button id="user_action_middle" class="action-btn pop_in_fast" data-action="kick" data-user-id="${member.user_id}"><img class="user_action" src="https://liaa.app/icons/kick-new.png" alt="kick"></button>
                                    <button id="user_action_right" class="action-btn pop_in_fast" data-action="mute" data-user-id="${member.user_id}"><img class="user_action" src="https://liaa.app/icons/timeout-new.png" alt="mute"></button>
                                </div>
                            `;
                            members_list.appendChild(member_item);
                        });
                        members_section.appendChild(members_list);
                        members_list.addEventListener('click', (event) => {
                            if (event.target.closest('.action-btn')) {
                                const action = event.target.closest('.action-btn').dataset.action;
                                const userId = event.target.closest('.action-btn').dataset.userId;
                                const userName = event.target.closest('.member-item').querySelector('span').textContent;

                                const existingConfirmButton = document.getElementById('confirm_button');
                                const confirmButton = document.createElement('button');
                                if (existingConfirmButton) {
                                    existingConfirmButton.classList.add('pop_out_medium');
                                    $(existingConfirmButton).slideToggle(() => {
                                        existingConfirmButton.remove();
                                        confirmButton.id = 'confirm_button';
                                        confirmButton.classList.add('pop_in_medium');
                                        confirmButton.textContent = `Confirm ${action}`;
                                        $(confirmButton).hide();
                                        members_section.appendChild(confirmButton);
                                        $(confirmButton).slideToggle();

                                        confirmButton.addEventListener('click', () => {
                                            console.log(`${action} user with ID: ${userId}`);
                                            confirmButton.classList.add('pop_out_medium');
                                            $(confirmButton).slideToggle(() => {
                                                confirmButton.remove();
                                            });
                                        });
                                    });
                                } else {
                                    confirmButton.id = 'confirm_button';
                                    confirmButton.classList.add('pop_in_medium');
                                    confirmButton.textContent = `Confirm ${action}`;
                                    $(confirmButton).hide();
                                    members_section.appendChild(confirmButton);
                                    $(confirmButton).slideToggle();

                                    confirmButton.addEventListener('click', () => {
                                        fetch(`https://auth.liaa.app/guild/${guild_id}/user/${userId}/action/${action}`, {
                                            method: 'POST',
                                            credentials: 'include'
                                        })
                                            .then(response => response.json())
                                            .then(data => {
                                                confirmButton.classList.add('pop_out_medium');
                                                $(confirmButton).slideToggle(() => {
                                                    confirmButton.remove();
                                                });

                                                const memberItem = members_list.querySelector(`.member-item[data-user-id="${userId}"]`);
                                                if (memberItem) {
                                                    console.log(`Found member item for user ID: ${userId}`);
                                                    switch (action) {
                                                        case 'ban':
                                                            // memberItem.style.backgroundColor = '#ed5555';
                                                            $(memberItem).stop(true, true).slideUp();
                                                            setTimeout(() => {
                                                                memberItem.remove();
                                                            }, 500);
                                                            break;
                                                        case 'kick':
                                                            // memberItem.style.backgroundColor = '#f0ad4e';
                                                            $(memberItem).stop(true, true).slideUp();
                                                            setTimeout(() => {
                                                                memberItem.remove();
                                                            }, 500);
                                                            break;
                                                        case 'mute':
                                                            memberItem.style.animation = 'twitch 0.1s 5';
                                                            memberItem.style.borderRadius = '10px'
                                                            memberItem.style.backgroundColor = '#5cb85c';
                                                            break;
                                                    }
                                                } else {
                                                    console.error(`Member item not found for user ID: ${userId}`);
                                                }
                                            })
                                            .catch(error => {
                                                console.error('Error performing action:', error);
                                            });
                                    });
                                }
                            }
                        });

                        const searchInput = document.createElement('input');
                        searchInput.id = 'search_input';
                        searchInput.type = 'text';
                        searchInput.placeholder = 'Search members...';
                        members_section.insertBefore(searchInput, members_section.firstChild);
                        searchInput.addEventListener('input', () => {
                            const query = searchInput.value.toLowerCase();
                            const memberItems = members_list.querySelectorAll('.member-item');
                            memberItems.forEach(item => {
                                const memberName = item.dataset.fullName.toLowerCase();
                                if (memberName.includes(query)) {
                                    $(item).stop(true, true).slideDown();
                                } else {
                                    $(item).stop(true, true).slideUp();
                                }
                            });
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching members:', error);
                });

                last_backup = {"time": "2021-08-01T00:00:00.000Z", "channels": 10, "roles": 5, "users": 100}
                // Backup section placeholder
                backup_section.innerHTML = `
                    <h2 class="pop_in_fast">Last Backup</h2>
                    <p class="pop_in_fast">Time: ${new Date(last_backup.time).toLocaleString()}</p>
                    <p class="pop_in_fast">Channels Backed Up: ${last_backup.channels}</p>
                    <p class="pop_in_fast">Roles Backed Up: ${last_backup.roles}</p>
                    <p class="pop_in_fast">Users Backed Up: ${last_backup.users}</p>
                `;

                // Save button
                let save_button = null;
                const addSaveButton = () => {
                    if (!save_button) {
                        save_button = document.createElement('button');
                        save_button.id = 'save_button';
                        save_button.classList.add('pop_in_medium');
                        save_button.textContent = 'Save';
                        $(save_button).hide();
                        settings_section.appendChild(save_button);
                        $(save_button).slideToggle();

                        save_button.addEventListener('click', () => {
                            const updated_settings = {
                                language: language_select.value,
                                raid_protection: raid_protection_select.value,
                                image_reaction: image_reaction_select.value,
                                image_content_filter_state: image_content_filter_state_select.value,
                                image_content_filters: Array.from(image_content_filters_select.selectedOptions).map(option => option.value)
                            };
                            fetch(`https://auth.liaa.app/guild/${guild_id}/settings`, {
                                method: 'POST',
                                credentials: 'include',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(updated_settings)
                            })
                                .then(response => response.json())
                                .then(data => {
                                    save_button.classList.add('pop_out_medium');
                                    $(save_button).slideToggle(() => {
                                        save_button.remove();
                                        save_button = null;
                                        console.log('Settings saved:', data);
                                    });
                                })
                                .catch(error => {
                                    if (!save_button.classList.contains('error')) {
                                        save_button.style.animation = 'none';
                                        save_button.offsetHeight;
                                        save_button.style.animation = 'error 0.5s forwards, twitch 0.1s 5';
                                        save_button.classList.add('error');
                                    } else {
                                        save_button.style.backgroundColor = '#ed5555';
                                        save_button.style.animation = 'none';
                                        save_button.offsetHeight;
                                        save_button.style.animation = 'twitch 0.1s 5';
                                    }
                                    console.error('Error saving settings:', error);
                                });
                        });
                    }
                };
                language_select.addEventListener('change', addSaveButton);
                raid_protection_select.addEventListener('change', addSaveButton);
                image_reaction_select.addEventListener('change', addSaveButton);
                image_content_filter_state_select.addEventListener('change', addSaveButton);
                image_content_filters_select.addEventListener('change', addSaveButton);
            }
        })
        .catch(error => {
            console.error('Error fetching guild data:', error);
        });
});