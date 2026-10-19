# API Suprimentos HTML

Prefixo `/api/suprimentos-html`, pelo Worker existente. O navegador envia somente Bearer da CENTRAL; a API revalida a identidade e o acesso ao relatório. Não há credencial de banco na interface.

- `GET /health`: revisão, fontes e páginas disponíveis.
- `GET /filtros?relatorio=...`: campos, período e autorização administrativa.
- `GET /opcoes?relatorio=...&campo=...&q=...`: pesquisa no contexto, até100opções.
- `GET /painel?relatorio=...`: indicadores integrais, séries, tabelas paginadas e complementos.
- `GET /catalogo` e `GET /dados/{fonte}`: catálogo e bases originais, somente Admin.
- `GET /robos`: robôs autorizados e execuções recentes, somente Admin.
- `POST /robos/{codigo}/executar`: fila de extração/tratamento/carga, somente Admin. Corpo opcional `inicio`/`fim` em AAAA-MM-DD. Devolve202 e identificador da execução; não executa navegador no Worker.

Parâmetros analíticos: `inicio`, `fim`, `ano`, `mes`, dimensões da página e respectivas exclusões `_exc`. Arrays usam parâmetros repetidos. Limite100seleções por campo; paginação de1a100linhas. `periodo=dia|semana|mes`. Nenhum total é calculado sobre um ranking ou página limitada.

Prazo: valores nominais; médias ponderadas por valor positivo, filtro de até130dias para PMP. SLA: dias úteis de segunda a sexta, excluindo a data inicial e incluindo a final; limite10dias para grupo53 e7 para demais. Contagem por chave solicitação/OC/item. ABC: valor líquido, ranking denso, empates compartilham percentual acumulado; limites80% e95%. Filtro por requisitante transfere o conjunto de OCs sem multiplicar valores por linhas de solicitações.

Os históricos de cada fonte permanecem disponíveis nas cargas versionadas. A data da última fonte é exibida separadamente do momento da carga. Erros de extração preservam a última revisão confirmada. A cobertura histórica de uma carga não pode diminuir silenciosamente.

O painel retorna `detalhes` com os títulos, notas e itens ou solicitações do mesmo recorte, conforme a tela. A paginação dos registros usa `detalhe_pagina`; a dos agrupamentos usa `pagina`. Ambas respeitam `tamanho` e devolvem contagem integral. Esses registros continuam disponíveis na API; o bloco adicional de conferência não é exibido nos relatórios.
