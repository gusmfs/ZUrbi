# Arquitetura do Sistema

## Padrão adotado
Arquitetura em camadas:

- Controller: entrada HTTP
- Service: regras de negócio
- Repository: acesso ao banco

## Estrutura sugerida

com.zurbi
 ├── controller
 ├── service
 ├── repository
 ├── model
 ├── dto
 └── config

## Boas práticas
- Controllers não possuem lógica de negócio
- Services concentram regras
- Repositories apenas acessam dados
- Uso de DTOs para entrada e saída

## Fluxo padrão
Request → Controller → Service → Repository → Banco