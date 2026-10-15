# Próxima versão do ScrapBook da Bia

Status: primeira implementação pronta para avaliação visual. Não publicada em produção.

## Implementado

- Cinco molduras: polaroid, rosa, vintage, rendinha e sem moldura. Clique em uma foto para mudar o estilo. Novas fotos usam a opção selecionada.
- Envelope com título e texto, criado e editado por diálogo. Abre ao passar o mouse e também por clique, toque e teclado.
- Sanitização permite apenas as marcações e classes necessárias às molduras/cartas. Estado de hover e seleção não é salvo.
- Prévia independente em preview.html, com dados fictícios em memória, sem Supabase e sem salvamento permanente.

## Antes do PR para produção

- Avaliar layout, molduras, fotos e cartas na prévia, no computador e no celular.
- Configurar Supabase de desenvolvimento em config.js. A branch v2 não contém o endereço ou chave do projeto real.
- Aplicar schema.sql uma única vez na base de desenvolvimento e criar uma conta de testes autorizada.
- Testar salvamento e reabertura de fotos, molduras e cartas; validar login e acesso negado a outra conta.
- Reconciliar config.js para implantação antes de incorporar: a configuração vazia de desenvolvimento não deve substituir a configuração de produção.
- Abrir PR de v2 para main após as verificações. main e GitHub Pages continuam sendo a versão entregue à Bia.
