"""Gera V4__seed_porto_seguro.sql — uso local, não commitar se desejado."""
from datetime import datetime

BCRYPT = r"$2b$10$VkQrY3R27IAs9PLE8hKNGepOpHnTgRpE/SIWtfm5vNb8itLccwVW6"

BAIRROS = [
    ("Centro", -16.4518583, -39.0642655, "Alameda dos Coqueiros"),
    ("Tancredo Neves", -16.4362000, -39.0584000, "Rua da Paz"),
    ("Cambolo", -16.4548000, -39.0712000, "Avenida Beira Mar"),
    ("Fontana", -16.4285000, -39.0548000, "Rua das Palmeiras"),
    ("Barrancos", -16.4612000, -39.0785000, "Travessa dos Pescadores"),
    ("Taperapua", -16.4478000, -39.0512000, "Avenida Portugal"),
    ("Baixo Mundai", -16.4521000, -39.0824000, "Rua do Porto"),
    ("Alto Mundai", -16.4489000, -39.0861000, "Rua Monte Pascoal"),
    ("Cidade Baiana", -16.4392000, -39.0728000, "Largo do Pelourinho"),
    ("Pequi", -16.4685000, -39.0912000, "Estrada do Arraial"),
    ("Village", -16.4268000, -39.0485000, "Rua das Flores"),
    ("Tabapiri", -16.4335000, -39.0642000, "Rua Tabapiri"),
    ("Vera Cruz", -16.4456000, -39.0758000, "Avenida Vera Cruz"),
    ("Paraiso dos Pataxos", -16.4318000, -39.0695000, "Aldeia Pataxo"),
    ("Outeiro da Gloria", -16.4428000, -39.0615000, "Rua Outeiro da Gloria"),
]

USERS = [
    ("Maria Silva", "maria.silva.ps@email.com"),
    ("Joao Santos", "joao.santos.ps@email.com"),
    ("Ana Costa", "ana.costa.ps@email.com"),
    ("Carlos Oliveira", "carlos.oliveira.ps@email.com"),
    ("Fernanda Lima", "fernanda.lima.ps@email.com"),
    ("Roberto Alves", "roberto.alves.ps@email.com"),
    ("Juliana Rocha", "juliana.rocha.ps@email.com"),
    ("Pedro Mendes", "pedro.mendes.ps@email.com"),
    ("Luciana Ferreira", "luciana.ferreira.ps@email.com"),
    ("Marcos Pereira", "marcos.pereira.ps@email.com"),
    ("Patricia Souza", "patricia.souza.ps@email.com"),
    ("Ricardo Barbosa", "ricardo.barbosa.ps@email.com"),
]

ORGAOS = [
    ("b2000001-0000-4000-8000-000000000001", "Secretaria de Obras e Infraestrutura", "SOI", 72, ["VIARIO", "TRANSITO"]),
    ("b2000001-0000-4000-8000-000000000002", "Companhia de Iluminacao Publica", "CIP", 48, ["ILUMINACAO"]),
    ("b2000001-0000-4000-8000-000000000003", "Empresa de Saneamento Basico", "ESB", 24, ["SANEAMENTO"]),
    ("b2000001-0000-4000-8000-000000000004", "Secretaria de Limpeza Urbana", "SLU", 48, ["LIMPEZA"]),
    ("b2000001-0000-4000-8000-000000000005", "Defesa Civil Municipal", "DCM", 12, ["TRANSITO"]),
]

CAT_ORGAO = {
    "VIARIO": "b2000001-0000-4000-8000-000000000001",
    "TRANSITO": "b2000001-0000-4000-8000-000000000001",
    "ILUMINACAO": "b2000001-0000-4000-8000-000000000002",
    "SANEAMENTO": "b2000001-0000-4000-8000-000000000003",
    "LIMPEZA": "b2000001-0000-4000-8000-000000000004",
}

