// leitor de qr code
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, Buttons, List, MessageMedia } = require('whatsapp-web.js'); // Mudança Buttons
const moment = require('moment-timezone');
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

// Configuração do Supabase via variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Variáveis de ambiente SUPABASE_URL e SUPABASE_KEY não definidas.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Variável para armazenar o QR Code
let qrCodeData = null;

// Cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Servidor Express para manter o bot ativo no Render
app.get('/', (req, res) => {
    res.send('Bot WhatsApp está ativo! 🤖');
});

app.get('/status', (req, res) => {
    res.json({
        status: 'online',
        filaAtendimento: filaAtendimento.length,
        timestamp: new Date()
    });
});

// Rota para exibir QR Code no navegador
app.get('/qr', (req, res) => {
    if (qrCodeData) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - WhatsApp Bot</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                    }
                    h1 { color: #333; margin-bottom: 10px; }
                    p { color: #666; margin-bottom: 30px; }
                    #qrcode { 
                        display: inline-block;
                        padding: 20px;
                        background: white;
                        border-radius: 10px;
                    }
                    .status {
                        margin-top: 20px;
                        padding: 10px 20px;
                        background: #4CAF50;
                        color: white;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                </style>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
            </head>
            <body>
                <div class="container">
                    <h1>📱 Conectar WhatsApp Bot</h1>
                    <p>Escaneie o QR Code abaixo com seu WhatsApp</p>
                    <div id="qrcode"></div>
                    <div class="status">✅ QR Code disponível</div>
                    <p style="margin-top: 20px; font-size: 12px; color: #999;">
                        Abra o WhatsApp → Menu → Aparelhos conectados → Conectar aparelho
                    </p>
                </div>
                <script>
                    new QRCode(document.getElementById("qrcode"), {
                        text: "${qrCodeData}",
                        width: 256,
                        height: 256,
                        colorDark : "#000000",
                        colorLight : "#ffffff",
                        correctLevel : QRCode.CorrectLevel.H
                    });
                </script>
            </body>
            </html>
        `);
    } else {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - WhatsApp Bot</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                    }
                    h1 { color: #333; }
                    p { color: #666; margin: 20px 0; }
                    .status {
                        padding: 10px 20px;
                        background: #2196F3;
                        color: white;
                        border-radius: 5px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>📱 WhatsApp Bot</h1>
                    <div class="status">✅ WhatsApp já está conectado!</div>
                    <p>Não é necessário escanear o QR Code.</p>
                    <p style="font-size: 12px; color: #999;">Se o bot não estiver respondendo, reinicie o serviço.</p>
                </div>
            </body>
            </html>
        `);
    }
});

// API: listar chamados
app.get('/api/chamados', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chamados')
            .select('*')
            .order('horario_abertura', { ascending: false });

        if (error) return res.status(500).json({ error: error.message });
        res.json(data || []);
    } catch (e) {
        res.status(500).json({ error: 'Erro interno ao listar chamados' });
    }
});

// API: estatísticas agregadas
app.get('/api/estatisticas', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('chamados')
            .select('status, dentro_expediente');

        if (error) return res.status(500).json({ error: error.message });

        const stats = {
            aguardando: 0,
            em_atendimento: 0,
            finalizado: 0,
            fora_expediente: 0
        };

        (data || []).forEach((c) => {
            if (c.status === 'aguardando') stats.aguardando++;
            if (c.status === 'em_atendimento') stats.em_atendimento++;
            if (c.status === 'finalizado') stats.finalizado++;
            if (c.dentro_expediente === false) stats.fora_expediente++;
        });

        res.json(stats);
    } catch (e) {
        res.status(500).json({ error: 'Erro interno ao calcular estatísticas' });
    }
});

