# Próxima versão do ScrapBook da Bia

Status: planejamento. Funcionalidades ainda não implementadas.

## Funcionalidades previstas

- Mais opções de moldura para fotos, com seleção de estilo e preservação nas memórias salvas.
- Carta interativa: um envelope/box que guarda texto e abre ao passar o mouse para leitura. Também deve abrir por toque em dispositivos móveis e por teclado, sem depender apenas do hover.

## Fluxo de desenvolvimento

- Desenvolver nesta branch `v2`.
- Manter `main` como versão publicada no GitHub Pages.
- Configurar uma prévia separada antes de testes visuais.
- Usar ambiente Supabase de desenvolvimento isolado; não testar gravações na base real da Bia. A configuração copiada da main ainda aponta para produção e deve ser substituída no ambiente de testes antes de utilizá-lo.
- Manter compatibilidade com as folhas e fotos existentes.
- Validar salvamento, autenticação, autorização, navegação e uso no celular.
- Abrir PR de `v2` para `main` quando as mudanças estiverem implementadas e testadas; revisar antes de incorporar e publicar.
