# 🚀 RESUMO RÁPIDO: Deploy no Render (10 minutos)

## ⚡ Versão Express

### **1️⃣ Enviar código para o GitHub** (3 min)

```bash
# No terminal (PowerShell):
cd C:\Users\Gontijo\Desktop\Chatbot1

git init
git add .
git commit -m "Deploy: Chatbot WhatsApp"

# Criar repositório em: https://github.com/new
# Depois:
git remote add origin https://github.com/SEU_USUARIO/chatbot-whatsapp.git
git branch -M main
git push -u origin main
```

---

### **2️⃣ Deploy no Render** (5 min)

1. Acesse: **https://render.com** → Cadastre com GitHub
2. Clique em **New +** → **Web Service**
3. Conecte o repositório `chatbot-whatsapp`
4. Configure:
   - **Name:** `chatbot-whatsapp`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`

5. **Adicione variáveis de ambiente:**
   - `SUPABASE_URL` = `https://seu-projeto.supabase.co`
   - `SUPABASE_KEY` = `sua_anon_key`
   - `PORT` = `3000`

6. Clique em **Create Web Service**

---

### **3️⃣ Autenticar WhatsApp** (2 min)

⚠️ **Render Free não tem terminal para QR Code!**

**Solução:**

```bash
# No seu PC, autentique primeiro:
node chatbot.js
# Escaneie o QR Code

# Depois, adicione a sessão ao Git:
# Edite .gitignore e REMOVA a linha: .wwebjs_auth/

git add .wwebjs_auth/
git commit -m "Add WhatsApp session"
git push

# Render fará redeploy automático!
```

---

### **4️⃣ Manter ativo 24h** (2 min)

1. Acesse: **https://uptimerobot.com** → Cadastre grátis
2. **Add Monitor:**
   - Type: `HTTP(s)`
   - URL: `https://sua-url.onrender.com/status`
   - Interval: `5 minutes`

✅ **Bot ativo 24/7!**

---

## 📋 Checklist Rápido

- [ ] Código no GitHub
- [ ] Serviço no Render criado
- [ ] Variáveis de ambiente configuradas
- [ ] WhatsApp autenticado localmente
- [ ] Sessão `.wwebjs_auth/` enviada ao GitHub
- [ ] UptimeRobot configurado

---

## 🔗 URLs Importantes

- 🤖 **Bot:** `https://sua-url.onrender.com`
- 📊 **Status:** `https://sua-url.onrender.com/status`
- 📋 **Chamados:** `https://sua-url.onrender.com/api/chamados`

---

## 💡 Dica Pro

**Para produção séria:**
- Upgrade para Render Starter ($7/mês)
- Terminal SSH disponível
- Sem hibernação
- Melhor performance

---

## 🆘 Problema Comum

**Bot desconecta?**
- Configure UptimeRobot OU
- Upgrade para plano pago ($7/mês)

---

**Documentação completa:** `DEPLOY_RENDER.md`

**✅ Deploy completo em ~10 minutos!**