// API: detalhes do chamado (inclui mensagens)
app.get('/api/chamados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { data: chamado, error: chamadoError } = await supabase
            .from('chamados')
            .select('*')
            .eq('id', id)
            .single();

        if (chamadoError) return res.status(404).json({ error: 'Chamado não encontrado' });

        const { data: mensagens, error: mensagensError } = await supabase
            .from('mensagens_chat')
            .select('*')
            .eq('chamado_id', id)
            .order('timestamp', { ascending: true });

        if (mensagensError) return res.status(500).json({ error: mensagensError.message });

        res.json({ chamado, mensagens: mensagens || [] });
    } catch (e) {
        res.status(500).json({ error: 'Erro interno ao buscar detalhes do chamado' });
    }
});

// API: finalizar chamado
app.post('/api/chamados/:id/finalizar', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('chamados')
            .update({ status: 'finalizado', horario_finalizacao: new Date().toISOString() })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'Erro interno ao finalizar chamado' });
    }
});

// API: cancelar chamado
app.post('/api/chamados/:id/cancelar', async (req, res) => {
    const { id } = req.params;
    try {
        const { error } = await supabase
            .from('chamados')
            .update({ status: 'cancelado', horario_finalizacao: new Date().toISOString() })
            .eq('id', id);

        if (error) return res.status(500).json({ error: error.message });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'Erro interno ao cancelar chamado' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// serviço de leitura do qr code
client.on('qr', qr => {
    qrCodeData = qr;
    qrcode.generate(qr, {small: true});
    console.log('\n🔗 QR Code também disponível em: http://localhost:' + PORT + '/qr');
    console.log('📱 Ou acesse pelo Render: https://seu-servico.onrender.com/qr\n');
});
// apos isso ele diz que foi tudo certo
client.on('ready', () => {
    qrCodeData = null; // Limpa o QR Code após conectar
    console.log('Tudo certo! WhatsApp conectado.');
    
    // Mantém a sessão ativa - envia ping a cada 5 minutos
    setInterval(async () => {
        try {
            const state = await client.getState();
            console.log('🔄 Heartbeat - Sessão ativa:', state);
            
            // Apenas loga o estado, não tenta forçar reconexão
            // O evento 'disconnected' cuida da reconexão automática
            if (state !== 'CONNECTED') {
                console.log('⚠️ Sessão em estado:', state, '- Aguardando reconexão automática...');
            }
        } catch (error) {
            console.log('⚠️ Erro no heartbeat (normal se estiver reconectando):', error.message);
        }
    }, 5 * 60 * 1000); // 5 minutos
    
    // Ping ativo para evitar hibernação - a cada 2 minutos
    setInterval(async () => {
        try {
            // Simula atividade para manter sessão ativa
            await client.pupPage.evaluate(() => {
                // Apenas verifica se a página está ativa (não consome recursos)
                return document.hasFocus();
            });
            console.log('📡 Ping - Mantendo sessão ativa');
        } catch (error) {
            // Ignora erros silenciosamente (normal durante reconexão)
        }
    }, 2 * 60 * 1000); // 2 minutos
    
    console.log('✅ Sistema de manutenção de sessão ativado');
    console.log('   - Heartbeat: a cada 5 minutos');
    console.log('   - Ping anti-hibernação: a cada 2 minutos');
});

// Detectar desconexão e tentar reconectar automaticamente
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp desconectado. Motivo:', reason);
    console.log('🔄 Tentando reconectar em 10 segundos...');
    
    setTimeout(() => {
        console.log('🔄 Reinicializando cliente...');
        client.initialize();
    }, 10000);
});

// Detectar mudança de estado
client.on('change_state', state => {
    console.log('🔄 Mudança de estado do WhatsApp:', state);
});

// E inicializa tudo 
client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms)); // Função que usamos para criar o delay entre uma ação e outra

// Fila de atendimento (temporária)
let filaAtendimento = [];
// Map para armazenar ID do chamado por número de telefone
let chamadosAtivos = new Map();

