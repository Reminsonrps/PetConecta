# Diagrama da Metodologia do Projeto (Kanban e validação via Google Forms)

```mermaid
flowchart TD
    A[Diagnóstico do problema  7 dias] --> B[Objetivos e escopo  5 dias]
    B --> C[Planejamento: WBS, recursos, riscos e qualidade  10 dias]
    C --> D[Requisitos e modelagem  14 dias]
    D --> E[Implementação do protótipo  28 dias]
    E --> F[Testes funcionais, usabilidade e acessibilidade  14 dias]
    F --> G[Publicação e demonstração  7 dias]
    G --> H[Coleta de feedback comunitário  14 dias]
    H --> I[Análise das respostas  5 dias]
    I --> J[Refinamento e evidências finais  8 dias]

    I -- Necessita melhorias --> C
    I -- Objetivos atendidos --> J
```

## Versão textual curta (para colar no DOCX)

Diagnóstico do problema -> Objetivos e escopo -> Planejamento -> Requisitos e modelagem -> Implementação -> Testes -> Publicação -> Coleta de feedback -> Análise -> Refinamento e evidências finais.
