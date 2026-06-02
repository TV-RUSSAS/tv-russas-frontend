# 📺 Portal de Notícias TV Russas

> O mais completo e moderno portal de notícias e colunismo de Russas, Ceará e toda a região do Vale do Jaguaribe. Construído sob uma arquitetura de alta performance de nível profissional e otimizações avançadas de SEO técnico.

---

## 📚 Documentação Técnica Oficial

O projeto TV Russas possui uma suíte documental completa projetada para auxiliar Engenheiros de Software, Integradores e Editores no entendimento total da arquitetura de código.

Os guias técnicos detalhados estão hospedados no repositório do backend. Clique nos links abaixo para acessar diretamente no GitHub:

1. 🏛️ **[Visão Geral e Arquitetura](https://github.com/TV-RUSSAS/tv-russas-backend/blob/main/docs/1_VISAO_GERAL_ARQUITETURA.md):** Visão de alto nível, stack de tecnologia (Next.js, Express, PostgreSQL) e componentes da rede.
2. 🗂️ **[Estrutura de Pastas](https://github.com/TV-RUSSAS/tv-russas-backend/blob/main/docs/2_ESTRUTURA_DE_PASTAS.md):** Mapa topológico de onde se localiza cada peça de código com foco nas responsabilidades de módulo.
3. 🎨 **[Frontend (React/Next.js)](https://github.com/TV-RUSSAS/tv-russas-backend/blob/main/docs/3_FRONTEND.md):** Como funcionam as rotas, Server Components, SEO avançado (Schema.org), renderização do portal e o design system nativo.
4. ⚙️ **[Backend e Banco de Dados](https://github.com/TV-RUSSAS/tv-russas-backend/blob/main/docs/4_BACKEND_BANCO_DADOS.md):** Detalhamento da API Express e modelagem de entidades relacionais no banco de dados com Prisma ORM.
5. 🛡️ **[Segurança e Autenticação](https://github.com/TV-RUSSAS/tv-russas-backend/blob/main/docs/5_SEGURANCA_AUTENTICACAO.md):** Explicação sobre Refresh Token Rotation, mitigação de DDoS com Rate Limiter e auditoria de ações anti-hack.
6. ✍️ **[Sistema Administrativo (CMS)](https://github.com/TV-RUSSAS/tv-russas-backend/blob/main/docs/6_SISTEMA_ADMINISTRATIVO.md):** Detalhes da plataforma da redação. Permissões de usuários, uploaders de mídia e manipulação de textos enriquecidos (Rich-Text).
7. 🚀 **[Como Rodar o Projeto e Troubleshooting](https://github.com/TV-RUSSAS/tv-russas-backend/blob/main/docs/7_GUIA_DESENVOLVIMENTO_MANUTENCAO.md):** O passo-a-passo para colocar o ecossistema no ar via localhost e a lista de Problemas Mais Frequentes do desenvolvedor (Erros com CAPTCHA e Vercel Images).
8. 📈 **[Fluxogramas e Melhorias Futuras](https://github.com/TV-RUSSAS/tv-russas-backend/blob/main/docs/8_FLUXOS_SISTEMA_MELHORIAS.md):** Diagramas (Mermaid) mostrando as etapas lógicas de renderização pelo Google e submissão da redação, visando escalabilidade milionária de acessos.

---

## 🚀 Tecnologias Essenciais Empregadas

* **Next.js 15 (App Router) + TypeScript**
* **Express (Node.js) + Prisma ORM**
* **PostgreSQL (Banco de Dados Relacional)**
* **TailwindCSS (Design System Responsivo)**
* **Docker & Docker Compose**

---

## 🛠️ Como Iniciar o Frontend Localmente

1. **Instalar Dependências:**

   ```bash
   npm install
   ```

2. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na pasta raiz do frontend com base no `.env.example` ou use suas variáveis de ambiente:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   ```

3. **Rodar em Modo de Desenvolvimento:**

   ```bash
   npm run dev
   ```

4. **Acessar a Aplicação:**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.
