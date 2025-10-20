# 📋 Instruções de Configuração do Supabase

## 🚀 Passo a Passo

### **1. Criar as Tabelas no Supabase**

1. Acesse seu painel do Supabase: `https://<sua-instancia>.supabase.co`

2. Vá em **SQL Editor** (no menu lateral esquerdo)

3. Clique em **New Query**

4. Copie todo o conteúdo do arquivo `supabase-schema.sql` e cole no editor

5. Clique em **Run** para executar e criar todas as tabelas

6. Você verá uma mensagem de sucesso confirmando que as tabelas foram criadas

### **2. Verificar Tabelas Criadas**

Após executar o SQL, você terá as seguintes tabelas:

- ✅ **chamados** - Armazena todos os chamados
- ✅ **mensagens_chat** - Histórico de mensagens
- ✅ **estatisticas_diarias** - Estatísticas agregadas
- ✅ **estatisticas_resumo** (view) - Vista resumida dos dados

### **3. Configurar Políticas de Segurança (RLS)**

Por padrão, o Supabase ativa RLS (Row Level Security). Para o dashboard funcionar, você precisa:

**Opção 1 - Desabilitar RLS (Desenvolvimento/Testes):**

Execute no SQL Editor:

```sql
ALTER TABLE chamados DISABLE ROW LEVEL SECURITY;
ALTER TABLE mensagens_chat DISABLE ROW LEVEL SECURITY;
ALTER TABLE estatisticas_diarias DISABLE ROW LEVEL SECURITY;
```

**Opção 2 - Criar Políticas Públicas (Recomendado para produção):**

Execute no SQL Editor:

```sql
-- Política para leitura pública
CREATE POLICY "Permitir leitura pública" ON chamados
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" ON chamados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização pública" ON chamados
    FOR UPDATE USING (true);

-- Mesma coisa para mensagens_chat
CREATE POLICY "Permitir leitura pública" ON mensagens_chat
    FOR SELECT USING (true);

CREATE POLICY "Permitir inserção pública" ON mensagens_chat
    FOR INSERT WITH CHECK (true);
```

### **4. Testar o Sistema**

#### **A) Testar o Bot:**

1. Configure variáveis de ambiente criando um arquivo `.env` na raiz:
```
SUPABASE_URL=https://<sua-instancia>.supabase.co
SUPABASE_KEY=<sua_anon_key>
PORT=3000
```
2. Instale e inicie o bot:
```bash
npm install
npm start
```

2. Escaneie o QR Code

3. Envie uma mensagem para o bot:
   - Digite: `oi`
   - Digite: `1` (para abrir chamado)

4. Verifique no Supabase:
   - Vá em **Table Editor** → **chamados**
   - Você deve ver o chamado registrado

#### **B) Testar o Dashboard:**

1. Abra o arquivo `dashboard.html` no navegador
   - Pode abrir direto: `Ctrl+O` → Selecionar `dashboard.html`
   - Ou use um servidor local

2. O dashboard deve carregar e mostrar:
   - Estatísticas no topo
   - Lista de chamados
   - Botões de ação

### **5. Funcionalidades do Dashboard**

✅ **Visualização em tempo real** - Atualiza a cada 30 segundos

✅ **Estatísticas:**
- Chamados aguardando
- Em atendimento
- Finalizados
- Fora do expediente

✅ **Filtros:**
- Por status (aguardando, em atendimento, finalizado, cancelado)
- Por horário (dentro/fora do expediente)
- Por data
- Busca por nome ou número

✅ **Ações:**
- 👁️ **Ver detalhes** - Visualizar chamado completo com histórico de mensagens
- ✅ **Finalizar** - Marcar chamado como finalizado
- ❌ **Cancelar** - Cancelar chamado

### **6. Estrutura de Dados**

#### **Tabela: chamados**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único do chamado |
| numero_whatsapp | VARCHAR | Número do WhatsApp |
| nome_contato | VARCHAR | Nome do contato |
| status | VARCHAR | aguardando, em_atendimento, finalizado, cancelado |
| tipo | VARCHAR | Tipo do chamado |
| horario_abertura | TIMESTAMP | Data/hora de abertura |
| horario_finalizacao | TIMESTAMP | Data/hora de finalização |
| dentro_expediente | BOOLEAN | Se foi aberto dentro do expediente |
| posicao_fila | INTEGER | Posição na fila de atendimento |
| observacoes | TEXT | Observações adicionais |
| atendente | VARCHAR | Nome do atendente |

#### **Tabela: mensagens_chat**
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | ID único da mensagem |
| chamado_id | UUID | ID do chamado (FK) |
| numero_whatsapp | VARCHAR | Número do WhatsApp |
| mensagem | TEXT | Conteúdo da mensagem |
| tipo_mensagem | VARCHAR | recebida, enviada, sistema |
| timestamp | TIMESTAMP | Data/hora da mensagem |

### **7. Monitoramento**

Para monitorar os dados em tempo real:

1. **Supabase Dashboard:**
   - Acesse **Table Editor** para ver registros
   - Acesse **SQL Editor** para queries personalizadas

2. **Dashboard Web:**
   - Abra `dashboard.html` no navegador
   - Mantenha aberto para monitorar em tempo real

3. **Logs do Bot:**
   - No terminal onde o bot está rodando
   - Você verá mensagens de "Chamado criado", "Chamado atualizado", etc.

### **8. Consultas Úteis (SQL Editor)**

**Ver todos os chamados de hoje:**
```sql
SELECT * FROM chamados 
WHERE DATE(horario_abertura) = CURRENT_DATE
ORDER BY horario_abertura DESC;
```

**Estatísticas rápidas:**
```sql
SELECT * FROM estatisticas_resumo;
```

**Chamados por status:**
```sql
SELECT status, COUNT(*) as total
FROM chamados
GROUP BY status;
```

**Histórico de mensagens de um chamado:**
```sql
SELECT * FROM mensagens_chat
WHERE chamado_id = 'SEU_ID_AQUI'
ORDER BY timestamp;
```

### **9. Troubleshooting**

**Problema: "Error: relation chamados does not exist"**
- Solução: Execute o arquivo `supabase-schema.sql` no SQL Editor

**Problema: Dashboard não carrega dados**
- Verifique se desabilitou RLS ou criou as políticas
- Certifique-se de que o backend está rodando (porta 3000 por padrão)
- Se o backend estiver em outra URL, defina no navegador:
  ```
  localStorage.setItem('API_BASE_URL', 'http://seu-dominio-ou-render.com');
  ```

**Problema: Bot não salva no Supabase**
- Verifique se as credenciais no `chatbot.js` estão corretas
- Verifique os logs do terminal para ver erros
- Confirme que as tabelas foram criadas

### **10. Deploy em Produção**

Quando for fazer deploy no Render:

1. Configure `SUPABASE_URL` e `SUPABASE_KEY` nas variáveis de ambiente
2. O bot funcionará normalmente
3. O dashboard pode ser hospedado em:
   - GitHub Pages
   - Netlify
   - Vercel
   - Ou qualquer hosting estático

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs do terminal
2. Verifique o Console do navegador (F12)
3. Revise as políticas de segurança do Supabase
4. Confirme que todas as tabelas foram criadas

---

**✅ Sistema pronto para uso!**

Você agora tem um sistema completo de gerenciamento de chamados com:
- Bot WhatsApp funcional
- Banco de dados Supabase
- Dashboard para análise e gestão
- Histórico completo de mensagens
- Estatísticas em tempo real

