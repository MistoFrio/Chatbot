-- ========================================
-- SCHEMA PARA SISTEMA DE CHAMADOS WHATSAPP
-- ========================================

-- Tabela de Chamados
CREATE TABLE IF NOT EXISTS chamados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_whatsapp VARCHAR(50) NOT NULL,
    nome_contato VARCHAR(255),
    status VARCHAR(50) DEFAULT 'aguardando' CHECK (status IN ('aguardando', 'em_atendimento', 'finalizado', 'cancelado')),
    tipo VARCHAR(50) DEFAULT 'abertura_chamado',
    horario_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    horario_finalizacao TIMESTAMP WITH TIME ZONE,
    dentro_expediente BOOLEAN DEFAULT true,
    posicao_fila INTEGER,
    observacoes TEXT,
    atendente VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Mensagens do Chat
CREATE TABLE IF NOT EXISTS mensagens_chat (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chamado_id UUID REFERENCES chamados(id) ON DELETE CASCADE,
    numero_whatsapp VARCHAR(50) NOT NULL,
    mensagem TEXT NOT NULL,
    tipo_mensagem VARCHAR(50) DEFAULT 'recebida' CHECK (tipo_mensagem IN ('recebida', 'enviada', 'sistema')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Estatísticas (para dashboard)
CREATE TABLE IF NOT EXISTS estatisticas_diarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    data DATE DEFAULT CURRENT_DATE,
    total_chamados INTEGER DEFAULT 0,
    chamados_dentro_expediente INTEGER DEFAULT 0,
    chamados_fora_expediente INTEGER DEFAULT 0,
    tempo_medio_atendimento INTERVAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(data)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_chamados_status ON chamados(status);
CREATE INDEX IF NOT EXISTS idx_chamados_numero ON chamados(numero_whatsapp);
CREATE INDEX IF NOT EXISTS idx_chamados_data ON chamados(horario_abertura);
CREATE INDEX IF NOT EXISTS idx_mensagens_chamado ON mensagens_chat(chamado_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_chamados_updated_at
    BEFORE UPDATE ON chamados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View para estatísticas rápidas
CREATE OR REPLACE VIEW estatisticas_resumo AS
SELECT 
    COUNT(*) as total_chamados,
    COUNT(*) FILTER (WHERE status = 'aguardando') as aguardando,
    COUNT(*) FILTER (WHERE status = 'em_atendimento') as em_atendimento,
    COUNT(*) FILTER (WHERE status = 'finalizado') as finalizados,
    COUNT(*) FILTER (WHERE dentro_expediente = true) as dentro_expediente,
    COUNT(*) FILTER (WHERE dentro_expediente = false) as fora_expediente,
    COUNT(*) FILTER (WHERE DATE(horario_abertura) = CURRENT_DATE) as hoje
FROM chamados;

-- Comentários nas tabelas
COMMENT ON TABLE chamados IS 'Armazena todos os chamados abertos via WhatsApp';
COMMENT ON TABLE mensagens_chat IS 'Histórico de mensagens trocadas nos chamados';
COMMENT ON TABLE estatisticas_diarias IS 'Estatísticas agregadas por dia';

