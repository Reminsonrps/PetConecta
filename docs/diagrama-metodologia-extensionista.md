# Diagrama da Metodologia do Projeto (Kanban e validação via Google Forms)

```mermaid
flowchart LR
 subgraph BKL["Backlog"]
        A["Levantamento do setor de aplicação<br>10 dias"]
  end
 subgraph PLN["Planejado"]
        B["Levantamento de requisitos<br>7 dias"]
        C["Análise dos requisitos<br>6 dias"]
  end
 subgraph AND["Em andamento"]
      D["Versão navegável<br>8 dias"]
        E["Implementação e integração tecnológica<br>28 dias"]
  end
 subgraph VAL["Em validação"]
        F["Testes funcionais, usabilidade e acessibilidade<br>14 dias"]
        G["Publicação e demonstração<br>7 dias"]
        H["Coleta de feedback comunitário<br>14 dias"]
        I["Análise das respostas<br>5 dias"]
  end
 subgraph CON["Concluído"]
        J["Refinamento e evidências finais<br>8 dias"]
  end
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    I -- s16 --> C
    I -- s17 --> J
    CON --> n1["Preenchimento do relatório 1 dia"]
    n1 --> n2(("Fim do projeto"))
    n3(("Inicio do projeto")) --> BKL

     A:::backlog
     B:::planejado
     C:::planejado
     D:::andamento
     E:::andamento
     F:::validacao
     G:::validacao
     H:::validacao
     I:::validacao
     J:::concluido
    classDef inicio fill:#f0fdfa,stroke:#2dd4bf,color:#111
    classDef backlog fill:#f5f5f5,stroke:#616161,color:#111
    classDef planejado fill:#fff3cd,stroke:#b58105,color:#111
    classDef andamento fill:#d9edf7,stroke:#31708f,color:#111
    classDef validacao fill:#dff0d8,stroke:#3c763d,color:#111
    classDef concluido fill:#e2e3e5,stroke:#343a40,color:#111
```

## Versão textual curta (para colar no DOCX)

Backlog: levantamento do setor de aplicação -> Planejado: levantamento e análise de requisitos -> Em andamento: versão navegável e implementação -> Em validação: testes, publicação, feedback e análise -> Concluído: refinamento e evidências finais (107 dias).
