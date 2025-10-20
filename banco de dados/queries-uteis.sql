-- ========================================
-- QUERIES ÚTEIS PARA O DASHBOARD SUPABASE
-- ========================================

-- ====================
-- CONSULTAS BÁSICAS
-- ====================

-- Ver todos os chamados de hoje
SELECT * FROM chamados 
WHERE DATE(horario_abertura) = CURRENT_DATE
ORDER BY horario_abertura DESC;

-- Ver chamados em aberto (aguardando ou em atendimento)
SELECT * FROM chamados 
WHERE status IN ('aguardando', 'em_atendimento')
ORDER BY horario_abertura ASC;

-- Ver últimos 10 chamados finalizados
SELECT * FROM chamados 
WHERE status = 'finalizado'
ORDER BY horario_finalizacao DESC
LIMIT 10;

-- ====================
-- ESTATÍSTICAS
-- ====================

-- Resumo rápido de todos os chamados
SELECT * FROM estatisticas_resumo;

-- Chamados por status
SELECT 
    status,
    COUNT(*) as total,
    COUNT(*) * 100.0 / SUM(COUNT(*)) OVER () as percentual
FROM chamados
GROUP BY status
ORDER BY total DESC;

-- Chamados por hora do dia
SELECT 
    EXTRACT(HOUR FROM horario_abertura) as hora,
    COUNT(*) as total_chamados
FROM chamados
GROUP BY hora
ORDER BY hora;

-- Chamados dentro vs fora do expediente
SELECT 
    CASE 
        WHEN dentro_expediente THEN 'Dentro do Expediente'
        ELSE 'Fora do Expediente'
    END as periodo,
    COUNT(*) as total,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentual
FROM chamados
GROUP BY dentro_expediente;

-- ====================
-- ANÁLISE TEMPORAL
-- ====================

-- Chamados por dia da semana
SELECT 
    TO_CHAR(horario_abertura, 'Day') as dia_semana,
    COUNT(*) as total
FROM chamados
GROUP BY dia_semana, EXTRACT(DOW FROM horario_abertura)
ORDER BY EXTRACT(DOW FROM horario_abertura);

-- Chamados dos últimos 7 dias
SELECT 
    DATE(horario_abertura) as data,
    COUNT(*) as total_chamados,
    COUNT(*) FILTER (WHERE status = 'finalizado') as finalizados,
    COUNT(*) FILTER (WHERE status = 'cancelado') as cancelados
FROM chamados
WHERE horario_abertura >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY data
ORDER BY data DESC;

-- Média de chamados por dia
SELECT 
    ROUND(AVG(chamados_dia), 2) as media_chamados_dia
FROM (
    SELECT DATE(horario_abertura) as data, COUNT(*) as chamados_dia
    FROM chamados
    GROUP BY data
) as subquery;

-- ====================
-- TEMPO DE ATENDIMENTO
-- ====================

-- Tempo médio de atendimento (para chamados finalizados)
SELECT 
    AVG(horario_finalizacao - horario_abertura) as tempo_medio,
    MIN(horario_finalizacao - horario_abertura) as tempo_minimo,
    MAX(horario_finalizacao - horario_abertura) as tempo_maximo
FROM chamados
WHERE status = 'finalizado' AND horario_finalizacao IS NOT NULL;

-- Top 10 chamados mais demorados
SELECT 
    id,
    nome_contato,
    numero_whatsapp,
    horario_abertura,
    horario_finalizacao,
    horario_finalizacao - horario_abertura as duracao
FROM chamados
WHERE status = 'finalizado' AND horario_finalizacao IS NOT NULL
ORDER BY duracao DESC
LIMIT 10;

-- ====================
-- ANÁLISE DE CONTATOS
-- ====================

-- Contatos com mais chamados
SELECT 
    numero_whatsapp,
    nome_contato,
    COUNT(*) as total_chamados,
    COUNT(*) FILTER (WHERE status = 'finalizado') as finalizados,
    MAX(horario_abertura) as ultimo_contato
FROM chamados
GROUP BY numero_whatsapp, nome_contato
ORDER BY total_chamados DESC
LIMIT 20;

-- Chamados de um contato específico
-- (Substitua '5511999999999@c.us' pelo número desejado)
SELECT * FROM chamados
WHERE numero_whatsapp = '5511999999999@c.us'
ORDER BY horario_abertura DESC;

-- ====================
-- MENSAGENS
-- ====================

-- Total de mensagens por chamado
SELECT 
    c.id,
    c.nome_contato,
    c.numero_whatsapp,
    c.status,
    COUNT(m.id) as total_mensagens
