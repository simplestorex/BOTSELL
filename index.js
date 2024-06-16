const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на свой токен бота, полученный у @BotFather
const token = '7224913597:AAGLGC18TDFzOI9Cfe57Iuul-VsTkdBs6fo';
const cryptomusToken = 'YOUR_CRYPTOMUS_API_KEY';

const bot = new TelegramBot(token, { polling: true });

// Функция для инициализации файла users.json, если он отсутствует или пустой
function initializeUsersFile() {
    const filePath = path.join(__dirname, 'users.json');

    if (!fs.existsSync(filePath) || fs.readFileSync(filePath, 'utf8').trim() === '') {
        const initialData = { users: [] };
        fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf8');
    }
}

// Функция для записи нового пользователя в файл
function addUser(userId) {
    const filePath = path.join(__dirname, 'users.json');

    try {
        let jsonData = fs.readFileSync(filePath, 'utf8');
        let usersData = JSON.parse(jsonData);

        // Проверяем, существует ли уже пользователь
        const userExists = usersData.users.some(user => user.id === userId);

        if (!userExists) {
            // Добавляем нового пользователя
            usersData.users.push({ id: userId, balance: 0 });
            fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2), 'utf8');
        }
    } catch (error) {
        console.error('Ошибка при записи пользователя в JSON:', error);
    }
}
// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    // Инициализация файла users.json
    initializeUsersFile();
    // Записываем нового пользователя
    addUser(chatId);
    // Отправляем сообщение с кнопками
    bot.sendMessage(chatId, '🇺🇸 Welcome! Choose an action: \n Добро пожаловать! Выберите действие:', {
        reply_markup: {
            inline_keyboard: [
                [
                    { text: 'Link🔗', url: 'https://t.me/twitter_simple' }
                ],
                [
                    { text: 'Check/Проверить🔍', callback_data: 'check_subscribe' }
                ]
            ]
        }
    });
});

