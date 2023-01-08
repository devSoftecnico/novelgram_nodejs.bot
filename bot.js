// Importamos las dependencias necesarias
const TelegramBot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');

// Cargamos el TOKEN del bot desde el archivo .env
require('dotenv').config();

// Creamos una instancia del bot
const bot = new TelegramBot(process.env.TTELEGRAM_BOT_TOKEN, { polling: true });

let rutaCarpeta = '';

// bot.on('message', (msg) => {
//     if (msg.text === '/crear_carpeta') {
//         bot.sendMessage(msg.chat.id, 'Introduce el nombre de la carpeta:');
//         bot.once('message', (msg) => {
//             const nombre = msg.text;
//             rutaCarpeta = `${os.homedir()}\\Desktop\\${nombre}`;
//             fs.mkdir(rutaCarpeta, { recursive: true }, (error) => {
//                 if (error) {
//                     bot.sendMessage(msg.chat.id, `Error: ${error.message}`);
//                     return;
//                 }
//                 bot.sendMessage(msg.chat.id, `Carpeta creada en ${rutaCarpeta}`);
//                 bot.sendMessage(msg.chat.id, `¿Deseas acceder a la carpeta ${nombre}?`, {
//                     reply_markup: {
//                         inline_keyboard: [
//                             [
//                                 {
//                                     text: 'Sí',
//                                     callback_data: 'si'
//                                 },
//                                 {
//                                     text: 'No',
//                                     callback_data: 'no'
//                                 }
//                             ]
//                         ]
//                     }
//                 });
//             });
//         });
//     }
// });

bot.on('message', (msg) => {
    if (msg.text === '/crear_carpeta') {
        bot.sendMessage(msg.chat.id, 'Introduce el nombre de la carpeta:');
        bot.once('message', (msg) => {
            const nombre = msg.text;
            rutaCarpeta = `${os.homedir()}\\Desktop\\${nombre}`;
            if (fs.existsSync(rutaCarpeta)) {
                bot.sendMessage(msg.chat.id, `Ya existe una carpeta con el nombre "${nombre}". Por favor, elige otro nombre para la carpeta. Vuelva a ejecutar el comando /crear_carpeta`);
            } else {
                fs.mkdir(rutaCarpeta, { recursive: true }, (error) => {
                    if (error) {
                        bot.sendMessage(msg.chat.id, `Error: ${error.message}`);
                        return;
                    }
                    bot.sendMessage(msg.chat.id, `Carpeta creada en ${rutaCarpeta}`);
                    bot.sendMessage(msg.chat.id, `¿Deseas acceder a la carpeta ${nombre}?`, {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: 'Sí',
                                        callback_data: 'si'
                                    },
                                    {
                                        text: 'No',
                                        callback_data: 'no'
                                    }
                                ]
                            ],
                            // one_time_keyboard: true
                        }
                    });
                });
            }
        });
    }
});



// Manejador de evento para los botones de respuesta
bot.on('callback_query', (query) => {
    if (query.data === 'si') {
        bot.sendMessage(query.message.chat.id, 'Accediendo a la carpeta seleccionada...');
        exec(`cd ${rutaCarpeta}`, (error, stdout, stderr) => {
            if (error) {
                bot.sendMessage(query.message.chat.id, `Error: ${error.message}`);
                return;
            }
            bot.sendMessage(query.message.chat.id, '¿Deseas inicializar la carpeta seleccionada?', {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: 'Sí',
                                callback_data: 'si_inicializar'
                            },
                            {
                                text: 'No',
                                callback_data: 'no_inicializar'
                            }
                        ]
                    ]
                }
            });
        });
    } else if (query.data === 'no') {
        bot.sendMessage(query.message.chat.id, 'Operación cancelada.');
    } else if (query.data === 'si_inicializar') {
        bot.sendMessage(query.message.chat.id, 'Ejecuta el comando "/inicializar" para inicializar la carpeta seleccionada.');
    } else if (query.data === 'no_inicializar') {
        bot.sendMessage(query.message.chat.id, 'Operación cancelada.');
    }
});