// Função para verificar se está no horário de expediente
function verificarHorarioExpediente() {
    const agora = moment.tz('America/Sao_Paulo');
    const diaSemana = agora.day(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const hora = agora.hour();
    const minuto = agora.minute();
    const horaAtual = hora + minuto / 60;

    // Verifica se é dia de semana (Segunda a Sexta)
    const isDiaUtil = diaSemana >= 1 && diaSemana <= 5;
    // Verifica se está dentro do horário (08:00 às 18:00)
    const isHorarioComercial = horaAtual >= 8 && horaAtual < 18;

    return isDiaUtil && isHorarioComercial;
}

// Função para criar chamado no Supabase
async function criarChamado(numeroWhatsapp, nomeContato, dentroExpediente) {
    try {
        const posicaoFila = dentroExpediente ? filaAtendimento.length + 1 : null;
        
        const { data, error } = await supabase
            .from('chamados')
            .insert([
                {
                    numero_whatsapp: numeroWhatsapp,
                    nome_contato: nomeContato,
                    status: 'aguardando',
                    dentro_expediente: dentroExpediente,
                    posicao_fila: posicaoFila,
                    horario_abertura: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Erro ao criar chamado:', error);
            return null;
        }

        console.log('Chamado criado:', data.id);
        return data;
    } catch (error) {
        console.error('Erro ao criar chamado:', error);
        return null;
    }
}

// Função para salvar mensagem no Supabase
async function salvarMensagem(chamadoId, numeroWhatsapp, mensagem, tipoMensagem = 'recebida') {
    try {
        const { data, error } = await supabase
            .from('mensagens_chat')
            .insert([
                {
                    chamado_id: chamadoId,
                    numero_whatsapp: numeroWhatsapp,
                    mensagem: mensagem,
                    tipo_mensagem: tipoMensagem
                }
            ]);

        if (error) {
            console.error('Erro ao salvar mensagem:', error);
        }
    } catch (error) {
        console.error('Erro ao salvar mensagem:', error);
    }
}

// Função para atualizar status do chamado
async function atualizarStatusChamado(chamadoId, novoStatus) {
    try {
        const updateData = { status: novoStatus };
        
        if (novoStatus === 'finalizado' || novoStatus === 'cancelado') {
            updateData.horario_finalizacao = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('chamados')
            .update(updateData)
            .eq('id', chamadoId);

        if (error) {
            console.error('Erro ao atualizar chamado:', error);
        } else {
            console.log('Chamado atualizado:', chamadoId, novoStatus);
        }
    } catch (error) {
        console.error('Erro ao atualizar chamado:', error);
    }
}

// Função para adicionar à fila
function adicionarNaFila(numero) {
    if (!filaAtendimento.includes(numero)) {
        filaAtendimento.push(numero);
    }
    return filaAtendimento.indexOf(numero) + 1;
}

// Função para remover da fila
function removerDaFila(numero) {
    const index = filaAtendimento.indexOf(numero);
    if (index > -1) {
        filaAtendimento.splice(index, 1);
    }
}

// Controle de tempo para mensagem de boas-vindas (10 minutos)
const ultimaMensagemBoasVindas = new Map(); // Armazena: número => timestamp
const TEMPO_COOLDOWN = 10 * 60 * 1000; // 10 minutos em milissegundos

function podeEnviarBoasVindas(numero) {
    const agora = Date.now();
    const ultimoEnvio = ultimaMensagemBoasVindas.get(numero);
    
    // Se nunca enviou ou já passou 10 minutos
    if (!ultimoEnvio || (agora - ultimoEnvio) >= TEMPO_COOLDOWN) {
        ultimaMensagemBoasVindas.set(numero, agora);
        return true;
    }
    
    return false;
}

// Funil

client.on('message', async msg => {

    // Menu inicial - disparado ao receber mensagens de saudação
    if (msg.body.match(/(menu|Opa|Ei|ei|Lucas|Menu|dia|tarde|noite|oi|Oi|Olá|olá|ola|Ola|começar|iniciar)/i) && msg.from.endsWith('@c.us')) {

        // Verifica se pode enviar mensagem de boas-vindas
        if (!podeEnviarBoasVindas(msg.from)) {
            console.log(`Boas-vindas bloqueadas para ${msg.from} - aguardar 10 minutos`);
            return; // Não envia nada se não passou 10 minutos
        }

        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const nomeContato = contact.pushname || 'cliente';

        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        
        await client.sendMessage(msg.from, `Olá *${nomeContato}*, seja bem vindo ao nosso atendimento digital! 👋\n\nEscolha uma das opções abaixo para direcionarmos seu atendimento para uma pessoa de nossa equipe.\n\n*1* - 🆘 Abertura de Chamado - Opening of Support\n\n*#* - Finalizar o chat.`);
    }




    // Opção 1 - Abertura de Chamado
    if (msg.body === '1' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        const contact = await msg.getContact();
        const nomeContato = contact.pushname || 'Sem nome';
        
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);

        // Verifica se está no horário de expediente
        const noExpediente = verificarHorarioExpediente();

        // Criar chamado no Supabase
        const chamado = await criarChamado(msg.from, nomeContato, noExpediente);

        if (chamado) {
            chamadosAtivos.set(msg.from, chamado.id);
            
            // Salvar a mensagem do usuário
            await salvarMensagem(chamado.id, msg.from, '1', 'recebida');
        }

        if (!noExpediente) {
            // Fora do horário
            const mensagem1 = '⏰ Lembramos que nosso horário de expediente é de seg a sex, das 08:00 às 18:00.\n\nSeu chamado será registrado e entraremos em contato assim que possível.';
            await client.sendMessage(msg.from, mensagem1);
            
            if (chamado) await salvarMensagem(chamado.id, msg.from, mensagem1, 'enviada');
            
            await delay(2000);
            await chat.sendStateTyping();
            await delay(2000);
            
            const mensagem2 = 'Obrigado por entrar em contato! Retornaremos em breve. 😊';
            await client.sendMessage(msg.from, mensagem2);
            
            if (chamado) await salvarMensagem(chamado.id, msg.from, mensagem2, 'enviada');
            
        } else {
            // Dentro do horário - adiciona na fila
            const posicao = adicionarNaFila(msg.from);
            
            const mensagemCompleta = `Perfeito! Seu chamado foi registrado. ✅\n\nVocê é o *${posicao}º* da fila. ⏳\n\nEm breve um de nossos atendentes entrará em contato com você.\n\nEnquanto isso, você pode descrever resumidamente seu problema para agilizarmos o atendimento. 📝`;
            await client.sendMessage(msg.from, mensagemCompleta);
            
            if (chamado) {
                await salvarMensagem(chamado.id, msg.from, mensagemCompleta, 'enviada');
                await atualizarStatusChamado(chamado.id, 'em_atendimento');
            }
        }
    }

    // Opção # - Finalizar chat
    if (msg.body === '#' && msg.from.endsWith('@c.us')) {
        const chat = await msg.getChat();
        
        // Pega o ID do chamado ativo
        const chamadoId = chamadosAtivos.get(msg.from);
        
        // Remove da fila se estiver nela
        removerDaFila(msg.from);
        
        // Atualizar status para finalizado no Supabase
        if (chamadoId) {
            await salvarMensagem(chamadoId, msg.from, '#', 'recebida');
            await atualizarStatusChamado(chamadoId, 'finalizado');
            chamadosAtivos.delete(msg.from);
        }
        
        await delay(2000);
        await chat.sendStateTyping();
        await delay(2000);
        
        const mensagemFinal = 'Chat finalizado! Obrigado por entrar em contato. Se precisar de ajuda novamente, é só nos chamar! 😊';
        await client.sendMessage(msg.from, mensagemFinal);
        
        if (chamadoId) {
            await salvarMensagem(chamadoId, msg.from, mensagemFinal, 'enviada');
        }
    }








});