OC_DATA = []
for item in [
    ("Buraco na via", "Buraco profundo na pista, motos desviando perigosamente.", "ALTA", "EM_ANDAMENTO", True, True),
    ("Calcada quebrada", "Calcada irregular proximo a escola municipal.", "MEDIA", "CONCLUIDO", False, False),
    ("Lixo em via publica", "Entulho de obra obstruindo meia faixa.", "BAIXA", "RECEBIDO", False, False),
    ("Buraco na via", "Cratera apos chuva forte na esquina.", "ALTA", "EM_ANALISE", True, True),
    ("Pavimento afundado", "Asfalto cedendo perto de bueiro.", "MEDIA", "CONCLUIDO", True, False),
    ("Buraco na via", "Buraco pequeno mas crescendo, risco a ciclistas.", "MEDIA", "RECEBIDO", True, False),
    ("Calcada quebrada", "Blocos soltos, idosos tropecam diariamente.", "BAIXA", "CANCELADO", False, True),
    ("Lixo em via publica", "Galhos e lixo apos poda de arvore.", "BAIXA", "CONCLUIDO", False, False),
    ("Buraco na via", "Buraco em cruzamento sem sinalizacao.", "ALTA", "ENCAMINHADO_EMERGENCIA", True, False),
    ("Pavimento afundado", "Trecho da via com afundamento leve.", "MEDIA", "EM_ANALISE", False, True),
]:
    OC_DATA.append(("VIARIO",) + item)

for item in [
    ("Poste apagado", "Poste sem iluminacao ha tres noites.", "MEDIA", "RECEBIDO", False, False),
    ("Lampada piscando", "Luz piscando, incomoda moradores.", "BAIXA", "EM_ANALISE", False, True),
    ("Poste apagado", "Trecho escuro proximo a praia.", "ALTA", "EM_ANDAMENTO", True, False),
    ("Poste danificado", "Poste inclinado apos vento forte.", "ALTA", "CONCLUIDO", True, False),
    ("Lampada piscando", "Falha intermitente em avenida principal.", "MEDIA", "CONCLUIDO", False, False),
    ("Poste apagado", "Iluminacao falha em beco de acesso.", "MEDIA", "RECEBIDO", False, True),
    ("Poste apagado", "Area sem luz, relatos de assaltos.", "ALTA", "ENCAMINHADO_EMERGENCIA", True, True),
    ("Lampada piscando", "Lampada queimada parcialmente.", "BAIXA", "CANCELADO", False, False),
    ("Poste apagado", "Poste apagado em frente a UBS.", "MEDIA", "CONCLUIDO", False, False),
    ("Poste danificado", "Fios expostos no poste.", "ALTA", "EM_ANALISE", True, False),
]:
    OC_DATA.append(("ILUMINACAO",) + item)

for item in [
    ("Vazamento de agua", "Vazamento na calcada, agua correndo.", "MEDIA", "EM_ANDAMENTO", False, True),
    ("Esgoto a ceu aberto", "Mau cheiro e agua servida na rua.", "ALTA", "EM_ANALISE", True, True),
    ("Vazamento de agua", "Cano rompido, desperdicio de agua.", "MEDIA", "CONCLUIDO", False, False),
    ("Bueiro entupido", "Alagamento quando chove forte.", "ALTA", "RECEBIDO", True, True),
    ("Vazamento de agua", "Infiltracao proximo a rede de agua.", "BAIXA", "CONCLUIDO", False, False),
    ("Esgoto a ceu aberto", "Esgoto transbordando em via residencial.", "ALTA", "ENCAMINHADO_EMERGENCIA", True, False),
    ("Vazamento de agua", "Vazamento pequeno mas constante.", "BAIXA", "RECEBIDO", False, True),
    ("Bueiro entupido", "Bueiro sem tampa, risco a pedestres.", "ALTA", "EM_ANDAMENTO", True, False),
    ("Esgoto a ceu aberto", "Problema recorrente no mesmo ponto.", "MEDIA", "CONCLUIDO", False, True),
    ("Vazamento de agua", "Agua jorrando de hidrometro.", "MEDIA", "EM_ANALISE", False, False),
]:
    OC_DATA.append(("SANEAMENTO",) + item)

for item in [
    ("Semaforo defeituoso", "Semaforo apagado em cruzamento movimentado.", "ALTA", "EM_ANDAMENTO", True, False),
    ("Sinalizacao apagada", "Placa de pare sumiu apos acidente.", "ALTA", "RECEBIDO", True, False),
    ("Semaforo defeituoso", "Tempo verde muito curto, filas enormes.", "MEDIA", "CONCLUIDO", False, False),
    ("Faixa de pedestre apagada", "Faixa invisivel, pedestres em risco.", "MEDIA", "EM_ANALISE", True, True),
    ("Sinalizacao apagada", "Sinal de limite de velocidade danificado.", "BAIXA", "CONCLUIDO", False, False),
    ("Semaforo defeituoso", "Semaforo piscando amarelo ha dias.", "MEDIA", "RECEBIDO", False, True),
    ("Acidente na via", "Colisao leve, necessidade de apoio.", "ALTA", "ENCAMINHADO_EMERGENCIA", True, False),
    ("Faixa de pedestre apagada", "Repintura necessaria em avenida.", "BAIXA", "CANCELADO", False, False),
]:
    OC_DATA.append(("TRANSITO",) + item)