// Añadimos un manejador de evento para el comando /inicializar
bot.on('message', (msg) => {
    if (msg.text === '/inicializar') {
        bot.sendMessage(msg.chat.id, 'Introduce el nombre del proyecto:');
        bot.once('message', (msg) => {
            const name = msg.text;
            bot.sendMessage(msg.chat.id, 'Introduce la versión del proyecto:');
            bot.once('message', (msg) => {
                const version = msg.text;
                bot.sendMessage(msg.chat.id, 'Introduce la descripción del proyecto:');
                bot.once('message', (msg) => {
                    const description = msg.text;
                    bot.sendMessage(msg.chat.id, 'Introduce el archivo principal del proyecto:');
                    bot.once('message', (msg) => {
                        const main = msg.text;
                        bot.sendMessage(msg.chat.id, 'Introduce la URL del repositorio del proyecto:');
                        bot.once('message', (msg) => {
                            const repository = msg.text;
                            bot.sendMessage(msg.chat.id, 'Introduce el nombre del autor del proyecto:');
                            bot.once('message', (msg) => {
                                const author = msg.text;
                                bot.sendMessage(msg.chat.id, '¿Aceptas la licencia? (S/N)');
                                bot.once('message', (msg) => {
                                    const license = msg.text === 'S' ? 'MIT' : '';
                                    // Crea el archivo package.json en la carpeta del proyecto
                                    const package = {
                                        name,
                                        version,
                                        description,
                                        main,
                                        repository,
                                        author,
                                        license,
                                        "scripts": {
                                            "dev": "nodemon bot.js"
                                        },
                                        "dependencies": {},
                                        "devDependencies": {
                                            "nodemon": "^2.0.4"
                                        }
                                    };
                                    fs.writeFile(`${rutaCarpeta}\\package.json`, JSON.stringify(package, null, 2), (error) => {
                                        if (error) {
                                            bot.sendMessage(msg.chat.id, `Error: ${error.message}`);
                                            return;
                                        }
                                        bot.sendMessage(msg.chat.id, 'Archivo package.json creado con éxito');
                                    });
                                });
                            });
                        });
                    });
                });
            })
        })
    }
})

// Añadimos un manejador de evento para el comando /instalar
bot.on('message', (msg) => {
    if (msg.text === '/instalar') {
        bot.sendMessage(msg.chat.id, 'Introduce el nombre del paquete que deseas instalar:');
        bot.once('message', (msg) => {
            const paquete = msg.text;

            // Lee el archivo package.json
            fs.readFile(`${rutaCarpeta}\\package.json`, 'utf8', (error, data) => {
                if (error) {
                    bot.sendMessage(msg.chat.id, `Error: ${error.message}`);
                    return;
                }

                // Parsea el contenido del archivo a formato JSON
                const package = JSON.parse(data);
                // Añade el paquete al objeto de dependencies
                package.dependencies[paquete] = '*';
                // Vuelve a escribir el archivo package.json
                fs.writeFile(`${rutaCarpeta}\\package.json`, JSON.stringify(package, null, 2), (error) => {
                    if (error) {
                        bot.sendMessage(msg.chat.id, `Error: ${error.message}`);
                        return;
                    }
                    bot.sendMessage(msg.chat.id, 'Paquete instalado con éxito');
                });
            });
        });
    }
});


bot.on('message', (msg) => {
    if (msg.text === '/creditos') {
        bot.sendMessage(msg.chat.id, 'Desarrollado por:', {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: 'ChatGPT',
                            callback_data: 'creditos_chatgpt'
                        },
                        {
                            text: 'Migué Sánchez',
                            callback_data: 'creditos_migue'
                        }
                    ]
                ]
            }
        });
    }
});
