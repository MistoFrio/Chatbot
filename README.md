# Chatbot WhatsApp - Atendimento Automático

## Estrutura de Pastas

```
.
├─ backend/
│  └─ server.js           # Bot WhatsApp + API Express (porta 3000)
├─ db/
│  ├─ supabase-schema.sql
│  └─ queries-uteis.sql
├─ docs/
│  ├─ INICIO_RAPIDO.md
│  ├─ INSTRUCOES_SUPABASE.md
│  └─ RESUMO_IMPLEMENTACAO.md
├─ legacy/
│  └─ dashboard.html      # Versão HTML antiga
├─ frontend/              # Nova UI em React + Tailwind
└─ package.json
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz com:

```
SUPABASE_URL=coloque_sua_url_aqui
SUPABASE_KEY=coloque_sua_key_aqui
PORT=3000
```

Execute:

```
npm install
npm start
```

Para o dashboard, abra `dashboard.html` no navegador. Se o backend estiver em outra URL, defina no console:

```
localStorage.setItem('API_BASE_URL', 'http://seu-dominio-ou-render.com');
```

Exemplo de `.env` (não commitar este arquivo):

```
SUPABASE_URL=https://<sua-instancia>.supabase.co
SUPABASE_KEY=<sua_anon_key>
PORT=3000
```

Bot de atendimento automático para WhatsApp com sistema de fila e verificação de horário de expediente.

## 🚀 Funcionalidades

- ✅ Menu de atendimento automático
- ✅ Verificação de horário de expediente (Seg-Sex, 08:00-18:00)
- ✅ Sistema de fila de atendimento
- ✅ Mensagens automáticas personalizadas
- ✅ Deploy no Render (24/7 online)

## 📋 Pré-requisitos

- Node.js 18 ou superior
- Conta no WhatsApp
- Conta no Render (para deploy)

## 🔧 Instalação Local

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

3. Execute o bot:
```bash
npm start
```

4. Escaneie o QR Code que aparecerá no terminal com seu WhatsApp

## 🌐 Deploy no Render

### Passos para Deploy:

1. **Crie uma conta no Render** (https://render.com)

2. **Crie um novo Web Service:**
   - Clique em "New +" → "Web Service"
   - Conecte seu repositório GitHub/GitLab
   - Configure:
     - **Name:** chatbot-whatsapp (ou nome de sua preferência)
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** Free (ou pago para melhor performance)

3. **Importante sobre o QR Code:**
   - ⚠️ No Render, você **NÃO conseguirá** escanear o QR Code diretamente
   - **Solução:** Use autenticação persistente localmente primeiro, depois faça deploy
   
4. **Autenticação Persistente (Recomendado):**
   - Execute o bot localmente primeiro
   - Escaneie o QR Code
   - A sessão será salva em `.wwebjs_auth/`
   - Faça commit dessa pasta (remova do .gitignore temporariamente)
   - Deploy no Render com a sessão já autenticada

5. **Variáveis de Ambiente (opcional):**
   - No Render, vá em "Environment"
   - Adicione: `PORT=3000` (o Render geralmente já configura automaticamente)

## 📱 Como usar

1. Envie uma mensagem para o WhatsApp do bot (ex: "oi", "olá", "menu")
2. O bot responderá com o menu:
   - **1** - Abertura de Chamado
   - **#** - Finalizar chat

3. **Opção 1 (Abertura de Chamado):**
   - **Dentro do horário:** Entra na fila de atendimento
   - **Fora do horário:** Recebe mensagem informando horário de expediente

4. **Opção #:** Finaliza o chat e remove da fila

## ⏰ Horário de Expediente

- **Segunda a Sexta:** 08:00 às 18:00
- **Fora do expediente:** Bot informa e registra chamado

## 🔍 Endpoints da API

Após o deploy, você pode acessar:

- `https://seu-app.onrender.com/` - Status do bot
- `https://seu-app.onrender.com/status` - Informações em JSON (fila, timestamp)

## 📝 Estrutura do Código

- `chatbot.js` - Código principal do bot
- `package.json` - Dependências e scripts
- `.gitignore` - Arquivos ignorados pelo Git

## 🛠️ Tecnologias Utilizadas

- **whatsapp-web.js** - Biblioteca para WhatsApp Web
- **Express** - Servidor web para manter bot ativo no Render
- **Moment-timezone** - Manipulação de datas e horários
- **qrcode-terminal** - Exibição do QR Code no terminal

## ⚠️ Observações Importantes

1. **Render Free Tier:** O plano gratuito do Render "dorme" após 15 minutos de inatividade. Para manter 24/7 ativo:
   - Use um serviço de ping (ex: UptimeRobot)
   - Ou considere o plano pago

2. **Sessão do WhatsApp:** A sessão pode expirar. Você precisará re-escanear o QR Code periodicamente.

3. **Limitações do WhatsApp:** O WhatsApp pode banir números que enviam muitas mensagens automáticas. Use com moderação.

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

Desenvolvido com ❤️ para atendimento automatizado