for item in [
    ("Entulho abandonado", "Entulho de construcao na calcada.", "MEDIA", "RECEBIDO", False, False),
    ("Mato alto em praca", "Praca com vegetacao alta, foco de dengue.", "MEDIA", "EM_ANALISE", False, True),
    ("Lixo acumulado", "Lixo domestico acumulado em terreno baldio.", "ALTA", "EM_ANDAMENTO", True, True),
    ("Entulho abandonado", "Materiais obstruindo passeio publico.", "BAIXA", "CONCLUIDO", False, False),
    ("Mato alto em praca", "Capina necessaria em area de lazer.", "BAIXA", "CONCLUIDO", False, False),
    ("Lixo acumulado", "Coleta irregular, mau cheiro forte.", "MEDIA", "RECEBIDO", False, True),
    ("Entulho abandonado", "Entulho proximo a creche.", "ALTA", "ENCAMINHADO_EMERGENCIA", True, False),
    ("Mato alto em praca", "Grama alta em canteiro central.", "BAIXA", "EM_ANALISE", False, False),
    ("Lixo acumulado", "Sacolas e restos de feira livre.", "MEDIA", "CONCLUIDO", False, True),
    ("Entulho abandonado", "Restos de reforma na via.", "MEDIA", "CONCLUIDO", False, False),
    ("Mato alto em praca", "Mato encobrindo placa de sinalizacao.", "MEDIA", "RECEBIDO", False, False),
    ("Lixo acumulado", "Lixo perto de ponto de onibus.", "ALTA", "EM_ANDAMENTO", True, False),
]:
    OC_DATA.append(("LIMPEZA",) + item)

assert len(OC_DATA) == 50

NULL_ORGAO_IDX = {6, 17, 28, 39, 45}

STATUS_CHAINS = {
    "RECEBIDO": [("RECEBIDO", "RECEBIDO", "Registro inicial")],
    "EM_ANALISE": [
        ("RECEBIDO", "RECEBIDO", "Registro inicial"),
        ("RECEBIDO", "EM_ANALISE", "Triagem automatica pela IA"),
    ],
    "EM_ANDAMENTO": [
        ("RECEBIDO", "RECEBIDO", "Registro inicial"),
        ("RECEBIDO", "EM_ANALISE", "Encaminhado ao orgao responsavel"),
        ("EM_ANALISE", "EM_ANDAMENTO", "Equipe em campo"),
    ],
    "CONCLUIDO": [
        ("RECEBIDO", "RECEBIDO", "Registro inicial"),
        ("RECEBIDO", "EM_ANALISE", "Triagem concluida"),
        ("EM_ANALISE", "EM_ANDAMENTO", "Servico iniciado"),
        ("EM_ANDAMENTO", "CONCLUIDO", "Problema resolvido"),
    ],
    "ENCAMINHADO_EMERGENCIA": [
        ("RECEBIDO", "RECEBIDO", "Registro inicial"),
        ("RECEBIDO", "ENCAMINHADO_EMERGENCIA", "Encaminhado SAMU/Bombeiros/Policia conforme urgencia"),
    ],
    "CANCELADO": [
        ("RECEBIDO", "RECEBIDO", "Registro inicial"),
        ("RECEBIDO", "CANCELADO", "Chamado duplicado ou informacao insuficiente"),
    ],
}

lines = [
    "-- V4__seed_porto_seguro.sql",
    "-- SEED DEMO PORTO SEGURO - NAO USAR EM PRODUCAO",
    "-- 50 ocorrencias simuladas para pagina de IA / ciencia de dados",
    "-- Coordenadas de referencia: OpenStreetMap / GuiaMapa (Porto Seguro, BA)",
    "",
    "-- ========== USUARIOS (senha dev: senha123) ==========",
]

