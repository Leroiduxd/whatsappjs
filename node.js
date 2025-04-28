const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const bodyParser = require('body-parser');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Initialise le client WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// Génération du QR Code pour connexion
client.on('qr', qr => {
    console.log('Scanner ce QR Code pour connecter WhatsApp :');
    qrcode.generate(qr, { small: true });
});

// Quand connecté
client.on('ready', () => {
    console.log('✅ WhatsApp est prêt !');
});

// API pour envoyer un message
app.post('/send', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ success: false, error: 'Le numéro et le message sont requis' });
    }

    const chatId = number + '@c.us'; // Formater pour WhatsApp Web

    try {
        await client.sendMessage(chatId, message);
        res.json({ success: true, message: 'Message envoyé !' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Erreur lors de l\'envoi du message' });
    }
});

// Démarrer l'API
app.listen(port, () => {
    console.log(`🚀 API disponible sur http://localhost:${port}`);
});

// Démarrer le client WhatsApp
client.initialize();
