# 🚀 Deploy do Chatbot WhatsApp no Render

## 📋 Pré-requisitos

- ✅ Conta no GitHub
- ✅ Conta no Render (gratuita)
- ✅ Supabase configurado com as credenciais

---

## 🎯 PASSO A PASSO COMPLETO

### **PASSO 1: Preparar o Repositório Git** (5 minutos)

#### 1.1. Criar arquivo `.gitignore` na raiz (se não existir):

```bash
# Criar/editar .gitignore
node_modules/
.env
.wwebjs_auth/
.wwebjs_cache/
*.log
```

#### 1.2. Inicializar Git e fazer commit:

```bash
# No terminal (PowerShell/CMD) na pasta do projeto:
cd C:\Users\Gontijo\Desktop\Chatbot1

# Inicializar git
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Deploy: Chatbot WhatsApp com melhorias"
```

#### 1.3. Criar repositório no GitHub:

1. Acesse: https://github.com/new
2. Nome do repositório: `chatbot-whatsapp`
3. Deixe como **Público** ou **Privado**
4. **NÃO** marque "Add README"
5. Clique em **Create repository**

#### 1.4. Conectar e enviar código:

Copie os comandos que o GitHub mostrou e execute no terminal:

```bash
git remote add origin https://github.com/SEU_USUARIO/chatbot-whatsapp.git
git branch -M main
git push -u origin main
```

✅ **Código enviado para o GitHub!**

---

### **PASSO 2: Deploy no Render** (7 minutos)

#### 2.1. Criar conta no Render:

1. Acesse: https://render.com
2. Clique em **Get Started**
3. Cadastre-se com GitHub (recomendado)

#### 2.2. Criar novo Web Service:

1. No painel do Render, clique em **New +**
2. Selecione **Web Service**
3. Conecte seu repositório GitHub:
   - Clique em **Connect account** (se necessário)
   - Autorize o Render a acessar o GitHub
   - Selecione o repositório `chatbot-whatsapp`

#### 2.3. Configurar o serviço:

Preencha os campos:

| Campo | Valor |
|-------|-------|
| **Name** | `chatbot-whatsapp` (ou o nome que preferir) |
| **Region** | `Oregon (US West)` (mais próximo) |
| **Branch** | `main` |
| **Root Directory** | (deixe vazio) |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

#### 2.4. Adicionar variáveis de ambiente:

**IMPORTANTE:** Role a página para baixo até **Environment Variables** e adicione:

| Key | Value | Onde encontrar |
|-----|-------|----------------|
| `SUPABASE_URL` | `https://SEU-PROJETO.supabase.co` | Painel Supabase → Settings → API |
| `SUPABASE_KEY` | `sua_anon_public_key` | Painel Supabase → Settings → API → anon/public |
| `PORT` | `3000` | (deixe como está) |

**Como adicionar:**
1. Clique em **Add Environment Variable**
2. Digite o **Key** (ex: `SUPABASE_URL`)
3. Cole o **Value** correspondente
4. Repita para cada variável

#### 2.5. Criar o serviço:

1. Role até o final da página
2. Clique em **Create Web Service**
3. Aguarde o deploy (5-10 minutos na primeira vez)

✅ **Bot deployado!**

---

### **PASSO 3: Configurar WhatsApp** (3 minutos)

#### ⚠️ **IMPORTANTE - Limitação do Render Free Tier:**

O plano gratuito do Render **não permite acesso ao terminal interativo** para escanear o QR Code diretamente.

**Soluções:**

#### **Opção 1: Autenticação Local + Deploy (RECOMENDADO)**

1. **Autentique localmente primeiro:**
   ```bash
   # No seu computador:
   node chatbot.js
   ```
2. Escaneie o QR Code normalmente
3. A sessão será salva na pasta `.wwebjs_auth/`
4. **Adicione a pasta ao Git:**
   ```bash
   # Edite .gitignore e REMOVA a linha:
   # .wwebjs_auth/
   
   # Depois:
   git add .wwebjs_auth/
   git commit -m "Add WhatsApp session"
   git push
   ```
5. O Render fará redeploy automaticamente
6. O bot usará a sessão autenticada

**⚠️ Desvantagens:**
- Sessão pode expirar após ~30 dias
- Precisa reautenticar localmente e fazer push novamente

#### **Opção 2: Upgrade para Render Paid ($7/mês)**

Com plano pago você tem:
- ✅ Acesso ao Shell para escanear QR Code
- ✅ Sessão persistente
- ✅ Não hiberna (sempre ativo)

**Como fazer upgrade:**
1. No painel do Render, clique no seu serviço
2. Vá em **Settings** → **Instance Type**
3. Mude para **Starter** ($7/mês)
4. Acesse **Shell** (no menu lateral)
5. Execute: `node chatbot.js`
6. Escaneie o QR Code que aparecer

#### **Opção 3: Usar outro provedor (Heroku, Railway, VPS)**

Provedores com terminal interativo:
- **Railway.app** - $5/mês (tem terminal)
- **Heroku** - $7/mês (tem terminal)
- **VPS (Digital Ocean, Linode)** - $6-12/mês (acesso SSH completo)

---

### **PASSO 4: Verificar se está funcionando** (2 minutos)

