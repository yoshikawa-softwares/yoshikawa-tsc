# >_ Yoshikawa TSC — site oficial

Site institucional estático da Yoshikawa TSC, criado e mantido por >_ Yshk.

**Site:** https://yoshikawa-softwares.github.io/yoshikawa-tsc/

## Páginas

- `index.html`: apresentação, demonstrações de recursos, benefícios, ecossistema e perguntas frequentes.
- `devs.html`: stack técnica.
- `creditos.html`: autoria, base e tecnologias.
- `termos.html`: condições de uso.
- `privacidade.html`: informações de privacidade do site e do bot.
- `404.html`: página de erro.

## Desenvolvimento

HTML, CSS e JavaScript nativos, sem instalação ou compilação. Sirva a pasta com `python3 -m http.server 8080` e abra `http://localhost:8080`. Execute `python3 scripts/check_site.py` para conferir a integridade estática (requer Node.js para validar a sintaxe do JavaScript).

Animações respeitam `prefers-reduced-motion`. Navegação móvel acessível, abas com setas/Home/End, FAQ nativo e cópia de comandos com mensagem alternativa quando a área de transferência não está disponível. Transições entre páginas são progressivas e dependem do suporte do navegador.

## Publicação

GitHub Pages: Deploy from a branch → `main` → `/ (root)`. A publicação acompanha os commits em `main`. O arquivo `.nojekyll` desativa o processamento Jekyll.

## Conteúdo

Links e stack conferidos nas configurações e documentação do projeto em 26/10/2026. Benefícios baseados nas regras de nível da mesma data. Termos e privacidade adaptados ao funcionamento documentado. Atualize as páginas quando as condições do serviço mudarem. Prévias são ilustrativas e não conectam ao bot.

Este repositório contém somente o site público. O código do bot, bancos de dados, sessões e credenciais não fazem parte dele. A base YukiBot-MD, de iamDestroy, é creditada no site; componentes de terceiros preservam suas próprias licenças.