// Обработчик нажатий на кнопки
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data === 'check_subscribe') {
        // Проверяем, подписан ли пользователь на канал
        bot.getChatMember('@twitter_simple', query.from.id).then(member => {
            if (member && (member.status === 'member' || member.status === 'administrator' || member.status === 'creator')) {
                // Если пользователь подписан, отправляем сообщение о соглашении
                const agreementMessage = `
                Соглашение о купле-продаже Twitter аккаунта

                1. Стороны Соглашения

                Продавец: @Twitter_accs_bot, далее по тексту "Продавец".
                Покупатель: ${query.from.username}, далее по тексту "Покупатель".

                2. Предмет Соглашения

                Настоящее Соглашение касается продажи и покупки аккаунта Twitter, далее по тексту "Аккаунт".

                3. Условия Сделки

                Продавец обязуется передать Покупателю валидные данные для входа в Аккаунт (логин и пароль) и гарантирует наличие синей галочки верификации на момент продажи.
                Покупатель обязуется оплатить Продавцу сумму указанную в боте в обмен на данные для доступа к Аккаунту.

                4. Гарантии и Ограничения

                Продавец гарантирует, что на момент передачи Аккаунта Покупателю, доступ к Аккаунту будет валидным (возможность входа в Аккаунт), и на Аккаунте будет присутствовать синяя галочка верификации. Продавец проверяет аккаунт на предмет входа и наличии синей галочки перед заключением сделки и выдачей его Покупателю.
                Продавец не несет ответственности за запуск рекламных кампаний (Twitter Ads) с использованием Аккаунта после его продажи.
                Продавец не несет ответственности за действия Покупателя в Аккаунте после его покупки, включая, но не ограничиваясь, любые действия, приводящие к блокировке Аккаунта.

                5. Заключительные Положения

                Соглашение вступает в силу с момента прочтения Покупателем и полной оплаты Аккаунта Покупателем.
                Любые изменения и дополнения к настоящему Соглашению действительны только при их согласовании и согласии обеими Сторонами.

                6. Политика возврата

                За неоказанную или некачественно оказанную услугу, мы можем произвести возврат средств на карту или кошелек.
                `;

                // Отправляем сообщение о соглашении и кнопки согласия/несогласия
                bot.sendMessage(chatId, agreementMessage, {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '✅Agree/Согласен', callback_data: 'agree' },
                                { text: '❌I don t agree/Не согласен', callback_data: 'disagree' }
                            ]
                        ]
                    }
                });
            } else {
                // Если пользователь не подписан на канал
                bot.sendMessage(chatId, '🇺🇸 Please subscribe to our channel first to continue.\nПожалуйста, сначала подпишитесь на наш канал, чтобы продолжить.');
            }
        }).catch(error => {
            console.error('🇺🇸 Error when checking channel subscription: \nОшибка при проверке подписки на канал:', error);
            bot.sendMessage(chatId, '🇺🇸 An error has occurred. Please try again later. \nПроизошла ошибка. Пожалуйста, попробуйте позже.');
        });
    } else if (data === 'agree') {
        // Отправляем меню с выбором действий после согласия
        bot.sendMessage(chatId, '🇺🇸 Choose an action:\nВыберите действие:', {
            reply_markup: {
                keyboard: [
                    [{ text: '🛒Аккаунты/Accounts' }, { text: '📚Отзывы/Reviews' }],
                    [{ text: '🆘Поддержка/Support' }, { text: '👥Профиль/Profile' }]
                ],
                resize_keyboard: true
            }
        });
    } else if (data === 'disagree') {
        // Отправляем сообщение о завершении соглашения
        bot.sendMessage(chatId, '🇺🇸 You refused the agreement.\nВы отказались от соглашения.');
    }

    // Удаляем сообщение с кнопками или соглашением
    bot.deleteMessage(chatId, messageId);
});
// Обработчик нажатий на кнопки меню с действиями
bot.on('message',(msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    switch (text) {
        case '🛒Аккаунты/Accounts':
            // Отправляем список категорий аккаунтов
             const categories = loadCategories();
            let buttons = categories.map(category => ({ text: category.name, callback_data: `category_${category.id}` }));

             bot.sendMessage(chatId, 'Выберите категорию аккаунтов:', {
             reply_markup: {
            inline_keyboard: [buttons]
             }
             });
            break;
        case '📚Отзывы/Reviews':
            bot.sendMessage(chatId, 'Отзывы о нашем сервисе.');
            break;      
        case '👥Профиль/Profile':
            const user = getUserById(chatId); // Fetch user data by chatId

            if (user) {
                bot.sendMessage(chatId, `Имя: ${msg.from.first_name} ${msg.from.last_name || ''}
                    \nID: ${msg.from.id}
                    \nБаланс: ${user.balance}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Пополнить баланс', callback_data: 'top_up_balance' }]
                        ]
                    }
                });
            } else {
                bot.sendMessage(chatId, `Имя: ${msg.from.first_name} ${msg.from.last_name || ''}
                    \nID: ${msg.from.id}
                    \nБаланс: 0`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Пополнить баланс', callback_data: 'top_up_balance' }]
                        ]
                    }
                });
            }
            break;
            case '🆘Поддержка/Support':
                bot.sendMessage(chatId, '🇺🇸 Support \n Служба поддержки\n https://t.me/Osix7');
            break;
        default:
            bot.sendMessage(chatId, 'Выберите один из вариантов в меню.');
            break;
    }
});
// Обработчик нажатий на кнопки категорий аккаунтов
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    if (data.startsWith('category_')) {
        const categoryId = parseInt(data.split('_')[1], 10);
        const accounts = loadAccountsByCategory(categoryId);

        if (accounts.length > 0) {
            let accountButtons = accounts.map(account => ({
                text: `${account.description} - ${account.price}`,
                callback_data: `account_${account.id}`
            }));

            bot.sendMessage(chatId, `Список аккаунтов в категории:`, {
                reply_markup: {
                    inline_keyboard: [accountButtons]
                }
            });
        } else {
            bot.sendMessage(chatId, `В этой категории нет аккаунтов.`);
        }
    }

    // Delete the original message with category selection buttons
    bot.deleteMessage(chatId, messageId);
});
// Пополнение баланса пользователя 
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'top_up_balance') {
        bot.sendMessage(chatId, 'Введите сумму для пополнения:');
        
        bot.once('message', async (msg) => {
            const amount = parseFloat(msg.text);

            if (isNaN(amount) || amount <= 0) {
                bot.sendMessage(chatId, 'Некорректная сумма. Попробуйте еще раз.');
            } else {
                bot.sendMessage(chatId, `Выберите способ оплаты для пополнения на сумму: ${amount}`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: '🌐 Cryptomus', callback_data: `pay_crypto_${amount}` }],
                            [{ text: '↩️ Отмена', callback_data: 'cancel_top_up' }]
                        ]
                    }
                });
            }
        });
    } else if (data.startsWith('pay_crypto_')) {
        const amount = parseFloat(data.split('_')[2]);

        try {
            const paymentData = await createCryptomusPayment(amount, chatId);
            bot.sendMessage(chatId, `Перейдите по ссылке для оплаты: ${paymentData.url}`);
        } catch (error) {
            console.error('Ошибка при создании платежа:', error);
            bot.sendMessage(chatId, 'Ошибка при создании платежа. Попробуйте еще раз позже.');
        }
    } else if (data === 'cancel_top_up') {
        bot.sendMessage(chatId, 'Пополнение баланса отменено.');
    }
});
// Обработчик нажатий на кнопки с информацией об аккаунтах и покупке
bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;

    // Проверяем, что нажата кнопка с информацией об аккаунте
    if (data.startsWith('account_')) {
        const accountId = parseInt(data.split('_')[1], 10); // Получаем ID аккаунта из callback_data
        const account = getAccountById(accountId); // Получаем данные аккаунта по ID

        // Отправляем сообщение с информацией об аккаунте и кнопками для покупки или возврата
        bot.sendMessage(chatId, `ID: ${account.id}\nЦена: ${account.price}\nОписание: ${account.description}`, {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: 'Купить аккаунт', callback_data: `buy_${account.id}` },
                        { text: '<Назад', callback_data: 'back_to_accounts' }
                    ]
                ]
            }
        });
    } else if (data.startsWith('buy_')) {
        const accountId = parseInt(data.split('_')[1], 10); // Получаем ID аккаунта из callback_data
        const account = getAccountById(accountId); // Получаем данные аккаунта по ID

        // Здесь может быть логика для проверки и проведения оплаты, например, через платежный сервис
        // В данном примере просто отправляем сообщение о покупке
        bot.sendMessage(chatId, `Выберите способ оплаты для аккаунта ID: ${account.id}`, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🌐 Cryptomus', callback_data: `pay_crypto_${account.id}` }],                   
                    [{ text: '↩️ Отмена', callback_data: 'cancel_purchase' }]
                ]
            }
        });    
    } else if (data.startsWith('pay_crypto_')) {
        const parts = data.split('_');
        const accountId = parseInt(parts[1], 10); // Получаем ID аккаунта из callback_data
        const amount = parseFloat(parts[2]); // Получаем цену аккаунта из callback_data

        try {
            const paymentData = await createCryptomusPayment(amount, chatId, accountId);
            bot.sendMessage(chatId, `Перейдите по ссылке для оплаты: ${paymentData.url}`);
        } catch (error) {
            bot.sendMessage(chatId, 'Ошибка при создании платежа. Попробуйте еще раз позже.');
        }

    } else if (data === 'cancel_purchase') {
        // Отменяем покупку
        bot.sendMessage(chatId, 'Вы отменили покупку аккаунта.');

    } else if (data === 'back_to_accounts') {
        // Возвращаем пользователя к списку аккаунтов
        bot.deleteMessage(chatId, messageId); // Удаляем текущее сообщение
        bot.emit('message', { chat: { id: chatId }, text: '🛒Аккаунты/Accounts' }); // Имитируем нажатие на кнопку "Аккаунты"
    }
});

// Функция для отправки данных аккаунта пользователю
function sendAccountDetails(chatId, account) {
    if (!account || !account.id || !account.price || !account.description) {
        bot.sendMessage(chatId, 'Ошибка: данные аккаунта не найдены.');
        return;
    }

    bot.sendMessage(chatId, `Вы успешно приобрели аккаунт ID: ${account.id} за ${account.price}. Спасибо за покупку!\n\nДанные аккаунта: \nLogin:${account.login} \nPassword:${account.password} \nTOKEN:${account.token} \nEmail:${account.email} \nОписание: ${account.description}`);
}

// Функция для удаления аккаунта из JSON
function deleteAccount(accountId) {
    const filePath = path.join(__dirname, 'accounts.json');

    try {
        let jsonData = fs.readFileSync(filePath, 'utf8');
        let accountsData = JSON.parse(jsonData);

        // Удаляем аккаунт из массива
        accountsData.accounts = accountsData.accounts.filter(account => account.id !== accountId);

        // Сохраняем обновленные данные обратно в файл
        fs.writeFileSync(filePath, JSON.stringify(accountsData, null, 2), 'utf8');
    } catch (error) {
        console.error('Ошибка при удалении аккаунта из JSON:', error);
    }
}
// Функция для загрузки данных из JSON файла
function loadAccounts() {
    const filePath = path.join(__dirname, 'accounts.json');

    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const accountsData = JSON.parse(jsonData);
        return accountsData.accounts; // Возвращаем массив аккаунтов
    } catch (error) {
        console.error('Ошибка при загрузке данных из файла:', error);
        return []; // Возвращаем пустой массив в случае ошибки или отсутствия файла
    }
}
// Функция для получения данных аккаунта по его ID
function getAccountById(accountId) {
    const accounts = loadAccounts();
    return accounts.find(account => account.id === accountId);
}

// Функция для получения данных пользователя по его ID
function getUserById(userId) {
    const filePath = path.join(__dirname, 'users.json');

    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const usersData = JSON.parse(jsonData);
        return usersData.users.find(user => user.id === userId);
    } catch (error) {
        console.error('Ошибка при получении данных пользователя из файла:', error);
        return null;
    }
}

// Функция для обновления баланса пользователя
function updateUserBalance(userId, amount) {
    const filePath = path.join(__dirname, 'users.json');

    try {
        let jsonData = fs.readFileSync(filePath, 'utf8');
        let usersData = JSON.parse(jsonData);

        // Находим пользователя и обновляем баланс
        const userIndex = usersData.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            usersData.users[userIndex].balance += amount;
            fs.writeFileSync(filePath, JSON.stringify(usersData, null, 2), 'utf8');
        }
    } catch (error) {
        console.error('Ошибка при обновлении баланса пользователя:', error);
    }
}

// Функция для загрузки данных из JSON файла
function loadCategories() {
    const filePath = path.join(__dirname, 'category.json');

    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const categoriesData = JSON.parse(jsonData);
        return categoriesData.categories; // Возвращаем массив категорий
    } catch (error) {
        console.error('Ошибка при загрузке данных из файла категорий:', error);
        return []; // Возвращаем пустой массив в случае ошибки или отсутствия файла
    }
}
function loadAccountsByCategory(categoryId) {
    const filePath = path.join(__dirname, 'accounts.json');

    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        const accountsData = JSON.parse(jsonData);
        const accounts = accountsData.accounts.filter(account => account.categoryId === categoryId);
        return accounts; // Return array of accounts for the specified category
    } catch (error) {
        console.error('Error loading accounts by category:', error.message);
        return []; // Return empty array if error occurs
    }
}

// CRYPTOMUS
async function createCryptomusPayment(amount, userId, accountId = null) {
    try {
        const paymentData = {
            merchant_id: 'your_merchant_id',
            amount: amount,
            currency: 'USD',
            order_id: accountId ? `order_account_${userId}_${accountId}` : `order_balance_${userId}`,
            callback_url: `https://yourdomain.com/webhook`,
            success_url: `https://yourdomain.com/success`
        };

        const response = await axios.post('https://api.cryptomus.com/v1/payment', paymentData, {
            headers: {
                'Authorization': `Bearer ${cryptomusToken}`
            }
        });

        return { url: response.data.payment_url };
    } catch (error) {
        console.error('Ошибка при создании платежа через Cryptomus:', error.message);
        throw error;
    }
}
// route webhook

// listern port
