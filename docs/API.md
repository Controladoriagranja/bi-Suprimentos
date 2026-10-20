# API Suprimentos HTML

Prefixo `/api/suprimentos-html`, pelo Worker existente. O navegador envia somente Bearer da CENTRAL; a API revalida a identidade e o acesso ao relatório. Não há credencial de banco na interface.

- `GET /health`: revisão, fontes e páginas disponíveis.
- `GET /filtros?relatorio=...`: campos, período e autorização administrativa.
- `GET /opcoes?relatorio=...&campo=...&q=...`: pesquisa no contexto, até100opções.
- `GET /painel?relatorio=...`: indicadores integrais, séries, tabelas paginadas e complementos.
- `GET /saving/compra/{compra_id}`: nota de referência completa, com todos os campos de negócio e itens paginados; exige o mesmo acesso ao relatório.
- `GET /catalogo` e `GET /dados/{fonte}`: catálogo e bases originais, somente Admin.
- `GET /robos`: robôs autorizados e execuções recentes, somente Admin.
- `POST /robos/{codigo}/executar`: fila de extração/tratamento/carga, somente Admin. Corpo opcional `inicio`/`fim` em AAAA-MM-DD. Devolve202 e identificador da execução; não executa navegador no Worker.

Parâmetros analíticos: `inicio`, `fim`, `ano`, `mes`, dimensões da página e respectivas exclusões `_exc`. Arrays usam parâmetros repetidos. Limite100seleções por campo; paginação de1a100linhas. `periodo=dia|semana|mes`. Nenhum total é calculado sobre um ranking ou página limitada.

Prazo: valores nominais; médias ponderadas por valor positivo, filtro de até130dias para PMP. SLA: dias úteis de segunda a sexta, excluindo a data inicial e incluindo a final; limite10dias para grupo53 e7 para demais. Contagem por chave solicitação/OC/item. ABC: valor líquido, ranking denso, empates compartilham percentual acumulado; limites80% e95%. Filtro por requisitante transfere o conjunto de OCs sem multiplicar valores por linhas de solicitações.

Os históricos de cada fonte permanecem disponíveis nas cargas versionadas. A data da última fonte é exibida separadamente do momento da carga. Erros de extração preservam a última revisão confirmada. A cobertura histórica de uma carga não pode diminuir silenciosamente.

Saving usa `relatorio=saving` e os filtros `tipo_sc`, `ano`, `mes`, `comprador`, `empresa`, `unidade`, `grupo_item`, `fornecedor`, `item_codigo`, `inicio`, `fim` e `referencia` (AAAA-MM-DD). A seleção inicial é o mês corrente e a referência é 31 de dezembro do ano anterior. A referência global não recebe os filtros das compras atuais e mantém o mesmo item e unidade de medida. `ordem=saving|percentual|item_codigo|quantidade|preco_atual|preco_referencia` e `direcao=asc|desc` ordenam a base inteira antes da paginação. Quantidades e preços não positivos são excluídos. Itens sem referência permanecem visíveis e são excluídos dos totais de diferenças. O percentual agregado é a soma dos savings dividida pela soma dos custos de referência, sem somar percentuais. `cobertura` e `historico` informam os dados confirmados e o progresso do backfill de 2020 a 2024; os dados de 2025 em diante seguem as cargas existentes. O inventário do PBIX continua documentando somente as seis páginas originais.

Com exatamente um `item_codigo` selecionado, Saving também retorna `evolucao` com o item, descrição e período, e `serie` com `data`, `um`, `preco`, `quantidade`, `valor` e contagem de registros. `periodo=dia|semana|mes` altera apenas o agrupamento do gráfico; as oito colunas e os totais de Saving permanecem mensais. O preço de cada ponto é ponderado pela quantidade no mesmo conjunto de compras filtrado, com semanas iniciadas na segunda-feira. Unidades de medida diferentes não são misturadas. A série cobre todo o recorte, independentemente da paginação da tabela. Sem item único, `evolucao` é nulo e a série fica vazia.

O painel retorna `detalhes` com os títulos, notas e itens ou solicitações do mesmo recorte, conforme a tela. A paginação dos registros usa `detalhe_pagina`; a dos agrupamentos usa `pagina`. Ambas respeitam `tamanho` e devolvem contagem integral. Esses registros continuam disponíveis na API; o bloco adicional de conferência não é exibido nos relatórios.

No SLA de Compras, o calendário usa a emissão da OC. Sem seleção de datas, o total também mantém solicitações sem OC, conforme a medida original; os períodos exibem somente OCs com data. O comprador e o grupo de gestão seguem o vínculo Dim_Comprador → notas fiscais → OC → solicitações. A relação usa pares distintos OC/comprador: várias notas ou itens não multiplicam solicitações, e uma OC pode estar vinculada a mais de um comprador. O total é calculado na base de solicitações e não pela soma dos grupos de comprador. O gráfico de compradores agrega todos os tipos; a tabela mantém comprador e tipo.

As curvas ABC retornam todos os requisitantes do contexto em `extras.requisitantes`, com nome disponível na fonte e contagem de OCs distintas, sem limitar o gráfico aos primeiros100. Ao selecionar um único fornecedor ou comprador, `extras.itens` devolve os itens agrupados por item/unidade, quantidade, valor, preço médio e participação no contexto. A paginação independente usa `itens_pagina` e o mesmo `tamanho`; todos os filtros continuam aplicados.

A contagem de ordens por requisitante usa a emissão da solicitação para o período e inclui OCs ainda sem nota fiscal. Quando há filtros de fornecedor, comprador, item, grupo, unidade, empresa ou tipo de compra, restringe as OCs pelas compras correspondentes. O filtro de requisitante e suas exclusões se aplicam diretamente à lista. OCs vazias ou com código zero não são ordens válidas. A pesquisa de requisitantes segue o mesmo contexto e permite encontrar pessoas com ordens ainda sem notas.

Saving usa Valor_Unitario_Item como preço tanto na referência quanto na média mensal e na evolução. O campo saving de cada linha é a diferença unitária; saving_total é a diferença multiplicada pela quantidade. totais.saving e seu percentual continuam financeiros e ponderados pela base de referência. valor_atual usa Valor_Item.

A tabela de Saving consulta um único mês: mes_consulta informa o mês resolvido (por padrão o mês corrente). Não replica o item por meses históricos. A interface usa seleção única de ano/mês. A serie de evolução ignora ano, mes, inicio e fim, preservando os filtros de item e demais dimensões; evolucao.inicio/fim informam a cobertura desse histórico. Unidades de medida são normalizadas para maiúsculas sem converter unidades distintas.

GET /saving/compras: notas que compõem o preço médio do mês, com os mesmos filtros da tabela, um item_codigo e um obrigatórios e pagina/tamanho. Retorna quantidade, preço unitário ponderado, valor dos itens e notas paginadas com compra_id para abrir /saving/compra/{compra_id}. Mantém autorização do relatório.
