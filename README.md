# Suprimentos · Granja Brasília

Sete relatórios HTML integrados à CENTRAL e à API privada: Prazo de Pagamento, SLA de Compras, SLA de Solicitações, curvas ABC de Fornecedores, Compradores e Itens, e Indicador de Saving.

Os dados históricos e os cálculos ficam no PostgreSQL e na API `/api/suprimentos-html`. Este repositório contém somente a interface. Nenhuma planilha, PBIX, resposta operacional, senha ou token deve ser versionado.

## Uso

Abra pela CENTRAL para utilizar sua sessão. Os filtros têm pesquisa e seleção múltipla. Clique em descrições ou barras para filtrar a página; repita o clique ou use uma área vazia para retirar seleções visuais. O agrupamento por mês inclui o ano. As tabelas têm paginação, valores centralizados e rolagem pelo controle próprio no celular. Os gráficos mostram quatro barras por janela no celular quando há pelo menos quatro períodos disponíveis. Nas curvas ABC, clique no fornecedor ou comprador para abrir seus itens na própria tela; o segundo clique retira a seleção. Os itens têm paginação independente e também filtram a página. O gráfico de requisitantes apresenta a lista completa, ordenada pelas maiores contagens de OCs distintas.

Admin e Diretor têm alcance geral. Os demais usuários precisam da liberação do relatório e de alcance geral compatível com Suprimentos. Vínculos de vendedor ou supervisor comercial não são convertidos em compradores. O acionamento de robôs pela API é restrito a administradores; os controles de atualização não são exibidos nas telas dos relatórios. A versão confirmada dos dados permanece disponível durante extração e tratamento.

## Desenvolvimento

O Indicador de Saving está em `index.html?relatorio=saving`. Compara o preço unitário médio ponderado de cada item, unidade de medida e mês com a última nota até a data de referência, pesquisada em todas as empresas, unidades, fornecedores e compradores. Os preços usam a coluna Valor Unitário Item. A diferença da linha é unitária; o Saving total financeiro multiplica essa diferença pela quantidade comprada. Valores negativos indicam aumento de custo. A diferença percentual total é ponderada pela base de referência. Os filtros têm pesquisa, as diferenças permitem ordenação e o valor da última compra abre a nota completa. A tela informa a cobertura confirmada e o andamento da carga histórica desde 2020. A data utilizada para os meses e a referência é a entrada fiscal; a emissão também aparece nos detalhes.

Selecione um único item no filtro ou clique no código/descrição da tabela para abrir sua evolução de preço pago por dia, semana ou mês. O gráfico respeita os filtros da página e apresenta cada unidade de medida separadamente. Um segundo clique no item retira a seleção. Clique em uma barra para filtrar o período; repita o clique ou use “Retirar período” para restaurar. No celular, o histórico mostra quatro barras por janela quando há dados suficientes e move somente pela barra de controle.

Use um servidor estático local, por exemplo `python -m http.server 8130`. Consultas autenticadas dependem do portal e do Worker. Não crie outro login nem inclua Basic no navegador.

Validação: `python -m unittest discover -s tests -v`; `node --check assets/js/app.js` e demais scripts. Antes de publicar alterações em CSS/JS, execute `python tools/version_assets.py`. Conferir Chrome320/390/1366. As evidências operacionais e os testes autenticados ficam no ambiente privado.
