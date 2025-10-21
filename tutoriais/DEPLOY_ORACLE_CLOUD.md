# 🚀 Deploy do Chatbot WhatsApp na Oracle Cloud (100% GRÁTIS)

## 🎯 **VISÃO GERAL**

Oracle Cloud oferece VPS **grátis para sempre** com recursos suficientes para rodar seu bot 24/7.

**Recursos incluídos:**
- ✅ 1 GB RAM
- ✅ 1 OCPU (ARM ou AMD)
- ✅ 200 GB armazenamento
- ✅ Banda ilimitada (até 10 TB/mês)
- ✅ IP público fixo

---

## 📝 **PASSO A PASSO COMPLETO**

### **PARTE 1: Criar Conta e Instância** (15 min)

#### **1️⃣ Criar conta Oracle Cloud:**
👉 https://www.oracle.com/cloud/free/

1. Clique em **"Start for free"**
2. Preencha seus dados (nome, email, país)
3. **Importante:** Vai pedir cartão de crédito, mas **NÃO vai cobrar**
4. Confirme email
5. Aguarde aprovação (pode levar algumas horas)

---

#### **2️⃣ Criar Instância (VM):**

Após aprovação:

1. Acesse o painel: https://cloud.oracle.com
2. Clique em **"Create a VM instance"**

**Configurações:**

| Campo | Valor |
|-------|-------|
| **Name** | `chatbot-whatsapp` |
| **Image** | `Ubuntu 22.04` (recomendado) |
| **Shape** | `VM.Standard.A1.Flex` (ARM - Always Free) |
| **OCPU** | `1` |
| **RAM** | `6 GB` (pode usar até 24 GB no free tier!) |

**⚠️ IMPORTANTE:**
- Escolha **"Always Free-eligible"** shapes apenas
- Se não aparecer `A1.Flex`, tente `E2.1.Micro` (AMD)

3. Na seção **"Add SSH keys"**:
   - Escolha **"Generate a key pair for me"**
   - Clique em **"Save Private Key"** e **"Save Public Key"**
   - Guarde esses arquivos! Você vai precisar para conectar

4. Clique em **"Create"**

5. Aguarde 2-3 minutos até status ficar **"Running"** ✅

---

#### **3️⃣ Anotar o IP público:**

Na página da instância, copie o **"Public IP address"**

Exemplo: `123.456.789.10`

---

### **PARTE 2: Conectar via SSH** (5 min)

#### **No Windows (PowerShell):**

```powershell
# Dar permissão à chave SSH (faça uma vez)
# Substitua pelo caminho do seu arquivo .key
icacls "C:\Users\SeuUsuario\Downloads\ssh-key-XXXX.key" /inheritance:r
icacls "C:\Users\SeuUsuario\Downloads\ssh-key-XXXX.key" /grant:r "%username%:R"

# Conectar (substitua IP e caminho da chave)
ssh -i "C:\Users\SeuUsuario\Downloads\ssh-key-XXXX.key" ubuntu@SEU_IP_PUBLICO
```

**Primeira conexão:**
- Vai perguntar: `Are you sure you want to continue?`
- Digite: `yes`

Você está dentro do servidor! 🎉

---

### **PARTE 3: Configurar Firewall** (3 min)

Por padrão, Oracle bloqueia portas. Vamos liberar a porta 3000:

#### **No painel Oracle Cloud:**

1. Vá em **Networking → Virtual Cloud Networks**
2. Clique na VCN da sua instância
3. Clique em **Security Lists** → **Default Security List**
4. Clique em **Add Ingress Rules**
5. Preencha:
   - **Source CIDR:** `0.0.0.0/0`
   - **Destination Port Range:** `3000`
   - **Description:** `WhatsApp Bot API`
6. Clique em **Add Ingress Rules**

#### **No servidor (via SSH):**

```bash
# Liberar porta no firewall do Ubuntu
sudo ufw allow 3000
sudo ufw allow 22  # SSH (importante!)
sudo ufw enable
```

---

### **PARTE 4: Instalar Node.js e dependências** (5 min)

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node -v  # Deve mostrar v20.x.x
npm -v   # Deve mostrar 10.x.x

# Instalar dependências do Puppeteer
sudo apt install -y \
  chromium-browser \
  fonts-liberation \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libgbm1

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

---

### **PARTE 5: Clonar e configurar seu bot** (5 min)

```bash
# Instalar git
sudo apt install -y git

# Clonar seu repositório
git clone https://github.com/MistoFrio/Chatbot.git
cd Chatbot

# Instalar dependências
npm install

# Criar arquivo .env
nano .env
```

**Cole no arquivo .env:**
```
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_anon_key
PORT=3000
```

**Salvar:** `Ctrl+O` → `Enter` → `Ctrl+X`

---

### **PARTE 6: Iniciar o bot com PM2** (3 min)