#### 4.1. Verificar logs do Render:

1. No painel do Render, clique no seu serviço
2. Vá em **Logs** (menu lateral)
3. Você deve ver:
   ```
   Servidor rodando na porta 3000
   Tudo certo! WhatsApp conectado.
   ```

#### 4.2. Testar endpoint:

1. Copie a URL do seu serviço (ex: `https://chatbot-whatsapp-xxxx.onrender.com`)
2. Abra no navegador: `https://sua-url.onrender.com/status`
3. Deve retornar JSON com:
   ```json
   {
     "status": "online",
     "filaAtendimento": 0,
     "timestamp": "2025-10-20T..."
   }
   ```

✅ **Bot funcionando!**

---

## 🔧 Configurações Adicionais

### **Manter o bot sempre ativo (evitar hibernação)**

O Render Free hiberna após 15 minutos de inatividade. Para evitar:

#### Opção A: UptimeRobot (Gratuito)

1. Acesse: https://uptimerobot.com
2. Cadastre-se gratuitamente
3. Adicione novo monitor:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://sua-url.onrender.com/status`
   - **Monitoring Interval:** 5 minutes
4. O UptimeRobot fará ping a cada 5 minutos mantendo o bot ativo

#### Opção B: Fazer upgrade para Paid ($7/mês)

- Bot nunca hiberna
- Melhor performance
- Mais memória RAM

---

## 📱 Conectar Dashboard ao Backend no Render

Após deploy, atualize o dashboard para usar a URL do Render:

1. Abra o `dashboard` (frontend)
2. Abra o **Console do navegador** (F12)
3. Execute:
   ```javascript
   localStorage.setItem('API_BASE_URL', 'https://sua-url.onrender.com');
   ```
4. Recarregue a página (F5)

Ou edite o `App.tsx` e mude a linha 7:

```typescript
const API_BASE = 'https://sua-url.onrender.com';
```

---

## 🐛 Troubleshooting

### **Bot não conecta no WhatsApp**

**Causa:** Render Free não tem terminal para QR Code

**Solução:** Use Opção 1 (autenticar localmente) ou faça upgrade

---

### **Erro: "EADDRINUSE port 3000"**

**Causa:** Porta já em uso (raro no Render)

**Solução:** O Render gerencia isso automaticamente. Ignore.

---

### **Bot desconecta após algumas horas**

**Causa:** Render Free hiberna após inatividade

**Solução:** Configure UptimeRobot ou faça upgrade

---

### **Erro: "Variáveis de ambiente não definidas"**

**Causa:** `SUPABASE_URL` ou `SUPABASE_KEY` faltando

**Solução:** 
1. No Render, vá em **Environment**
2. Adicione as variáveis corretamente
3. Clique em **Save Changes**
4. O serviço fará redeploy automático

---

### **Logs mostram: "Erro ao criar chamado"**

**Causa:** Credenciais do Supabase incorretas

**Solução:**
1. Verifique as variáveis no Render
2. Teste as credenciais localmente primeiro
3. Confirme que as tabelas foram criadas no Supabase

---

## 📊 Monitoramento

### **Ver logs em tempo real:**

1. Painel Render → Seu serviço → **Logs**
2. Deixe aberto para ver atividade ao vivo

### **Estatísticas do serviço:**

1. Painel Render → Seu serviço → **Metrics**
2. Veja CPU, memória, requisições

### **Verificar uptime:**

```bash
# Abrir no navegador:
https://sua-url.onrender.com/status
```

---

## 🔄 Atualizar o Bot (após mudanças no código)

```bash
# No seu computador:
git add .
git commit -m "Atualização: descrição das mudanças"
git push

# O Render fará redeploy automaticamente!
```

---

## 💰 Custos

| Plano | Preço | Características |
|-------|-------|-----------------|
| **Free** | $0/mês | Hiberna após 15min, 750h/mês, sem terminal |
| **Starter** | $7/mês | Sempre ativo, terminal SSH, mais RAM |
| **Standard** | $25/mês | Performance alta, escalabilidade |

**Recomendação para produção:** Starter ($7/mês) + UptimeRobot (grátis)

---

## ✅ Checklist Final

- [ ] Código no GitHub
- [ ] Serviço criado no Render
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy bem-sucedido (logs OK)
- [ ] Endpoint `/status` respondendo
- [ ] WhatsApp autenticado (Opção 1 ou upgrade)
- [ ] UptimeRobot configurado (opcional)
- [ ] Dashboard conectado à URL do Render

---

## 🎉 Pronto!

Seu chatbot está **ativo 24/7** no Render!

**URLs importantes:**
- 🤖 Bot: `https://sua-url.onrender.com`
- 📊 Status: `https://sua-url.onrender.com/status`
- 📋 API Chamados: `https://sua-url.onrender.com/api/chamados`

---

## 🆘 Suporte

**Documentação oficial:**
- Render: https://render.com/docs
- WhatsApp-Web.js: https://wwebjs.dev/

**Problemas?**
1. Verifique os logs no Render
2. Teste localmente primeiro: `node chatbot.js`
3. Confirme variáveis de ambiente

---

**🚀 Bot em produção! Bom atendimento!**

