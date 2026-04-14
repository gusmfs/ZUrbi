# zUrbi - AI Context

## Visão Geral
O zUrbi é um sistema de gestão de serviços públicos que permite cidadãos registrarem solicitações urbanas e acompanharem seu atendimento.

## Objetivo
Melhorar a comunicação entre cidadãos e órgãos públicos, garantindo rastreabilidade e eficiência no atendimento.

## Perfis do sistema
- Cidadão: cria e acompanha solicitações
- Atendente: analisa e responde solicitações
- Gestor: monitora indicadores e desempenho

## Principais funcionalidades
- Cadastro de solicitações
- Acompanhamento de status
- Gestão de atendimentos
- Geração de indicadores

## Stack backend
- Java
- Arquitetura: Controller → Service → Repository
- Banco: relacional (PostgreSQL)

## Regras principais
- Toda solicitação deve ter um status
- Solicitações podem ser atualizadas apenas por atendentes
- Histórico de atendimento deve ser preservado