```bash
# Iniciar bot
pm2 start chatbot.js --name "whatsapp-bot"

# Ver logs
pm2 logs whatsapp-bot

# Você verá o QR Code nos logs!
# Copie o QR Code ASCII e escaneie no WhatsApp
# OU acesse: http://SEU_IP:3000/qr no navegador
```

**Após autenticar:**

```bash
# Configurar PM2 para iniciar no boot
pm2 startup
# Copie e execute o comando que aparecer

# Salvar configuração
pm2 save

# Ver status
pm2 status
```

---

### **PARTE 7: Testar** (2 min)

1. **Teste a API:**
   ```
   http://SEU_IP_PUBLICO:3000/status
   ```
   Deve retornar JSON com status online

2. **Teste o bot:**
   - Envie "oi" no WhatsApp
   - Bot deve responder com o menu

---

## 🎛️ **COMANDOS ÚTEIS DO PM2**

```bash
# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs whatsapp-bot

# Parar bot
pm2 stop whatsapp-bot

# Reiniciar bot
pm2 restart whatsapp-bot

# Deletar do PM2
pm2 delete whatsapp-bot

# Ver uso de CPU/RAM
pm2 monit
```

---

## 🔄 **ATUALIZAR O BOT**

Quando fizer mudanças no código:

```bash
# Conectar via SSH
ssh -i "caminho/chave.key" ubuntu@SEU_IP

# Ir para pasta do projeto
cd Chatbot

# Puxar atualizações
git pull

# Reinstalar dependências (se necessário)
npm install

# Reiniciar bot
pm2 restart whatsapp-bot
```

---

## 🔒 **SEGURANÇA**

### **1. Configurar domínio (opcional mas recomendado):**

```bash
# Instalar Nginx
sudo apt install -y nginx

# Configurar reverse proxy
sudo nano /etc/nginx/sites-available/chatbot

# Cole:
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Ativar site
sudo ln -s /etc/nginx/sites-available/chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Instalar SSL (Let's Encrypt)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seu-dominio.com
```

### **2. Habilitar firewall:**

```bash
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw allow 3000
sudo ufw enable
```

---

## 🆘 **TROUBLESHOOTING**

### **Bot não conecta no WhatsApp:**

```bash
# Ver logs
pm2 logs whatsapp-bot

# Se precisar reautenticar, delete sessão
rm -rf .wwebjs_auth/
pm2 restart whatsapp-bot

# Acesse /qr para escanear
```

### **Porta 3000 não acessível:**

```bash
# Verificar se bot está rodando
pm2 status

# Verificar firewall
sudo ufw status

# Verificar se porta está aberta
sudo netstat -tulpn | grep 3000

# Reabrir porta no Oracle Cloud (painel web)
```

### **Bot desconectou:**

```bash
# Verificar status
pm2 status

# Ver logs de erro
pm2 logs whatsapp-bot --err

# Reiniciar
pm2 restart whatsapp-bot
```

---

## 💰 **CUSTOS**

**ZERO!** A Oracle oferece isso 100% grátis, para sempre, sem trial.

**Incluído no Free Tier:**
- ✅ 2 VMs (você só precisa de 1)
- ✅ Até 24 GB RAM total (distribuído entre VMs)
- ✅ 4 OCPUs ARM
- ✅ 200 GB armazenamento
- ✅ 10 TB tráfego/mês

---

## 📊 **COMPARAÇÃO**

| Serviço | Custo | Terminal | Uptime | Puppeteer |
|---------|-------|----------|--------|-----------|
| **Oracle Cloud** | **$0** | ✅ SSH | ✅ 24/7 | ✅ Sim |
| Render Free | $0 | ❌ Não | ⚠️ Hiberna | ❌ Limitado |
| Railway | $5/mês | ✅ Sim | ✅ 24/7 | ✅ Sim |
| Render Paid | $7/mês | ✅ Sim | ✅ 24/7 | ✅ Sim |

---

## 🎉 **PRONTO!**

Seu bot está rodando 24/7 na Oracle Cloud, **100% grátis**!

**URLs importantes:**
- 🤖 Bot: `http://SEU_IP:3000`
- 📱 QR Code: `http://SEU_IP:3000/qr`
- 📊 Status: `http://SEU_IP:3000/status`

---

## 🔗 **CONECTAR FRONTEND NETLIFY**

No Netlify, configure variável de ambiente:
```
API_BASE_URL=http://SEU_IP_PUBLICO:3000
```

Ou edite `frontend/src/App.tsx`:
```typescript
const API_BASE = 'http://SEU_IP_PUBLICO:3000';
```

---

**✅ Sistema completo rodando grátis 24/7!**

- Frontend: Netlify (grátis)
- Backend/Bot: Oracle Cloud (grátis)
- Banco: Supabase (grátis)

**CUSTO TOTAL: $0/mês** 🎉

