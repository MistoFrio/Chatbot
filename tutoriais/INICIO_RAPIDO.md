# 🚀 GUIA DE INÍCIO RÁPIDO

## ⚡ 3 Passos para começar

### **PASSO 1: Configurar Supabase** (5 minutos)

```
1. Abra: https://phwyqyeufnsvsxymiyww.supabase.co
2. Vá em: SQL Editor (menu lateral)
3. Clique em: New Query
4. Cole o conteúdo do arquivo: supabase-schema.sql
5. Clique em: RUN
6. Execute também (para permitir acesso):

   ALTER TABLE chamados DISABLE ROW LEVEL SECURITY;
   ALTER TABLE mensagens_chat DISABLE ROW LEVEL SECURITY;
```

✅ **Pronto! Tabelas criadas!**

---

### **PASSO 2: Iniciar o Bot** (2 minutos)

Crie um arquivo `.env` na raiz com:
```
SUPABASE_URL=https://<sua-instancia>.supabase.co
SUPABASE_KEY=<sua_anon_key>
PORT=3000
```

```bash
# No terminal:
npm install
npm start
```

📱 **Escaneie o QR Code com seu WhatsApp:**
- Abra WhatsApp → Menu (⋮) → Aparelhos conectados → Conectar aparelho

✅ **Bot conectado!**

---

### **PASSO 3: Abrir o Dashboard** (1 minuto)

```
1. Abra o arquivo: dashboard.html no navegador
   - Pode arrastar para o navegador ou
   - Clique com botão direito → Abrir com → Chrome/Edge

2. O dashboard irá carregar automaticamente! Se o backend estiver em outra URL, defina:
```
localStorage.setItem('API_BASE_URL', 'http://seu-dominio-ou-render.com');
```
```

✅ **Dashboard pronto!**

---

## 🧪 Testar o Sistema

### **1. Teste no WhatsApp:**

```
Você → oi
Bot → Menu de opções

Você → 1
Bot → Abre chamado e entra na fila
```

### **2. Verifique no Supabase:**

```
1. Vá em: Table Editor → chamados
2. Você verá o chamado registrado!
```

### **3. Veja no Dashboard:**

```
1. Recarregue o dashboard.html (F5)
2. O chamado aparecerá na lista!
3. Clique em "👁️ Ver" para ver detalhes
```

---

## 📊 Arquivos Importantes

| Arquivo | O que faz |
|---------|-----------|
| `chatbot.js` | O bot do WhatsApp |
| `dashboard.html` | Interface de gestão |
| `supabase-schema.sql` | Cria as tabelas |
| `INSTRUCOES_SUPABASE.md` | Guia completo |
| `queries-uteis.sql` | Consultas prontas |

---

## 🆘 Problemas Comuns

### **Dashboard não carrega dados?**
```sql
-- Execute no Supabase SQL Editor:
ALTER TABLE chamados DISABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_chat DISABLE ROW LEVEL SECURITY;
```

### **Bot não salva no Supabase?**
- Verifique se executou o `supabase-schema.sql`
- Veja os logs no terminal (erros aparecem lá)

### **QR Code não aparece?**
- Verifique se executou: `npm install`
- Certifique-se que o WhatsApp não está conectado em outro computador

---

## 📞 Comandos do Bot

| Mensagem | Ação |
|----------|------|
| `oi`, `olá`, `menu` | Mostra menu |
| `1` | Abre chamado |
| `#` | Finaliza chat |

---

## 🎯 Funcionalidades do Dashboard

### **Cards no Topo:**
- 🟡 Aguardando
- 🔵 Em Atendimento  
- 🟢 Finalizados
- 🔴 Fora do Expediente

### **Filtros:**
- Status
- Horário (dentro/fora expediente)
- Data
- Busca por nome/número

### **Ações:**
- 👁️ **Ver Detalhes** → Abre modal com histórico
- ✅ **Finalizar** → Marca como finalizado
- ❌ **Cancelar** → Cancela o chamado

---

## 📈 Estatísticas no Supabase

### **Abra SQL Editor e teste:**

```sql
-- Ver resumo rápido
SELECT * FROM estatisticas_resumo;

-- Ver chamados de hoje
SELECT * FROM chamados 
WHERE DATE(horario_abertura) = CURRENT_DATE;

-- Ver top 5 contatos
SELECT numero_whatsapp, nome_contato, COUNT(*) as total
FROM chamados
GROUP BY numero_whatsapp, nome_contato
ORDER BY total DESC
LIMIT 5;
```

Mais queries em: `queries-uteis.sql`

---

## ✅ Checklist de Funcionamento

Verifique se está tudo OK:

- [ ] Bot rodando (terminal mostra "Tudo certo! WhatsApp conectado")
- [ ] Servidor rodando (terminal mostra "Servidor rodando na porta 3000")
- [ ] Tabelas criadas no Supabase
- [ ] Dashboard abre no navegador
- [ ] Ao enviar "oi" no WhatsApp, bot responde
- [ ] Ao digitar "1", chamado é criado
- [ ] Dashboard mostra o chamado
- [ ] Consegue clicar em "Ver detalhes"

---

## 🎉 Tudo Pronto!

Agora você tem:
- ✅ Bot WhatsApp funcional
- ✅ Banco de dados configurado
- ✅ Dashboard profissional
- ✅ Histórico completo de mensagens
- ✅ Estatísticas em tempo real

---

## 🌐 Próximo Passo: Deploy

Quando quiser colocar em produção:

### **Bot no Render:**
```
1. Criar repositório Git
2. git add .
3. git commit -m "Bot completo"
4. git push
5. Conectar no Render.com
```

### **Dashboard (Netlify/Vercel):**
```
1. Arrastar dashboard.html para netlify.com/drop
2. Pronto! URL pública gerada
```

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- `README.md` - Visão geral
- `INSTRUCOES_SUPABASE.md` - Guia Supabase
- `RESUMO_IMPLEMENTACAO.md` - Tudo que foi feito
- `queries-uteis.sql` - Consultas SQL prontas

---

**💡 Dica:** Mantenha o terminal aberto para ver os logs do bot em tempo real!

**🔄 Atualização:** O dashboard atualiza automaticamente a cada 30 segundos!

**📱 Mobile:** O dashboard é 100% responsivo - funciona em celular!

---

**✅ Sistema pronto para uso!**

Qualquer dúvida, consulte a documentação ou veja os logs no terminal.

**Desenvolvido com ❤️**

