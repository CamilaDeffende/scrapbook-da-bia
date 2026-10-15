# ScrapBook da Bia 🌷

Scrapbook pessoal com login por e-mail e senha, fontes, cores, adesivos, fotos e folhas diárias. Memórias salvas no Supabase, acessíveis pela conta autorizada da Bia.

## Uso

Publique os arquivos em uma hospedagem estática HTTPS ou abra index.html no navegador com acesso à internet. Entre com a conta autorizada criada no Supabase Auth. A senha nunca fica no código. O login é lembrado neste navegador, com renovação automática da sessão. Ao reabrir, o usuário e a autorização são validados novamente antes de mostrar as memórias. Use Sair da minha conta para encerrar o acesso no navegador.

## Salvamento e privacidade

- Login via Supabase Auth e autorização no banco por Row Level Security.
- Uma única conta cadastrada em scrapbook_owner pode ler e salvar as memórias.
- Chave pública em config.js; nenhuma chave secreta ou service_role no navegador.
- Salvamento automático após a edição; aguarde a indicação de confirmação antes de fechar a aba.
- Em falha de conexão, use Tentar salvar. O rascunho pendente fica somente na memória da aba.
- Revisões impedem a sobrescrita silenciosa quando duas sessões editam ao mesmo tempo.
- Fotos são reduzidas e armazenadas junto das folhas no JSONB privado. Limite total de 20 MB por scrapbook nesta versão.
- Importar folhas antigas funciona na origem do navegador em que foram criadas, após login. A importação não apaga as cópias locais antigas.

## Estrutura

index.html e app.js: interface e editor. cloud.js: login e sincronização. config.js: URL e chave pública. schema.sql: migração inicial aplicada uma única vez.

## Validação

Testes no banco confirmaram leitura/gravação da conta autorizada, bloqueio de outras contas e anônimos, e rejeição de revisão desatualizada. As gravações de teste foram revertidas. Testes simulados do cliente cobriram falta de configuração, login inválido, conta não autorizada, falha de leitura e conta autorizada. O login completo com a senha da Bia ainda requer teste pelo usuário.