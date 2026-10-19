# Suprimentos · Granja Brasília

Seis relatórios HTML integrados à CENTRAL e à API privada: Prazo de Pagamento, SLA de Compras, SLA de Solicitações e curvas ABC de Fornecedores, Compradores e Itens.

Os dados históricos e os cálculos ficam no PostgreSQL e na API `/api/suprimentos-html`. Este repositório contém somente a interface. Nenhuma planilha, PBIX, resposta operacional, senha ou token deve ser versionado.

## Uso

Abra pela CENTRAL para utilizar sua sessão. Os filtros têm pesquisa e seleção múltipla. Clique em descrições ou barras para filtrar a página; repita o clique ou use uma área vazia para retirar seleções visuais. O agrupamento por mês inclui o ano. As tabelas têm paginação, valores centralizados e rolagem pelo controle próprio no celular. Os gráficos mostram quatro barras por janela quando há pelo menos quatro períodos disponíveis.

Admin e Diretor têm alcance geral. Os demais usuários precisam da liberação do relatório e de alcance geral compatível com Suprimentos. Vínculos de vendedor ou supervisor comercial não são convertidos em compradores. Somente administradores acionam os robôs. A versão confirmada dos dados permanece disponível durante extração e tratamento.

## Desenvolvimento

Use um servidor estático local, por exemplo `python -m http.server 8130`. Consultas autenticadas dependem do portal e do Worker. Não crie outro login nem inclua Basic no navegador.

Validação: `python -m unittest discover -s tests -v`; `node --check assets/js/app.js` e demais scripts. Antes de publicar alterações em CSS/JS, execute `python tools/version_assets.py`. Conferir Chrome320/390/1366. As evidências operacionais e os testes autenticados ficam no ambiente privado.