for i, (nome, email) in enumerate(USERS, 1):
    uid = f"a1000001-0000-4000-8000-{i:012d}"
    lines.append(
        f"INSERT INTO tb_usuario (id, nome, email, senha_hash, tipo, criado_em, ativo) "
        f"VALUES ('{uid}', '{nome}', '{email}', '{BCRYPT}', 'CIDADAO', NOW() - INTERVAL '{90 - i} days', true);"
    )
lines.append(
    f"INSERT INTO tb_usuario (id, nome, email, senha_hash, tipo, criado_em, ativo) "
    f"VALUES ('a1000001-0000-4000-8000-000000000013', 'Gestor Demo', 'gestor.demo@zurbi.ps.gov.br', "
    f"'{BCRYPT}', 'GESTOR', NOW() - INTERVAL '120 days', true);"
)
lines.append("")
lines.append("-- ========== ORGAOS ==========")

for oid, nome, sigla, prazo, _cats in ORGAOS:
    lines.append(
        f"INSERT INTO tb_orgao (id, nome, sigla, prazo_resolucao_horas) "
        f"VALUES ('{oid}', '{nome}', '{sigla}', {prazo});"
    )
lines.append("")
for oid, _n, _s, _p, cats in ORGAOS:
    for c in cats:
        lines.append(f"INSERT INTO tb_orgao_categorias (orgao_id, categoria) VALUES ('{oid}', '{c}');")
lines.append("")
lines.append("-- ========== OCORRENCIAS (50) ==========")

hist_lines = []
for idx, (cat, sub, desc, urg, status, risk, rec) in enumerate(OC_DATA):
    n = idx + 1
    oid_occ = f"c3000001-0000-4000-8000-{n:012d}"
    user_id = f"a1000001-0000-4000-8000-{(idx % 12) + 1:012d}"
    bairro, blat, blng, rua = BAIRROS[idx % len(BAIRROS)]
    lat = blat + (idx % 5) * 0.0012 - 0.002
    lng = blng + (idx % 7) * 0.0011 - 0.002
    protocolo = f"ZUR-2026-{n:04d}"
    if idx in NULL_ORGAO_IDX:
        orgao_sql = "NULL"
    elif cat == "TRANSITO" and status == "ENCAMINHADO_EMERGENCIA":
        orgao_sql = "'b2000001-0000-4000-8000-000000000005'"
    else:
        orgao_sql = f"'{CAT_ORGAO[cat]}'"
    days_ago = 5 + (idx * 17) % 85
    criado = f"NOW() - INTERVAL '{days_ago} days' - INTERVAL '{idx % 12} hours'"
    if status == "CONCLUIDO":
        resolvido_sql = f", {criado} + INTERVAL '{max(1, days_ago // 3)} days'"
    else:
        resolvido_sql = ", NULL"
    endereco = f"{rua}, {n % 500 + 1}, {bairro}"
    desc_esc = desc.replace("'", "''")
    sub_esc = sub.replace("'", "''")
    bairro_esc = bairro.replace("'", "''")
    lines.append(
        f"INSERT INTO tb_ocorrencia (id, protocolo, usuario_id, orgao_id, categoria, subcategoria, "
        f"descricao, urgencia, status, latitude, longitude, endereco_aproximado, bairro, risco_acidente, "
        f"recorrente, criado_em, resolvido_em) VALUES ("
        f"'{oid_occ}', '{protocolo}', '{user_id}', {orgao_sql}, '{cat}', '{sub_esc}', '{desc_esc}', "
        f"'{urg}', '{status}', {lat:.7f}, {lng:.7f}, '{endereco}', '{bairro_esc}', "
        f"{str(risk).lower()}, {str(rec).lower()}, {criado}{resolvido_sql});"
    )
    chain = STATUS_CHAINS[status]
    for step, (sa, sn, obs) in enumerate(chain):
        hid = f"d4000001-0000-4000-8000-{n * 10 + step:012d}"
        hist_lines.append(
            f"INSERT INTO tb_atualizacao_status (id, ocorrencia_id, status_anterior, status_novo, "
            f"observacao, atualizado_em) VALUES ("
            f"'{hid}', '{oid_occ}', '{sa}', '{sn}', '{obs}', {criado} + INTERVAL '{step} hours');"
        )

lines.append("")
lines.append("-- ========== HISTORICO DE STATUS ==========")
lines.extend(hist_lines)

out_path = "zurbi-backend/src/main/resources/db/migration/V4__seed_porto_seguro.sql"
with open(out_path, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")
print(f"OK: {out_path} ({len(lines)} lines)")