FROM chamados c
LEFT JOIN mensagens_chat m ON c.id = m.chamado_id
GROUP BY c.id, c.nome_contato, c.numero_whatsapp, c.status
ORDER BY total_mensagens DESC;

-- Histórico completo de um chamado
-- (Substitua 'ID_DO_CHAMADO' pelo UUID desejado)
SELECT 
    tipo_mensagem,
    mensagem,
    timestamp
FROM mensagens_chat
WHERE chamado_id = 'ID_DO_CHAMADO'
ORDER BY timestamp ASC;

-- Mensagens enviadas vs recebidas
SELECT 
    tipo_mensagem,
    COUNT(*) as total
FROM mensagens_chat
GROUP BY tipo_mensagem;

-- ====================
-- LIMPEZA E MANUTENÇÃO
-- ====================

-- Deletar chamados antigos (mais de 90 dias)
-- ⚠️ CUIDADO: Esta query apaga dados permanentemente!
-- DELETE FROM chamados 
-- WHERE horario_abertura < CURRENT_DATE - INTERVAL '90 days'
-- AND status IN ('finalizado', 'cancelado');

-- Arquivar chamados finalizados (criar tabela de arquivo primeiro)
-- CREATE TABLE chamados_arquivo AS SELECT * FROM chamados WHERE 1=0;

-- INSERT INTO chamados_arquivo
-- SELECT * FROM chamados
-- WHERE status = 'finalizado' 
-- AND horario_finalizacao < CURRENT_DATE - INTERVAL '30 days';

-- ====================
-- RELATÓRIOS
-- ====================

-- Relatório completo do dia
SELECT 
    COUNT(*) as total_chamados,
    COUNT(*) FILTER (WHERE status = 'aguardando') as aguardando,
    COUNT(*) FILTER (WHERE status = 'em_atendimento') as em_atendimento,
    COUNT(*) FILTER (WHERE status = 'finalizado') as finalizados,
    COUNT(*) FILTER (WHERE status = 'cancelado') as cancelados,
    COUNT(*) FILTER (WHERE dentro_expediente = true) as dentro_expediente,
    COUNT(*) FILTER (WHERE dentro_expediente = false) as fora_expediente
FROM chamados
WHERE DATE(horario_abertura) = CURRENT_DATE;

-- Relatório mensal
SELECT 
    TO_CHAR(horario_abertura, 'YYYY-MM') as mes,
    COUNT(*) as total_chamados,
    COUNT(*) FILTER (WHERE status = 'finalizado') as finalizados,
    COUNT(*) FILTER (WHERE dentro_expediente = true) as dentro_expediente,
    ROUND(AVG(EXTRACT(EPOCH FROM (horario_finalizacao - horario_abertura))/60), 2) as tempo_medio_minutos
FROM chamados
GROUP BY mes
ORDER BY mes DESC;

-- ====================
-- BUSCA AVANÇADA
-- ====================

-- Buscar chamado por nome ou número
SELECT * FROM chamados
WHERE nome_contato ILIKE '%NOME%'
   OR numero_whatsapp LIKE '%NUMERO%'
ORDER BY horario_abertura DESC;

-- Buscar mensagens contendo texto específico
SELECT 
    c.id,
    c.nome_contato,
    c.numero_whatsapp,
    m.mensagem,
    m.timestamp
FROM mensagens_chat m
JOIN chamados c ON m.chamado_id = c.id
WHERE m.mensagem ILIKE '%TEXTO_BUSCA%'
ORDER BY m.timestamp DESC;

-- ====================
-- PERFORMANCE
-- ====================

-- Verificar tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- ====================
-- AUDITORIA
-- ====================

-- Últimas alterações de status
SELECT 
    id,
    nome_contato,
    numero_whatsapp,
    status,
    horario_abertura,
    updated_at,
    updated_at - horario_abertura as tempo_ate_ultima_atualizacao
FROM chamados
ORDER BY updated_at DESC
LIMIT 20;

-- ====================
-- EXPORTAÇÃO
-- ====================

-- Exportar para CSV (use o botão "Download CSV" no Supabase)
-- Esta query prepara os dados para exportação
SELECT 
    TO_CHAR(horario_abertura, 'DD/MM/YYYY HH24:MI') as data_hora,
    nome_contato,
    numero_whatsapp,
    status,
    CASE WHEN dentro_expediente THEN 'Sim' ELSE 'Não' END as expediente,
    TO_CHAR(horario_finalizacao, 'DD/MM/YYYY HH24:MI') as finalizado_em,
    EXTRACT(EPOCH FROM (horario_finalizacao - horario_abertura))/60 as duracao_minutos
FROM chamados
ORDER BY horario_abertura DESC;

